import { useRef, useEffect } from "react";
import { Box } from "@mui/material";
import * as THREE from "three";
import {
  INPUT_GRID,
  INPUT_SPACING,
  INPUT_RADIUS,
  INPUT_X,
  INPUT_DIM_COLOR,
  INNER_LAYERS,
  SOFTMAX_COUNT,
  SOFTMAX_SPACING,
  SOFTMAX_RADIUS,
  SOFTMAX_X,
  SOFTMAX_COLOR,
  SOFTMAX_DIM_COLOR,
  DECISION_RADIUS,
  DECISION_X,
  DECISION_COLOR,
} from "../engine/cnnVizData";
import type { LayerVizData } from "../engine/types";

// ── Props ─────────────────────────────────────────────────────────

interface Props {
  inputPixels?: Float32Array | null;
  predictions?: number[] | null;
  weightDeltas?: LayerVizData[] | null;
  gradientMagnitudes?: LayerVizData[] | null;
  height?: number;
}

// ── Constants ─────────────────────────────────────────────────────

const LERP = 0.06;
const MOUSE_RANGE_Y = Math.PI / 5; // ±36° horizontal
const MOUSE_RANGE_X = Math.PI / 10; // ±18° vertical
const BASE_ROT_Y = -0.15; // slight initial horizontal angle
const BASE_ROT_X = 0.12; // slight downward tilt
const LINE_DIM = 0.04;
const LINE_BRIGHT = 0.22;

// ── Helpers ───────────────────────────────────────────────────────

function createTextSprite(
  text: string,
  color: string,
  fontSize = 24
): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.font = `600 ${fontSize}px 'Fira Code', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 32);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.0, 0.25, 1);
  return sprite;
}

/**
 * Connect input grid to target layer with region-based sampling.
 * Divides the input grid into one region per target node (matching target's
 * grid layout), samples a few positions from each region, and draws lines
 * from those positions to the corresponding target node.
 */
function connectInputToTargets(
  parent: THREE.Object3D,
  inputPositions: THREE.Vector3[],
  targetPositions: THREE.Vector3[],
  gridSize: number,
  targetGrid: [number, number], // [cols, rows]
  samplesPerRegion: number,
  opacity: number,
  color = 0xffffff
): THREE.LineBasicMaterial[] {
  const mats: THREE.LineBasicMaterial[] = [];
  const [tCols, tRows] = targetGrid;
  const regionH = gridSize / tRows;
  const regionW = gridSize / tCols;
  const sampleSide = Math.ceil(Math.sqrt(samplesPerRegion));

  for (let tr = 0; tr < tRows; tr++) {
    for (let tc = 0; tc < tCols; tc++) {
      const targetIdx = tr * tCols + tc;
      const target = targetPositions[targetIdx];
      const rowStart = Math.floor(tr * regionH);
      const colStart = Math.floor(tc * regionW);
      const rH = Math.floor(regionH);
      const rW = Math.floor(regionW);

      let count = 0;
      for (let sr = 0; sr < sampleSide && count < samplesPerRegion; sr++) {
        for (let sc = 0; sc < sampleSide && count < samplesPerRegion; sc++) {
          const row =
            rowStart +
            Math.min(
              Math.round(((sr + 0.5) * rH) / sampleSide),
              rH - 1
            );
          const col =
            colStart +
            Math.min(
              Math.round(((sc + 0.5) * rW) / sampleSide),
              rW - 1
            );
          const srcIdx = row * gridSize + col;
          const geo = new THREE.BufferGeometry().setFromPoints([
            inputPositions[srcIdx],
            target,
          ]);
          const mat = new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity,
          });
          parent.add(new THREE.Line(geo, mat));
          mats.push(mat);
          count++;
        }
      }
    }
  }
  return mats;
}

/** Evenly-spaced index selection from a 1D array */
function evenSpread(total: number, n: number): number[] {
  const step = total / n;
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(Math.floor(i * step));
  return out;
}

/** Fan-out: each target node gets a line from each source index */
function connectFanOut(
  parent: THREE.Object3D,
  from: THREE.Vector3[],
  to: THREE.Vector3[],
  srcIndices: number[],
  opacity: number,
  color = 0xffffff
): THREE.LineBasicMaterial[] {
  const mats: THREE.LineBasicMaterial[] = [];
  for (const target of to) {
    for (const si of srcIndices) {
      const geo = new THREE.BufferGeometry().setFromPoints([from[si], target]);
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
      });
      parent.add(new THREE.Line(geo, mat));
      mats.push(mat);
    }
  }
  return mats;
}

/** Connect similarly-sized layers — one line per node in the larger layer */
function connectLayers(
  parent: THREE.Object3D,
  from: THREE.Vector3[],
  to: THREE.Vector3[],
  opacity: number,
  color = 0xffffff
): THREE.LineBasicMaterial[] {
  const mats: THREE.LineBasicMaterial[] = [];
  const larger = from.length >= to.length ? from : to;
  const smaller = from.length >= to.length ? to : from;

  for (let i = 0; i < larger.length; i++) {
    const si = Math.floor((i / larger.length) * smaller.length);
    const f = from.length >= to.length ? from[i] : from[si];
    const t = from.length >= to.length ? to[si] : to[i];
    const geo = new THREE.BufferGeometry().setFromPoints([f, t]);
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
    });
    parent.add(new THREE.Line(geo, mat));
    mats.push(mat);
  }
  return mats;
}

// ── Component ─────────────────────────────────────────────────────

export function CnnViz3D({
  inputPixels,
  predictions,
  weightDeltas,
  gradientMagnitudes,
  height = 340,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const hoveredRef = useRef(false);

  const inputPixelsRef = useRef(inputPixels);
  const predictionsRef = useRef(predictions);
  const weightDeltasRef = useRef(weightDeltas);
  const gradientsRef = useRef(gradientMagnitudes);
  inputPixelsRef.current = inputPixels;
  predictionsRef.current = predictions;
  weightDeltasRef.current = weightDeltas;
  gradientsRef.current = gradientMagnitudes;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Scene ──────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(1, 1.5, 14);
    camera.lookAt(1, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 10, 8);
    scene.add(dirLight);
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-5, -3, -8);
    scene.add(backLight);

    // ── Pivot group: rotates entire model around scene center ──
    const pivot = new THREE.Group();
    pivot.position.set(1, 0, 0);
    pivot.rotation.order = "YXZ";
    scene.add(pivot);

    const world = new THREE.Group();
    world.position.set(-1, 0, 0);
    pivot.add(world);

    const dummy = new THREE.Object3D();
    const halfGrid = ((INPUT_GRID - 1) * INPUT_SPACING) / 2;
    const inputCount = INPUT_GRID * INPUT_GRID;

    // ── Input grid: 28×28 spheres in Y-Z plane ────────
    const inputGeo = new THREE.SphereGeometry(INPUT_RADIUS, 8, 6);
    const inputMat = new THREE.MeshStandardMaterial({
      roughness: 0.5,
      metalness: 0.1,
    });
    const inputMesh = new THREE.InstancedMesh(inputGeo, inputMat, inputCount);
    const dimColor = new THREE.Color(...INPUT_DIM_COLOR);
    const inputPositions: THREE.Vector3[] = [];

    for (let row = 0; row < INPUT_GRID; row++) {
      for (let col = 0; col < INPUT_GRID; col++) {
        const idx = row * INPUT_GRID + col;
        const pos = new THREE.Vector3(
          INPUT_X,
          ((INPUT_GRID - 1) / 2 - row) * INPUT_SPACING,
          (col - (INPUT_GRID - 1) / 2) * INPUT_SPACING
        );
        dummy.position.copy(pos);
        dummy.updateMatrix();
        inputMesh.setMatrixAt(idx, dummy.matrix);
        inputMesh.setColorAt(idx, dimColor);
        inputPositions.push(pos);
      }
    }
    inputMesh.instanceMatrix.needsUpdate = true;
    inputMesh.instanceColor!.needsUpdate = true;
    world.add(inputMesh);

    const inputLabel = createTextSprite("Input", "#888888");
    inputLabel.position.set(INPUT_X, halfGrid + 0.3, 0);
    world.add(inputLabel);

    // ── Inner layers: nodes in Y-Z planes ──────────────
    const innerMeshes: THREE.InstancedMesh[] = [];
    const innerMats: THREE.MeshStandardMaterial[] = [];
    const allLayerPositions: THREE.Vector3[][] = [inputPositions];

    for (const layer of INNER_LAYERS) {
      const geo = new THREE.SphereGeometry(layer.radius, 10, 8);
      const mat = new THREE.MeshStandardMaterial({
        color: layer.color,
        transparent: true,
        opacity: 0.6,
        emissive: new THREE.Color(layer.color),
        emissiveIntensity: 0,
        roughness: 0.4,
        metalness: 0.1,
      });

      const iMesh = new THREE.InstancedMesh(geo, mat, layer.nodeCount);
      const positions: THREE.Vector3[] = [];
      const [cols, rows] = layer.grid;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const pos = new THREE.Vector3(
            layer.xPos,
            ((rows - 1) / 2 - r) * layer.spacing,
            (c - (cols - 1) / 2) * layer.spacing
          );
          dummy.position.copy(pos);
          dummy.updateMatrix();
          iMesh.setMatrixAt(r * cols + c, dummy.matrix);
          positions.push(pos);
        }
      }

      iMesh.instanceMatrix.needsUpdate = true;
      world.add(iMesh);
      innerMeshes.push(iMesh);
      innerMats.push(mat);
      allLayerPositions.push(positions);

      const topY = ((rows - 1) / 2) * layer.spacing;
      const label = createTextSprite(
        layer.label,
        "#" + layer.color.toString(16).padStart(6, "0")
      );
      label.position.set(layer.xPos, topY + 0.25, 0);
      world.add(label);
    }

    // ── Softmax layer: 10 nodes in vertical column ────
    const smGeo = new THREE.SphereGeometry(SOFTMAX_RADIUS, 12, 8);
    const smMat = new THREE.MeshStandardMaterial({
      roughness: 0.4,
      metalness: 0.1,
    });
    const smMesh = new THREE.InstancedMesh(smGeo, smMat, SOFTMAX_COUNT);
    const smDimColor = new THREE.Color(...SOFTMAX_DIM_COLOR);
    const smPositions: THREE.Vector3[] = [];
    const smHalfH = ((SOFTMAX_COUNT - 1) * SOFTMAX_SPACING) / 2;

    for (let i = 0; i < SOFTMAX_COUNT; i++) {
      const pos = new THREE.Vector3(
        SOFTMAX_X,
        smHalfH - i * SOFTMAX_SPACING,
        0
      );
      dummy.position.copy(pos);
      dummy.updateMatrix();
      smMesh.setMatrixAt(i, dummy.matrix);
      smMesh.setColorAt(i, smDimColor);
      smPositions.push(pos);

      const digitLabel = createTextSprite(String(i), "#f97316", 18);
      digitLabel.position.set(SOFTMAX_X + 0.28, pos.y, 0);
      world.add(digitLabel);
    }
    smMesh.instanceMatrix.needsUpdate = true;
    smMesh.instanceColor!.needsUpdate = true;
    world.add(smMesh);
    allLayerPositions.push(smPositions);

    const smLabel = createTextSprite("Softmax", "#f97316");
    smLabel.position.set(SOFTMAX_X, smHalfH + 0.3, 0);
    world.add(smLabel);

    // ── Decision node ──────────────────────────────────
    const decGeo = new THREE.SphereGeometry(DECISION_RADIUS, 16, 12);
    const decMat = new THREE.MeshStandardMaterial({
      color: DECISION_COLOR,
      transparent: true,
      opacity: 0.2,
      emissive: new THREE.Color(DECISION_COLOR),
      emissiveIntensity: 0,
      roughness: 0.3,
      metalness: 0.1,
    });
    const decMesh = new THREE.Mesh(decGeo, decMat);
    const decPos = new THREE.Vector3(DECISION_X, 0, 0);
    decMesh.position.copy(decPos);
    world.add(decMesh);
    allLayerPositions.push([decPos]);

    const decLabel = createTextSprite("argmax", "#f97316", 18);
    decLabel.position.set(DECISION_X, 0.4, 0);
    world.add(decLabel);

    const decDigitSprites: THREE.Sprite[] = [];
    for (let i = 0; i < 10; i++) {
      const sprite = createTextSprite(String(i), "#ffffff", 32);
      sprite.position.set(DECISION_X, -0.4, 0);
      sprite.material.opacity = 0;
      world.add(sprite);
      decDigitSprites.push(sprite);
    }

    // ── Connection lines ───────────────────────────────
    const inputConvMats: THREE.LineBasicMaterial[] = [];
    const innerConnMats: THREE.LineBasicMaterial[][] = [];
    const denseSmMats: THREE.LineBasicMaterial[] = [];
    const smDecMats: THREE.LineBasicMaterial[] = [];

    // Input → Conv1: region-based (each conv node gets lines from its spatial region)
    inputConvMats.push(
      ...connectInputToTargets(
        world,
        inputPositions,
        allLayerPositions[1],
        INPUT_GRID,
        INNER_LAYERS[0].grid,
        4, // 4 samples per region = 32 lines total
        LINE_DIM
      )
    );

    // Inner pairs + dense→softmax
    for (let i = 1; i < allLayerPositions.length - 2; i++) {
      const from = allLayerPositions[i];
      const to = allLayerPositions[i + 1];

      if (i === allLayerPositions.length - 3) {
        // Dense → Softmax: sampled fan-out
        const samples = evenSpread(from.length, 8);
        denseSmMats.push(
          ...connectFanOut(world, from, to, samples, LINE_DIM)
        );
      } else {
        innerConnMats.push(connectLayers(world, from, to, LINE_DIM));
      }
    }

    // Softmax → Decision
    for (let j = 0; j < smPositions.length; j++) {
      const geo = new THREE.BufferGeometry().setFromPoints([
        smPositions[j],
        decPos,
      ]);
      const mat = new THREE.LineBasicMaterial({
        color: SOFTMAX_COLOR,
        transparent: true,
        opacity: LINE_DIM,
      });
      world.add(new THREE.Line(geo, mat));
      smDecMats.push(mat);
    }

    // ── Mouse interaction ──────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    const onMouseEnter = () => {
      hoveredRef.current = true;
    };
    const onMouseLeave = () => {
      hoveredRef.current = false;
    };
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);

    // ── Animation state ────────────────────────────────
    let isVisible = true;
    let currentRotY = BASE_ROT_Y;
    let currentRotX = BASE_ROT_X;
    const tempColor = new THREE.Color();
    const smOrange = new THREE.Color(SOFTMAX_COLOR);
    const innerGlow = new Float32Array(INNER_LAYERS.length);
    let decGlow = 0;
    let animId: number | null = null;
    const startTime = Date.now();

    function animate() {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      // ── Pivot rotation (mouse-follow or oscillation) ──
      if (hoveredRef.current) {
        const targetY =
          BASE_ROT_Y + mouseRef.current.x * MOUSE_RANGE_Y;
        const targetX =
          BASE_ROT_X - mouseRef.current.y * MOUSE_RANGE_X;
        currentRotY += (targetY - currentRotY) * LERP;
        currentRotX += (targetX - currentRotX) * LERP;
      } else {
        const t = (Date.now() - startTime) * 0.0004;
        const targetY = BASE_ROT_Y + Math.sin(t) * 0.2;
        currentRotY += (targetY - currentRotY) * LERP;
        currentRotX += (BASE_ROT_X - currentRotX) * LERP;
      }
      pivot.rotation.y = currentRotY;
      pivot.rotation.x = currentRotX;

      // ── Data refs ─────────────────────────────────────
      const pixels = inputPixelsRef.current;
      const preds = predictionsRef.current;
      const deltas = weightDeltasRef.current;
      const grads = gradientsRef.current;
      const hasPixels = !!(pixels && pixels.length === inputCount);
      const hasPreds = !!preds;

      // ── Input sphere colors ───────────────────────────
      for (let i = 0; i < inputCount; i++) {
        if (hasPixels) {
          const v = pixels![i];
          if (v > 0.05) {
            tempColor.setRGB(v, v, v);
          } else {
            tempColor.setRGB(...INPUT_DIM_COLOR);
          }
        } else {
          tempColor.setRGB(...INPUT_DIM_COLOR);
        }
        inputMesh.setColorAt(i, tempColor);
      }
      inputMesh.instanceColor!.needsUpdate = true;

      // ── Input → Conv1 connection lines ────────────────
      const inputLineTarget = hasPixels ? LINE_BRIGHT : LINE_DIM;
      for (const m of inputConvMats) {
        m.opacity += (inputLineTarget - m.opacity) * 0.08;
      }

      // ── Inner layer glow + connection lines ───────────
      for (let i = 0; i < INNER_LAYERS.length; i++) {
        let target = 0;
        const di = INNER_LAYERS[i].deltaIndex;
        if (deltas && di < deltas.length) {
          target = Math.max(target, deltas[di].magnitude);
        }
        if (grads && di < grads.length) {
          target = Math.max(target, grads[di].magnitude);
        }
        if (hasPreds) {
          target = Math.max(target, 0.3);
        }
        innerGlow[i] += (target - innerGlow[i]) * 0.08;
        innerMats[i].emissiveIntensity = innerGlow[i] * 1.5;
        innerMats[i].opacity = 0.6 + innerGlow[i] * 0.3;
      }

      const innerLineTarget =
        hasPreds || deltas ? LINE_BRIGHT : LINE_DIM;
      for (const group of innerConnMats) {
        for (const m of group) {
          m.opacity += (innerLineTarget - m.opacity) * 0.08;
        }
      }

      // ── Dense → Softmax lines ─────────────────────────
      const denseSmTarget = hasPreds ? LINE_BRIGHT : LINE_DIM;
      for (const m of denseSmMats) {
        m.opacity += (denseSmTarget - m.opacity) * 0.08;
      }

      // ── Softmax node colors ───────────────────────────
      let maxIdx = -1;
      let maxVal = 0;
      if (preds) {
        for (let i = 0; i < preds.length; i++) {
          if (preds[i] > maxVal) {
            maxVal = preds[i];
            maxIdx = i;
          }
        }
      }

      for (let i = 0; i < SOFTMAX_COUNT; i++) {
        if (preds && i < preds.length) {
          const c = preds[i];
          tempColor.setRGB(
            smOrange.r * (0.15 + c * 0.85),
            smOrange.g * (0.15 + c * 0.85),
            smOrange.b * (0.15 + c * 0.85)
          );
        } else {
          tempColor.setRGB(...SOFTMAX_DIM_COLOR);
        }
        smMesh.setColorAt(i, tempColor);
      }
      smMesh.instanceColor!.needsUpdate = true;

      // ── Softmax → Decision line opacity ───────────────
      for (let i = 0; i < smDecMats.length; i++) {
        const tgt =
          preds && i < preds.length
            ? preds[i] * 0.5 + 0.02
            : LINE_DIM;
        smDecMats[i].opacity += (tgt - smDecMats[i].opacity) * 0.08;
      }

      // ── Decision node ─────────────────────────────────
      const targetDecGlow = hasPreds ? 0.8 : 0;
      decGlow += (targetDecGlow - decGlow) * 0.08;
      decMat.emissiveIntensity = decGlow;
      decMat.opacity = 0.2 + decGlow * 0.6;

      for (let i = 0; i < 10; i++) {
        const tgt = i === maxIdx ? 1 : 0;
        decDigitSprites[i].material.opacity +=
          (tgt - decDigitSprites[i].material.opacity) * 0.12;
      }

      renderer.render(scene, camera);
    }

    animate();

    // ── Observers ──────────────────────────────────────
    const ioObs = new IntersectionObserver(
      ([e]) => {
        isVisible = e.isIntersecting;
      },
      { threshold: 0 }
    );
    ioObs.observe(container);

    const roObs = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    roObs.observe(container);

    // ── Cleanup ────────────────────────────────────────
    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
      ioObs.disconnect();
      roObs.disconnect();

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mt) => mt.dispose());
          } else {
            m.material?.dispose();
          }
        }
        if ((obj as THREE.Line).isLine) {
          const l = obj as THREE.Line;
          l.geometry?.dispose();
          (l.material as THREE.Material)?.dispose();
        }
        if ((obj as THREE.Sprite).isSprite) {
          const s = obj as THREE.Sprite;
          s.material.map?.dispose();
          s.material.dispose();
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      role="img"
      aria-label="CNN architecture visualization"
      sx={{
        width: "100%",
        height,
        borderRadius: 1,
        overflow: "hidden",
      }}
    />
  );
}
