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
}

export function FbxModelViewer({
  config,
  width = "100%",
  height = 300,
  autoRotate = true,
  rotationSpeed = 0.005,
}: FbxModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

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

    const loader = new FBXLoader();
    loader.load(config.path, (fbx) => {
      const scale = config.scale ?? 0.1;
      fbx.scale.set(scale, scale, scale);

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

      if (!autoRotate || reducedMotion) {
        renderer.render(scene, camera);
      }
    });

    function animate() {
      if (!isVisible) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      animationId = requestAnimationFrame(animate);
      if (model) {
        model.rotation.y += rotationSpeed;
      }
      renderer.render(scene, camera);
    }

    if (autoRotate && !reducedMotion) {
      animate();
    }

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
  }, [config.path, config.cameraZ, config.cameraY, config.scale, autoRotate, rotationSpeed, reducedMotion]);

  return (
    <Box
      ref={containerRef}
      sx={{ width, height, position: "relative", overflow: "hidden" }}
      role="img"
      aria-label="3D model preview"
    />
  );
}
