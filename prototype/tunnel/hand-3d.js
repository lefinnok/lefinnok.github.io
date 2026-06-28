// hand-3d.js — Rigged 3D hand wireframe (HUD/Vault aesthetic)
//
// Loads rigged_lowpoly_hand.glb, renders as wireframe with accent joints,
// cycles through poses by driving bone rotations programmatically.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ── Bone name mapping (GLB uses _Armature suffix) ──
const FINGER_BONES = {
  thumb:  ['Bone.001_Armature', 'Bone.002_Armature', 'Bone.003_Armature'],
  index:  ['Bone.004_Armature', 'Bone.005_Armature', 'Bone.006_Armature', 'Bone.007_Armature'],
  middle: ['Bone.008_Armature', 'Bone.009_Armature', 'Bone.010_Armature', 'Bone.011_Armature'],
  ring:   ['Bone.012_Armature', 'Bone.013_Armature', 'Bone.014_Armature', 'Bone.015_Armature'],
  pinky:  ['Bone.016_Armature', 'Bone.017_Armature', 'Bone.018_Armature', 'Bone.019_Armature'],
};

// Tip bones (last in each chain) — get accent markers
const TIP_BONES = [
  'Bone.003_Armature', 'Bone.007_Armature', 'Bone.011_Armature',
  'Bone.015_Armature', 'Bone.019_Armature',
];
const WRIST_BONE = 'Bone_Armature';

// ── Pose definitions: curl angle (radians) per bone in chain ──
const POSES = [
  {
    label: 'OPEN HAND',
    thumb:  [0.1, 0, 0],
    index:  [0, 0, 0, 0],
    middle: [0, 0, 0, 0],
    ring:   [0, 0, 0, 0],
    pinky:  [0, 0, 0, 0],
  },
  {
    label: 'FIST',
    thumb:  [0.6, 0.9, 0.7],
    index:  [1.0, 1.4, 1.3, 0.6],
    middle: [1.0, 1.4, 1.3, 0.6],
    ring:   [1.0, 1.4, 1.3, 0.6],
    pinky:  [1.0, 1.4, 1.3, 0.6],
  },
  {
    label: 'POINTING',
    thumb:  [0.6, 0.9, 0.7],
    index:  [0, 0, 0, 0],
    middle: [1.0, 1.4, 1.3, 0.6],
    ring:   [1.0, 1.4, 1.3, 0.6],
    pinky:  [1.0, 1.4, 1.3, 0.6],
  },
  {
    label: 'PEACE',
    thumb:  [0.6, 0.9, 0.7],
    index:  [0, 0, 0, 0],
    middle: [0, 0, 0, 0],
    ring:   [1.0, 1.4, 1.3, 0.6],
    pinky:  [1.0, 1.4, 1.3, 0.6],
  },
];

const HOLD_MS = 2000;
const TRANSITION_MS = 1200;

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}
function lerp(a, b, t) { return a + (b - a) * t; }

// ── Curl axis candidates — will try Z first (common for Blender exports) ──
const CURL_AXIS = new THREE.Vector3(0, 0, 1);

export function createHand3D() {
  // ── Container + HUD elements ──
  const container = document.createElement('div');
  container.className = 'hand-wireframe-container hand-3d';

  // HUD corner labels
  const hudTL = document.createElement('div');
  hudTL.className = 'hand-hud tl';
  hudTL.textContent = 'GESTURE // 3D';

  const hudTR = document.createElement('div');
  hudTR.className = 'hand-hud tr';
  hudTR.innerHTML = 'TRIS: 808<br>BONES: 21';

  const hudBL = document.createElement('div');
  hudBL.className = 'hand-hud bl';
  hudBL.textContent = 'POSE 01 / 04';

  const label = document.createElement('div');
  label.className = 'hand-label';
  label.innerHTML = '<span class="hand-label-dot"></span><span class="hand-label-text">OPEN HAND</span>';

  container.appendChild(hudTL);
  container.appendChild(hudTR);
  container.appendChild(hudBL);

  // ── Three.js setup ──
  const canvas = document.createElement('canvas');
  canvas.className = 'hand-3d-canvas';
  container.appendChild(canvas);
  container.appendChild(label);

  const W = 420, H = 480; // leave room for label below
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 100);

  // State
  let model = null;
  const bones = {};
  const restQuats = {};
  const currentCurl = {};
  let animId = 0;
  let startTime = 0;
  const jointMarkers = [];

  // ── Load GLB ──
  const loader = new GLTFLoader();
  loader.load('assets/hand.glb', (gltf) => {
    model = gltf.scene;

    // Apply HUD wireframe materials
    model.traverse(node => {
      if (node.isMesh) {
        // Subtle wireframe fill
        node.material = new THREE.MeshBasicMaterial({
          wireframe: true,
          color: 0xeaeaea,
          transparent: true,
          opacity: 0.12,
        });

        // Sharper edge lines on top
        const edges = new THREE.EdgesGeometry(node.geometry, 20);
        const edgeMat = new THREE.LineBasicMaterial({
          color: 0xeaeaea,
          transparent: true,
          opacity: 0.5,
        });
        const edgeLines = new THREE.LineSegments(edges, edgeMat);
        node.add(edgeLines);
      }

      if (node.isBone) {
        bones[node.name] = node;
        restQuats[node.name] = node.quaternion.clone();
        currentCurl[node.name] = 0;
      }
    });

    // Add joint markers (accent spheres at bone origins)
    const markerGeo = new THREE.OctahedronGeometry(0.08, 0);
    const accentMat = new THREE.MeshBasicMaterial({ color: 0xff5a1f });
    const dimMat = new THREE.MeshBasicMaterial({
      color: 0xeaeaea,
      transparent: true,
      opacity: 0.4,
    });

    for (const [name, bone] of Object.entries(bones)) {
      const isTip = TIP_BONES.includes(name);
      const isWrist = name === WRIST_BONE;
      if (!isTip && !isWrist) continue;

      const marker = new THREE.Mesh(
        isWrist ? new THREE.OctahedronGeometry(0.12, 0) : markerGeo,
        isTip || isWrist ? accentMat.clone() : dimMat
      );
      bone.add(marker);
      jointMarkers.push(marker);
    }

    // Auto-frame camera
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = maxDim / (2 * Math.tan((camera.fov / 2) * Math.PI / 180));
    camera.position.set(center.x + dist * 0.15, center.y, center.z + dist * 1.2);
    camera.lookAt(center);

    scene.add(model);
  });

  // ── Animation ──
  function draw(now) {
    if (!startTime) startTime = now;
    const elapsed = now - startTime;

    if (model) {
      // Pose timing
      const cycleLen = HOLD_MS + TRANSITION_MS;
      const loopTime = elapsed % (cycleLen * POSES.length);
      const poseIdx = Math.floor(loopTime / cycleLen) % POSES.length;
      const poseElapsed = loopTime % cycleLen;

      let t = 0;
      const fromPose = POSES[poseIdx];
      const toPose = POSES[(poseIdx + 1) % POSES.length];
      if (poseElapsed >= HOLD_MS) {
        t = easeOutBack(Math.min((poseElapsed - HOLD_MS) / TRANSITION_MS, 1));
      }

      // Update HUD labels
      const labelText = label.querySelector('.hand-label-text');
      if (labelText) labelText.textContent = fromPose.label;
      hudBL.textContent = `POSE ${String(poseIdx + 1).padStart(2, '0')} / ${String(POSES.length).padStart(2, '0')}`;

      // Drive bone rotations
      for (const [finger, boneNames] of Object.entries(FINGER_BONES)) {
        const fromCurls = fromPose[finger];
        const toCurls = toPose[finger];

        boneNames.forEach((boneName, i) => {
          const bone = bones[boneName];
          if (!bone) return;

          const targetCurl = lerp(fromCurls[i] || 0, toCurls[i] || 0, t);
          // Spring-damper smoothing
          currentCurl[boneName] += (targetCurl - currentCurl[boneName]) * 0.1;

          const restQ = restQuats[boneName];
          if (restQ) {
            const curlQ = new THREE.Quaternion().setFromAxisAngle(CURL_AXIS, currentCurl[boneName]);
            bone.quaternion.copy(restQ).multiply(curlQ);
          }
        });
      }

      // Pulsing joint markers
      const pulse = 0.6 + Math.sin(elapsed * 0.003) * 0.3;
      jointMarkers.forEach(m => {
        m.material.opacity = pulse;
        m.material.transparent = true;
      });

      // Slow auto-rotation
      model.rotation.y = Math.sin(elapsed * 0.0004) * 0.35;
      model.rotation.x = Math.sin(elapsed * 0.00025) * 0.12;
    }

    renderer.render(scene, camera);
    animId = requestAnimationFrame(draw);
  }

  return {
    element: container,
    start() { animId = requestAnimationFrame(draw); },
    stop() { cancelAnimationFrame(animId); },
  };
}
