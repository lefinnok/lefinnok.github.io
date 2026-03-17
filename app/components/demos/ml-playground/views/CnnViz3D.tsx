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
  OUTPUT_COUNT,
  OUTPUT_SPACING,
  OUTPUT_RADIUS,
  OUTPUT_X,
  OUTPUT_COLOR,
  OUTPUT_DELTA_INDEX,
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

// ── Sprite label helper ───────────────────────────────────────────

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

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.0, 0.25, 1);
  return sprite;
}

// ── Connection line helper ────────────────────────────────────────

function connectLayers(
  parent: THREE.Object3D,
  from: THREE.Vector3[],
  to: THREE.Vector3[],
  count: number,
  opacity: number
): THREE.LineBasicMaterial[] {
  const mats: THREE.LineBasicMaterial[] = [];
  for (let i = 0; i < count; i++) {
    const f = from[i % from.length];
    const t = to[i % to.length];
    const geo = new THREE.BufferGeometry().setFromPoints([f, t]);
    const mat = new THREE.LineBasicMaterial({
      color: 0xffffff,
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
  height = 300,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Store latest props in refs for animation loop
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
    camera.position.set(0, 0.2, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ── Lights ─────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const dummy = new THREE.Object3D();
    const halfGrid = ((INPUT_GRID - 1) * INPUT_SPACING) / 2;

    // ── Input grid: 28×28 InstancedMesh ───────────────
    const inputGeo = new THREE.SphereGeometry(INPUT_RADIUS, 8, 6);
    const inputMat = new THREE.MeshStandardMaterial({
      roughness: 0.5,
      metalness: 0.1,
    });
    const inputCount = INPUT_GRID * INPUT_GRID;
    const inputMesh = new THREE.InstancedMesh(inputGeo, inputMat, inputCount);
    const dimColor = new THREE.Color(...INPUT_DIM_COLOR);
    const inputPositions: THREE.Vector3[] = [];

    for (let row = 0; row < INPUT_GRID; row++) {
      for (let col = 0; col < INPUT_GRID; col++) {
        const idx = row * INPUT_GRID + col;
        const pos = new THREE.Vector3(
          INPUT_X + (col - (INPUT_GRID - 1) / 2) * INPUT_SPACING,
          ((INPUT_GRID - 1) / 2 - row) * INPUT_SPACING,
          0
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
    scene.add(inputMesh);

    // Input label
    const inputLabel = createTextSprite("Input", "#888888");
    inputLabel.position.set(INPUT_X, halfGrid + 0.3, 0);
    scene.add(inputLabel);

    // ── Inner layers ──────────────────────────────────
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
            layer.xPos + (c - (cols - 1) / 2) * layer.spacing,
            ((rows - 1) / 2 - r) * layer.spacing,
            0
          );
          dummy.position.copy(pos);
          dummy.updateMatrix();
          iMesh.setMatrixAt(r * cols + c, dummy.matrix);
          positions.push(pos);
        }
      }

      iMesh.instanceMatrix.needsUpdate = true;
      scene.add(iMesh);
      innerMeshes.push(iMesh);
      innerMats.push(mat);
      allLayerPositions.push(positions);

      // Label above layer
      const topY = ((rows - 1) / 2) * layer.spacing;
      const label = createTextSprite(
        layer.label,
        "#" + layer.color.toString(16).padStart(6, "0")
      );
      label.position.set(layer.xPos, topY + 0.25, 0);
      scene.add(label);
    }

    // ── Output: 10 spheres ────────────────────────────
    const outputGeo = new THREE.SphereGeometry(OUTPUT_RADIUS, 16, 12);
    const outputMeshes: THREE.Mesh[] = [];
    const outputMats: THREE.MeshStandardMaterial[] = [];
    const outputPositions: THREE.Vector3[] = [];

    for (let i = 0; i < OUTPUT_COUNT; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: OUTPUT_COLOR,
        transparent: true,
        opacity: 0.3,
        emissive: new THREE.Color(OUTPUT_COLOR),
        emissiveIntensity: 0,
        roughness: 0.3,
        metalness: 0.1,
      });
      const pos = new THREE.Vector3(
        OUTPUT_X,
        ((OUTPUT_COUNT - 1) / 2 - i) * OUTPUT_SPACING,
        0
      );
      const mesh = new THREE.Mesh(outputGeo, mat);
      mesh.position.copy(pos);
      scene.add(mesh);
      outputMeshes.push(mesh);
      outputMats.push(mat);
      outputPositions.push(pos);

      // Digit label
      const digitLabel = createTextSprite(String(i), "#f97316", 20);
      digitLabel.position.set(OUTPUT_X + 0.3, pos.y, 0);
      scene.add(digitLabel);
    }

    allLayerPositions.push(outputPositions);

    // Output label
    const outputLabel = createTextSprite("Output", "#f97316");
    outputLabel.position.set(
      OUTPUT_X,
      ((OUTPUT_COUNT - 1) / 2) * OUTPUT_SPACING + 0.35,
      0
    );
    scene.add(outputLabel);

    // ── Connection lines ──────────────────────────────
    // Between each adjacent pair of layers
    const outputLineMats: THREE.LineBasicMaterial[] = [];

    for (let i = 0; i < allLayerPositions.length - 1; i++) {
      const from = allLayerPositions[i];
      const to = allLayerPositions[i + 1];
      const count = Math.min(20, Math.max(from.length, to.length));
      // Last connection (dense→output) stored separately for opacity animation
      const isLastConnection = i === allLayerPositions.length - 2;
      const opacity = 0.04;

      if (isLastConnection) {
        // One line per output node
        for (let j = 0; j < to.length; j++) {
          const f = from[Math.floor((j / to.length) * from.length)];
          const geo = new THREE.BufferGeometry().setFromPoints([f, to[j]]);
          const mat = new THREE.LineBasicMaterial({
            color: OUTPUT_COLOR,
            transparent: true,
            opacity,
          });
          scene.add(new THREE.Line(geo, mat));
          outputLineMats.push(mat);
        }
      } else {
        connectLayers(scene, from, to, count, opacity);
      }
    }

    // ── Animation state ───────────────────────────────
    let isVisible = true;
    const tempColor = new THREE.Color();
    const outputGlow = new Float32Array(OUTPUT_COUNT);
    const outputScales = new Float32Array(OUTPUT_COUNT).fill(1);
    const innerGlow = new Float32Array(INNER_LAYERS.length);
    let animId: number | null = null;

    // ── Animation loop (no rotation) ──────────────────
    function animate() {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      // ── Update input sphere colors ──────────────────
      const pixels = inputPixelsRef.current;
      for (let i = 0; i < inputCount; i++) {
        if (pixels && pixels.length === inputCount) {
          const v = pixels[i];
          tempColor.setRGB(v, v, v);
        } else {
          tempColor.setRGB(...INPUT_DIM_COLOR);
        }
        inputMesh.setColorAt(i, tempColor);
      }
      inputMesh.instanceColor!.needsUpdate = true;

      // ── Update inner layer glow ─────────────────────
      const deltas = weightDeltasRef.current;
      const grads = gradientsRef.current;
      for (let i = 0; i < INNER_LAYERS.length; i++) {
        let target = 0;
        const di = INNER_LAYERS[i].deltaIndex;
        if (deltas && di < deltas.length) {
          target = Math.max(target, deltas[di].magnitude);
        }
        if (grads && di < grads.length) {
          target = Math.max(target, grads[di].magnitude);
        }
        // Also glow lightly when predictions exist (forward pass active)
        if (predictionsRef.current) {
          target = Math.max(target, 0.25);
        }
        innerGlow[i] += (target - innerGlow[i]) * 0.08;
        innerMats[i].emissiveIntensity = innerGlow[i] * 1.5;
        innerMats[i].opacity = 0.6 + innerGlow[i] * 0.3;
      }

      // ── Update output spheres ───────────────────────
      const preds = predictionsRef.current;
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

      for (let i = 0; i < OUTPUT_COUNT; i++) {
        let targetGlow = 0;
        let targetScale = 1;

        if (preds && i < preds.length) {
          targetGlow = preds[i];
          targetScale = 1 + preds[i] * 0.6;
        }

        // Training glow from weight deltas
        if (deltas && OUTPUT_DELTA_INDEX < deltas.length) {
          targetGlow = Math.max(targetGlow, deltas[OUTPUT_DELTA_INDEX].magnitude * 0.5);
        }

        outputGlow[i] += (targetGlow - outputGlow[i]) * 0.08;
        outputScales[i] += (targetScale - outputScales[i]) * 0.08;

        outputMats[i].emissiveIntensity = outputGlow[i] * 1.2;
        outputMats[i].opacity = 0.3 + outputGlow[i] * 0.6;

        const s = outputScales[i];
        outputMeshes[i].scale.set(s, s, s);

        if (i === maxIdx && preds) {
          outputMats[i].emissiveIntensity = Math.max(
            outputMats[i].emissiveIntensity,
            0.8
          );
        }
      }

      // ── Update output connection line opacity ───────
      for (let i = 0; i < outputLineMats.length; i++) {
        const targetOp = preds ? preds[i] * 0.5 + 0.03 : 0.04;
        outputLineMats[i].opacity +=
          (targetOp - outputLineMats[i].opacity) * 0.08;
      }

      renderer.render(scene, camera);
    }

    animate();

    // ── Observers ─────────────────────────────────────
    const intersectionObs = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    intersectionObs.observe(container);

    const resizeObs = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObs.observe(container);

    // ── Cleanup ───────────────────────────────────────
    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      intersectionObs.disconnect();
      resizeObs.disconnect();

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
