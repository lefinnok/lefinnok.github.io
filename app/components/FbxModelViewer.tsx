import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import * as THREE from "three";
import { FBXLoader } from "three-stdlib";
import { useReducedMotion } from "~/hooks/useReducedMotion";
import type { ProjectModelConfig } from "~/lib/types";

interface FbxModelViewerProps {
  config: ProjectModelConfig;
  width?: string | number;
  height?: string | number;
  autoRotate?: boolean;
  rotationSpeed?: number;
  hovered?: boolean;
  followMouse?: boolean;
}

const INITIAL_ROTATION = -Math.PI / 2; // -90 degrees
const LERP_SPEED = 0.08;
const MOUSE_TRACK_RANGE = Math.PI / 4; // max ±45deg offset from initial when tracking mouse

export function FbxModelViewer({
  config,
  width = "100%",
  height = 300,
  autoRotate = true,
  rotationSpeed = 0.005,
  hovered: externalHovered,
  followMouse = false,
}: FbxModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const localHoveredRef = useRef(false);
  const externalHoveredRef = useRef(externalHovered ?? false);
  // Normalized mouse position: -1 to 1 on each axis, relative to container center
  const mouseRef = useRef({ x: 0, y: 0 });
  const mouseInViewportRef = useRef(false);

  useEffect(() => {
    externalHoveredRef.current = externalHovered ?? false;
  }, [externalHovered]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, config.cameraY, config.cameraZ);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    let model: THREE.Group | null = null;
    let animationId: number | null = null;
    let isVisible = true;
    let spinAngle = INITIAL_ROTATION;
    // Current display rotation (lerped)
    let currentRotY = INITIAL_ROTATION;
    let currentRotX = 0;

    const loader = new FBXLoader();
    loader.load(config.path, (fbx) => {
      const scale = config.scale ?? 0.1;
      fbx.scale.set(scale, scale, scale);
      fbx.rotation.y = INITIAL_ROTATION;

      fbx.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.color = new THREE.Color(0xffffff);
            mat.emissive = new THREE.Color(0x111111);
            mat.wireframe = true;
          }
        }
      });

      scene.add(fbx);
      model = fbx;

      renderer.render(scene, camera);
    });

    function animate() {
      animationId = requestAnimationFrame(animate);

      if (!isVisible || !model) {
        return;
      }

      if (followMouse && mouseInViewportRef.current) {
        // Track mouse: offset initial rotation by mouse position
        const targetY = INITIAL_ROTATION + mouseRef.current.x * MOUSE_TRACK_RANGE;
        const targetX = -mouseRef.current.y * MOUSE_TRACK_RANGE * 0.5; // less vertical range

        currentRotY += (targetY - currentRotY) * LERP_SPEED;
        currentRotX += (targetX - currentRotX) * LERP_SPEED;

        model.rotation.y = currentRotY;
        model.rotation.x = currentRotX;
        spinAngle = currentRotY;
      } else if (localHoveredRef.current || externalHoveredRef.current) {
        // Lerp toward initial rotation and hold
        const targetY = INITIAL_ROTATION;
        const diffY = targetY - model.rotation.y;
        const normalizedDiffY =
          ((diffY + Math.PI) % (Math.PI * 2)) - Math.PI;
        model.rotation.y += normalizedDiffY * LERP_SPEED;

        // Ease X rotation back to 0
        model.rotation.x += (0 - model.rotation.x) * LERP_SPEED;

        currentRotY = model.rotation.y;
        currentRotX = model.rotation.x;
        spinAngle = model.rotation.y;
      } else if (autoRotate) {
        // Continuous slow spin — keep angle in [-PI, PI] to avoid drift
        spinAngle += rotationSpeed;
        if (spinAngle > Math.PI) spinAngle -= Math.PI * 2;
        if (spinAngle < -Math.PI) spinAngle += Math.PI * 2;
        model.rotation.y = spinAngle;
        currentRotY = spinAngle;

        // Ease X rotation back to 0
        model.rotation.x += (0 - model.rotation.x) * LERP_SPEED;
        currentRotX = model.rotation.x;
      }

      renderer.render(scene, camera);
    }

    animate();

    const handleMouseEnter = () => {
      localHoveredRef.current = true;
      if (followMouse) mouseInViewportRef.current = true;
    };
    const handleMouseLeave = () => {
      localHoveredRef.current = false;
      mouseInViewportRef.current = false;
      if (model) {
        spinAngle = model.rotation.y;
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!followMouse) return;
      const rect = container.getBoundingClientRect();
      // Normalize to -1..1 from container center
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mousemove", handleMouseMove);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(container);

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (!autoRotate || reducedMotion) {
        renderer.render(scene, camera);
      }
    });
    resizeObserver.observe(container);

    return () => {
      if (animationId !== null) cancelAnimationFrame(animationId);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
      resizeObserver.disconnect();

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [config.path, config.cameraZ, config.cameraY, config.scale, autoRotate, rotationSpeed, reducedMotion, followMouse]);

  return (
    <Box
      ref={containerRef}
      sx={{ width, height, position: "relative", overflow: "hidden" }}
      role="img"
      aria-label="3D model preview"
    />
  );
}
