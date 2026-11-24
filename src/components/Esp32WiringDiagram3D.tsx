import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp, Layers, Play, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getAppStrings } from '../data/appTranslations';

type CameraPreset = 'iso' | 'top' | 'esp32' | 'servo';

interface ComponentSpec {
  id: string;
  title: string;
  pinInfo: string;
  accentClass: string;
}

const COMPONENT_SPECS: Record<string, ComponentSpec> = {
  psu: {
    id: 'psu',
    title: 'External 5V 2A DC Supply',
    pinInfo: '+5V OUT -> Servo Red | GND (-) -> Common Ground Bus',
    accentClass: 'bg-amber-500'
  },
  capacitor: {
    id: 'capacitor',
    title: '470uF Electrolytic Capacitor',
    pinInfo: 'Across +5V & GND rails — absorbs SG90 motor current spikes',
    accentClass: 'bg-sky-400'
  },
  esp32: {
    id: 'esp32',
    title: 'ESP32 DevKit V1 (30-Pin)',
    pinInfo: 'GPIO 18 (D18) PWM Out | GND Common | GPIO 2 Blue LED',
    accentClass: 'bg-teal-500'
  },
  gpio18: {
    id: 'gpio18',
    title: 'Orange Signal Wire (PWM)',
    pinInfo: 'ESP32 GPIO 18 (D18) -> SG90 Orange Signal Pin (50Hz 0°->45°->0°)',
    accentClass: 'bg-orange-500'
  },
  power5v: {
    id: 'power5v',
    title: 'Red Power Wire (+5V DC)',
    pinInfo: 'PSU +5V OUT -> SG90 Red VCC (Optional dashed branch to VIN)',
    accentClass: 'bg-red-500'
  },
  ground: {
    id: 'ground',
    title: 'Black/Brown Common Ground Bus',
    pinInfo: 'PSU GND (-) <-> ESP32 GND <-> SG90 Brown GND',
    accentClass: 'bg-slate-400'
  },
  servo: {
    id: 'servo',
    title: 'SG90 9g Micro Servo Motor',
    pinInfo: 'Orange = D18 | Red = +5V | Brown = Common GND (0° -> 45° Arc)',
    accentClass: 'bg-blue-500'
  }
};

const CAMERA_PRESETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  iso: { pos: [0.2, 6.2, 8.6], target: [0, 0.45, 0.2] },
  top: { pos: [0.0, 9.6, 1.4], target: [0, 0.2, 0.15] },
  esp32: { pos: [0.4, 3.2, 3.6], target: [0, 0.35, 0] },
  servo: { pos: [3.2, 3.3, 4.1], target: [2.8, 0.55, 0.2] }
};

const LEFT_PINS = ['EN', 'VP', 'VN', 'D34', 'D35', 'D32', 'D33', 'D25', 'D26', 'D27', 'D14', 'D12', 'D13', 'GND', 'VIN'];
const RIGHT_PINS = ['D23', 'D22', 'TX0', 'RX0', 'D21', 'D19', 'D18', 'D5', 'TX2', 'RX2', 'D4', 'D2', 'D15', 'GND', '3V3'];

// Pre-allocated scratch helpers outside render loop
const _tmpVec = new THREE.Vector3();
const _tmpDir = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(param));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
}

function createWorkbenchTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0c1626';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle cutting mat minor & major grid
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(45, 212, 191, 0.2)';
  ctx.lineWidth = 1.5;
  for (let x = 0; x <= canvas.width; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Border frame & bench markings
  ctx.strokeStyle = 'rgba(94, 234, 212, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
  ctx.font = 'bold 18px ui-monospace, monospace';
  ctx.fillText('MEDIMITRA ESD BENCH  |  5V RAIL + COMMON GND BUS + GPIO 18 PWM', 42, canvas.height - 36);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createEsp32PcbTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Matte black-slate soldermask
  ctx.fillStyle = '#182232';
  ctx.fillRect(0, 0, 512, 1024);

  // Subtle copper traces
  ctx.strokeStyle = '#253549';
  ctx.lineWidth = 3;
  for (let i = 0; i < 15; i++) {
    const y = 345 + i * 42;
    ctx.beginPath();
    ctx.moveTo(46, y);
    ctx.lineTo(145, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(466, y);
    ctx.lineTo(367, y);
    ctx.stroke();
  }

  // Wi-Fi meander trace on top antenna zone
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(155, 88);
  for (let x = 155; x <= 355; x += 40) {
    ctx.lineTo(x, 32);
    ctx.lineTo(x + 20, 32);
    ctx.lineTo(x + 20, 88);
  }
  ctx.stroke();

  // Silkscreen text
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 20px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ESP32 DEVKIT V1', 256, 410);
  ctx.font = '14px ui-monospace, monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('30-PIN WI-FI', 256, 434);

  // Left & Right pin silkscreen
  ctx.font = 'bold 17px ui-monospace, monospace';
  LEFT_PINS.forEach((label, idx) => {
    const y = 351 + idx * 42;
    ctx.textAlign = 'left';
    ctx.fillStyle = label === 'VIN' ? '#f87171' : label === 'GND' ? '#ffffff' : '#cbd5e1';
    ctx.fillText(label, 58, y);
  });

  RIGHT_PINS.forEach((label, idx) => {
    const y = 351 + idx * 42;
    ctx.textAlign = 'right';
    ctx.fillStyle = label === 'D18' ? '#fb923c' : label === 'D2' ? '#60a5fa' : label === 'GND' ? '#ffffff' : '#cbd5e1';
    ctx.fillText(label, 454, y);
  });

  // EN / BOOT / LED2 markings
  ctx.textAlign = 'center';
  ctx.font = 'bold 15px ui-monospace, monospace';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText('EN', 148, 865);
  ctx.fillText('BOOT', 364, 865);
  ctx.fillStyle = '#60a5fa';
  ctx.fillText('LED(2)', 355, 815);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createShieldTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 256, 320);
  grad.addColorStop(0, '#cbd5e1');
  grad.addColorStop(0.5, '#e2e8f0');
  grad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 320);

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 20px ui-sans-serif, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ESP-WROOM-32', 128, 128);
  ctx.font = '15px ui-monospace, monospace';
  ctx.fillText('Wi-Fi + BLE 2.4GHz', 128, 158);
  ctx.font = '13px ui-monospace, monospace';
  ctx.fillText('FCC / CE', 128, 220);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createServoLabelTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 236, 236);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px ui-sans-serif, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SG90 9g', 128, 88);
  ctx.fillStyle = '#93c5fd';
  ctx.font = 'bold 22px ui-monospace, monospace';
  ctx.fillText('Micro Servo', 128, 132);
  ctx.fillStyle = '#fbbf24';
  ctx.font = '18px ui-monospace, monospace';
  ctx.fillText('4.8V - 6.0V', 128, 178);
  ctx.fillStyle = '#34d399';
  ctx.font = '16px ui-monospace, monospace';
  ctx.fillText('0° -> 45° -> 0°', 128, 214);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createPsuLabelTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 384, 256);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 0, 384, 54);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px ui-sans-serif, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('5V 2A REGULATED PSU', 192, 36);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 26px ui-monospace, monospace';
  ctx.fillText('+5V OUT   |   GND (-)', 192, 126);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px ui-sans-serif, sans-serif';
  ctx.fillText('External Servo Supply', 192, 174);
  ctx.fillStyle = '#38bdf8';
  ctx.font = '16px ui-monospace, monospace';
  ctx.fillText('With 470uF Filter Cap', 192, 208);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function tagInteractive(obj: THREE.Object3D, componentId: string, interactiveTargets: THREE.Object3D[]) {
  obj.userData.componentId = componentId;
  obj.layers.enable(1);
  interactiveTargets.push(obj);
}

export const Esp32WiringDiagram3D: React.FC = () => {
  const { language } = useLanguage();
  const ui = getAppStrings(language);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<ComponentSpec>(COMPONENT_SPECS.esp32);
  const [activePreset, setActivePreset] = useState<CameraPreset>('iso');
  const [exploded, setExploded] = useState(false);
  const [hudCollapsed, setHudCollapsed] = useState(false);
  const [servoAngleDisplay, setServoAngleDisplay] = useState(0);
  const [isDispensingAnim, setIsDispensingAnim] = useState(false);
  const [webglError, setWebglError] = useState(false);

  // Refs synced with Three.js render loop so UI state never recreates WebGL
  const explodedRef = useRef(0);
  const presetTargetRef = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const triggerDispenseRef = useRef<(() => void) | null>(null);

  const handleSelectPreset = (preset: CameraPreset) => {
    setActivePreset(preset);
    const p = CAMERA_PRESETS[preset];
    presetTargetRef.current = {
      pos: new THREE.Vector3(...p.pos),
      target: new THREE.Vector3(...p.target)
    };
  };

  const handleToggleExploded = () => {
    setExploded((prev) => {
      const next = !prev;
      explodedRef.current = next ? 1 : 0;
      return next;
    });
  };

  const handleTriggerDispense = () => {
    triggerDispenseRef.current?.();
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance'
      });
    } catch {
      setWebglError(true);
      return;
    }

    const disposables: { geometries: THREE.BufferGeometry[]; materials: THREE.Material[]; textures: THREE.Texture[] } = {
      geometries: [],
      materials: [],
      textures: []
    };
    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      disposables.geometries.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      disposables.materials.push(m);
      return m;
    };
    const trackTex = <T extends THREE.Texture>(t: T): T => {
      disposables.textures.push(t);
      return t;
    };

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 420;

    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // Scene & Studio Environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1322);
    scene.fog = new THREE.Fog(0x0b1322, 14, 28);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 60);
    camera.position.set(...CAMERA_PRESETS.iso.pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...CAMERA_PRESETS.iso.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 2.8;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;

    // Warm Key + Cool Fill + Teal Rim 3-Point Rig
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(5, 8.5, 5.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -7;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 22;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x5eead4, 0.9);
    rimLight.position.set(-5.5, 4.5, -5.5);
    scene.add(rimLight);

    // Ground ESD Workbench Mat (Flush at y=0)
    const matTex = trackTex(createWorkbenchTexture(maxAniso));
    const benchMat = trackMat(new THREE.MeshStandardMaterial({ map: matTex, roughness: 0.78, metalness: 0.05 }));
    const benchGeo = trackGeo(new THREE.BoxGeometry(11.4, 0.08, 6.4));
    const benchMesh = new THREE.Mesh(benchGeo, benchMat);
    benchMesh.position.set(0, -0.04, 0.15);
    benchMesh.receiveShadow = true;
    scene.add(benchMesh);

    const interactiveTargets: THREE.Object3D[] = [];

    // =========================================================================
    // 1. EXTERNAL 5V 2A POWER SUPPLY MODULE (LEFT, x = -3.4)
    // =========================================================================
    const psuGroup = new THREE.Group();
    psuGroup.position.set(-3.4, 0, 0.1);
    scene.add(psuGroup);

    const psuBodyMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.35 }));
    const psuCase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.1, 0.72, 2.6)), psuBodyMat);
    psuCase.position.y = 0.38;
    psuCase.castShadow = true;
    psuCase.receiveShadow = true;
    tagInteractive(psuCase, 'psu', interactiveTargets);
    psuGroup.add(psuCase);

    // Rubber feet
    const footMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 }));
    const footGeo = trackGeo(new THREE.CylinderGeometry(0.11, 0.12, 0.04, 16));
    [[-0.85, -1.05], [0.85, -1.05], [-0.85, 1.05], [0.85, 1.05]].forEach(([fx, fz]) => {
      const f = new THREE.Mesh(footGeo, footMat);
      f.position.set(fx, 0.02, fz);
      psuGroup.add(f);
    });

    // Top PSU faceplate texture
    const psuLabelTex = trackTex(createPsuLabelTexture(maxAniso));
    const psuFaceMat = trackMat(new THREE.MeshStandardMaterial({
      map: psuLabelTex,
      roughness: 0.35,
      metalness: 0.1,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    }));
    const psuFace = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.9, 1.3)), psuFaceMat);
    psuFace.rotation.x = -Math.PI / 2;
    psuFace.position.set(0, 0.745, -0.35);
    tagInteractive(psuFace, 'psu', interactiveTargets);
    psuGroup.add(psuFace);

    // +5V OUT (Red) & GND (Green/Slate) Screw Terminal Blocks on PSU front edge
    const termRedMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 }));
    const termBlkMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 }));
    const screwMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 }));

    const termBlockPos = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.36, 0.28, 0.36)), termRedMat);
    termBlockPos.position.set(0.86, 0.48, 0.42);
    tagInteractive(termBlockPos, 'psu', interactiveTargets);
    psuGroup.add(termBlockPos);

    const termBlockGnd = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.36, 0.28, 0.36)), termBlkMat);
    termBlockGnd.position.set(0.86, 0.48, 0.92);
    tagInteractive(termBlockGnd, 'psu', interactiveTargets);
    psuGroup.add(termBlockGnd);

    [0.42, 0.92].forEach((tz) => {
      const screw = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 14)), screwMat);
      screw.position.set(0.86, 0.63, tz);
      psuGroup.add(screw);
    });

    // Green Power ON LED on PSU
    const psuLedMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1.5, roughness: 0.2 }));
    const psuLed = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.065, 16, 12)), psuLedMat);
    psuLed.position.set(-0.7, 0.75, 0.95);
    psuGroup.add(psuLed);

    // 470uF Electrolytic Filter Capacitor beside PSU terminals
    const capGroup = new THREE.Group();
    capGroup.position.set(-1.95, 0, 0.75);
    scene.add(capGroup);

    const capSleeveMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.32, metalness: 0.15 }));
    const capBody = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.18, 0.18, 0.48, 24)), capSleeveMat);
    capBody.position.y = 0.34;
    capBody.castShadow = true;
    tagInteractive(capBody, 'capacitor', interactiveTargets);
    capGroup.add(capBody);

    const capTop = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.175, 0.175, 0.02, 24)),
      trackMat(new THREE.MeshStandardMaterial({ color: 0xdbeafe, metalness: 0.88, roughness: 0.22 }))
    );
    capTop.position.y = 0.585;
    capGroup.add(capTop);

    const leadGeo = trackGeo(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 10));
    [-0.07, 0.07].forEach((lx) => {
      const lead = new THREE.Mesh(leadGeo, screwMat);
      lead.position.set(lx, 0.09, 0);
      capGroup.add(lead);
    });

    // =========================================================================
    // 2. ESP32 DEVKIT V1 (30-PIN) (CENTER, x = 0)
    // =========================================================================
    const espGroup = new THREE.Group();
    espGroup.position.set(0, 0, 0);
    scene.add(espGroup);

    // Plastic standoffs under pins
    const standoffMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 }));
    const standoffGeo = trackGeo(new THREE.BoxGeometry(0.14, 0.22, 3.05));
    [-0.78, 0.78].forEach((sx) => {
      const strip = new THREE.Mesh(standoffGeo, standoffMat);
      strip.position.set(sx, 0.12, 0.18);
      strip.castShadow = true;
      espGroup.add(strip);
    });

    // FR4 PCB Body
    const pcbTex = trackTex(createEsp32PcbTexture(maxAniso));
    const pcbSideMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x162030, roughness: 0.75, metalness: 0.05 }));
    const pcbTopMat = trackMat(new THREE.MeshStandardMaterial({ map: pcbTex, roughness: 0.65, metalness: 0.1 }));
    const pcbMaterials = [pcbSideMat, pcbSideMat, pcbTopMat, pcbSideMat, pcbSideMat, pcbSideMat];
    const pcb = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.86, 0.09, 3.65)), pcbMaterials);
    pcb.position.set(0, 0.27, 0);
    pcb.castShadow = true;
    pcb.receiveShadow = true;
    tagInteractive(pcb, 'esp32', interactiveTargets);
    espGroup.add(pcb);

    // ESP-WROOM-32 Brushed Aluminum RF Shield Can
    const shieldTex = trackTex(createShieldTexture(maxAniso));
    const shieldSideMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.22 }));
    const shieldTopMat = trackMat(new THREE.MeshStandardMaterial({ map: shieldTex, metalness: 0.85, roughness: 0.25 }));
    const rfCan = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.06, 0.18, 1.32)),
      [shieldSideMat, shieldSideMat, shieldTopMat, shieldSideMat, shieldSideMat, shieldSideMat]
    );
    rfCan.position.set(0, 0.4, -0.78);
    rfCan.castShadow = true;
    tagInteractive(rfCan, 'esp32', interactiveTargets);
    espGroup.add(rfCan);

    // AMS1117 & CP2102 ICs
    const icMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.35, metalness: 0.15 }));
    const regIc = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.42, 0.08, 0.3)), icMat);
    regIc.position.set(-0.22, 0.355, 0.35);
    espGroup.add(regIc);

    const uartIc = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.36, 0.06, 0.36)), icMat);
    uartIc.position.set(0, 0.345, 0.85);
    espGroup.add(uartIc);

    // Micro-USB Chrome Port
    const usbMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.16 }));
    const usbPort = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.56, 0.18, 0.44)), usbMat);
    usbPort.position.set(0, 0.4, 1.66);
    usbPort.castShadow = true;
    espGroup.add(usbPort);

    // Tactile Buttons EN & BOOT
    const btnBaseGeo = trackGeo(new THREE.BoxGeometry(0.22, 0.07, 0.22));
    const btnCapGeo = trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16));
    const btnBaseMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 }));
    const btnCapMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 }));
    [-0.42, 0.42].forEach((bx) => {
      const b = new THREE.Mesh(btnBaseGeo, btnBaseMat);
      b.position.set(bx, 0.35, 1.48);
      espGroup.add(b);
      const c = new THREE.Mesh(btnCapGeo, btnCapMat);
      c.position.set(bx, 0.4, 1.48);
      espGroup.add(c);
    });

    // Built-in GPIO 2 Blue LED (Emissive for slow blink demo + heartbeat blip)
    const blueLedMat = trackMat(new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x2563eb,
      emissiveIntensity: 0.3,
      roughness: 0.2
    }));
    const gpio2Led = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.11, 0.06, 0.07)), blueLedMat);
    gpio2Led.position.set(0.38, 0.345, 1.24);
    espGroup.add(gpio2Led);

    // 30 Gold Header Pins via InstancedMesh
    const pinGeo = trackGeo(new THREE.CylinderGeometry(0.028, 0.028, 0.44, 10));
    const goldMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.92, roughness: 0.18 }));
    const pinInstanced = new THREE.InstancedMesh(pinGeo, goldMat, 30);
    pinInstanced.castShadow = true;
    const dummy = new THREE.Object3D();

    const pinWorldPos = {
      leftGnd: new THREE.Vector3(-0.78, 0.34, -0.42 + 13 * 0.185),
      leftVin: new THREE.Vector3(-0.78, 0.34, -0.42 + 14 * 0.185),
      rightD18: new THREE.Vector3(0.78, 0.34, -0.42 + 6 * 0.185),
      rightGnd: new THREE.Vector3(0.78, 0.34, -0.42 + 13 * 0.185)
    };

    for (let i = 0; i < 15; i++) {
      const z = -0.42 + i * 0.185;
      dummy.position.set(-0.78, 0.22, z);
      dummy.updateMatrix();
      pinInstanced.setMatrixAt(i, dummy.matrix);

      dummy.position.set(0.78, 0.22, z);
      dummy.updateMatrix();
      pinInstanced.setMatrixAt(15 + i, dummy.matrix);
    }
    pinInstanced.instanceMatrix.needsUpdate = true;
    pinInstanced.computeBoundingSphere();
    espGroup.add(pinInstanced);

    // Highlight rings around connected pins (D18, VIN, Left GND, Right GND)
    const ringGeo = trackGeo(new THREE.TorusGeometry(0.065, 0.016, 10, 20));
    const ringOrangeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 0.8 }));
    const ringRedMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.7 }));
    const ringGndMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xe2e8f0, emissive: 0x94a3b8, emissiveIntensity: 0.5 }));

    const addPinHighlight = (pos: THREE.Vector3, mat: THREE.Material) => {
      const r = new THREE.Mesh(ringGeo, mat);
      r.rotation.x = Math.PI / 2;
      r.position.set(pos.x, 0.325, pos.z);
      espGroup.add(r);
    };
    addPinHighlight(pinWorldPos.rightD18, ringOrangeMat);
    addPinHighlight(pinWorldPos.leftVin, ringRedMat);
    addPinHighlight(pinWorldPos.leftGnd, ringGndMat);
    addPinHighlight(pinWorldPos.rightGnd, ringGndMat);

    // =========================================================================
    // 3. SG90 MICRO SERVO MOTOR (RIGHT, x = 3.4)
    // =========================================================================
    const servoGroup = new THREE.Group();
    servoGroup.position.set(3.4, 0, 0.05);
    scene.add(servoGroup);

    const servoBlueMat = trackMat(new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      roughness: 0.28,
      metalness: 0.05,
      clearcoat: 0.85,
      clearcoatRoughness: 0.15
    }));
    const servoDarkBlueMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.38 }));

    // Main lower servo case (grounded on y=0)
    const servoCase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.18, 1.38, 1.98)), servoBlueMat);
    servoCase.position.set(0, 0.69, 0);
    servoCase.castShadow = true;
    servoCase.receiveShadow = true;
    tagInteractive(servoCase, 'servo', interactiveTargets);
    servoGroup.add(servoCase);

    // Mounting tabs on left & right of servo
    const servoFlange = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.18, 0.14, 2.75)), servoBlueMat);
    servoFlange.position.set(0, 1.04, 0);
    servoFlange.castShadow = true;
    tagInteractive(servoFlange, 'servo', interactiveTargets);
    servoGroup.add(servoFlange);

    // 2 Brass mounting screws on flange
    [-1.2, 1.2].forEach((fz) => {
      const sc = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 0.17, 14)), goldMat);
      sc.position.set(0, 1.05, fz);
      servoGroup.add(sc);
    });

    // Side SG90 product sticker
    const servoLabelTex = trackTex(createServoLabelTexture(maxAniso));
    const servoSticker = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(1.12, 0.88)),
      trackMat(new THREE.MeshStandardMaterial({
        map: servoLabelTex,
        roughness: 0.35,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
      }))
    );
    servoSticker.rotation.y = Math.PI / 2;
    servoSticker.position.set(0.595, 0.52, 0);
    tagInteractive(servoSticker, 'servo', interactiveTargets);
    servoGroup.add(servoSticker);

    // Upper gearbox cylinder boss
    const gearBoss = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.54, 0.56, 0.28, 32)), servoDarkBlueMat);
    gearBoss.position.set(0, 1.52, -0.42);
    gearBoss.castShadow = true;
    tagInteractive(gearBoss, 'servo', interactiveTargets);
    servoGroup.add(gearBoss);

    // Output spline shaft (white nylon + brass core)
    const nylonMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.32, metalness: 0.05 }));
    const shaft = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.14, 0.14, 0.22, 24)), nylonMat);
    shaft.position.set(0, 1.75, -0.42);
    servoGroup.add(shaft);

    // Pivoting Servo Horn Assembly (rotates 0° -> 45° -> 0°)
    const hornPivot = new THREE.Group();
    hornPivot.position.set(0, 1.84, -0.42);
    servoGroup.add(hornPivot);

    const hornHub = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 24)), nylonMat);
    hornHub.castShadow = true;
    hornPivot.add(hornHub);

    // Extruded beveled single-arm servo horn extending forward (-Z at 0 deg)
    const hornShape = new THREE.Shape();
    hornShape.moveTo(-0.18, 0);
    hornShape.lineTo(-0.1, -1.08);
    hornShape.quadraticCurveTo(0, -1.24, 0.1, -1.08);
    hornShape.lineTo(0.18, 0);
    hornShape.closePath();

    const hornArmGeo = trackGeo(new THREE.ExtrudeGeometry(hornShape, {
      depth: 0.07,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2
    }));
    hornArmGeo.rotateX(Math.PI / 2);
    const hornArm = new THREE.Mesh(hornArmGeo, nylonMat);
    hornArm.position.y = 0.04;
    hornArm.castShadow = true;
    tagInteractive(hornArm, 'servo', interactiveTargets);
    hornPivot.add(hornArm);

    const centerScrew = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 16)), screwMat);
    centerScrew.position.y = 0.04;
    hornPivot.add(centerScrew);

    // Floating 45-degree visual sweep arc above servo shaft
    const arcGeo = trackGeo(new THREE.RingGeometry(0.75, 0.92, 24, 1, Math.PI / 2 - THREE.MathUtils.degToRad(45), THREE.MathUtils.degToRad(45)));
    const arcMat = trackMat(new THREE.MeshBasicMaterial({ color: 0x2dd4bf, side: THREE.DoubleSide, transparent: true, opacity: 0.78 }));
    const sweepArc = new THREE.Mesh(arcGeo, arcMat);
    sweepArc.rotation.x = -Math.PI / 2;
    sweepArc.position.set(0, 1.88, -0.42);
    servoGroup.add(sweepArc);

    // Servo 3-pin Dupont plug block entering side of servo
    const dupontMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 }));
    const servoPlug = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.24, 0.66)), dupontMat);
    servoPlug.position.set(2.45, 0.24, 0.62);
    servoPlug.castShadow = true;
    scene.add(servoPlug);

    // Wire exit from servo base to servoPlug
    const servoStubMatOrange = trackMat(new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 }));
    const servoStubMatRed = trackMat(new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 }));
    const servoStubMatBrown = trackMat(new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.45 }));

    const makeCable = (
      points: THREE.Vector3[],
      radius: number,
      mat: THREE.Material,
      componentId: string
    ): { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3 } => {
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = trackGeo(new THREE.TubeGeometry(curve, 48, radius, 12, false));
      const mesh = new THREE.Mesh(tubeGeo, mat);
      mesh.castShadow = true;
      tagInteractive(mesh, componentId, interactiveTargets);
      return { mesh, curve };
    };

    const wireGroup = new THREE.Group();
    scene.add(wireGroup);

    // 1. ORANGE SIGNAL WIRE (ESP32 D18 -> Dupont plug Orange pin)
    const orangeCurveResult = makeCable(
      [
        new THREE.Vector3(pinWorldPos.rightD18.x, 0.56, pinWorldPos.rightD18.z),
        new THREE.Vector3(1.12, 1.1, pinWorldPos.rightD18.z),
        new THREE.Vector3(1.9, 0.92, 0.45),
        new THREE.Vector3(2.35, 0.26, 0.42),
        new THREE.Vector3(2.85, 0.22, 0.42)
      ],
      0.038,
      servoStubMatOrange,
      'gpio18'
    );
    wireGroup.add(orangeCurveResult.mesh);

    // Dupont housing on ESP32 D18 pin
    const d18Hood = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.11, 0.24, 0.11)), dupontMat);
    d18Hood.position.set(pinWorldPos.rightD18.x, 0.44, pinWorldPos.rightD18.z);
    wireGroup.add(d18Hood);

    // 2. RED +5V DC WIRE (PSU +5V -> Y-Junction -> Servo Red VCC) + Optional standalone VIN branch
    const redMain = makeCable(
      [
        new THREE.Vector3(-2.54, 0.46, 0.52),
        new THREE.Vector3(-1.95, 0.3, 0.62),
        new THREE.Vector3(-1.55, 0.14, 2.2),
        new THREE.Vector3(0.2, 0.12, 2.48),
        new THREE.Vector3(1.85, 0.14, 2.15),
        new THREE.Vector3(2.35, 0.26, 0.62),
        new THREE.Vector3(2.85, 0.22, 0.62)
      ],
      0.042,
      servoStubMatRed,
      'power5v'
    );
    wireGroup.add(redMain.mesh);

    // Red junction branch to ESP32 VIN pin (for standalone USB-unplugged operation)
    const redVinBranch = makeCable(
      [
        new THREE.Vector3(-1.55, 0.14, 2.2),
        new THREE.Vector3(-1.35, 0.36, 2.18),
        new THREE.Vector3(pinWorldPos.leftVin.x, 0.54, pinWorldPos.leftVin.z)
      ],
      0.032,
      servoStubMatRed,
      'power5v'
    );
    wireGroup.add(redVinBranch.mesh);

    const vinHood = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.11, 0.24, 0.11)), dupontMat);
    vinHood.position.set(pinWorldPos.leftVin.x, 0.44, pinWorldPos.leftVin.z);
    wireGroup.add(vinHood);

    // 3. BLACK / BROWN COMMON GROUND BUS (PSU GND <-> ESP32 Left GND <-> ESP32 Right GND <-> Servo Brown GND)
    const gndMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.55 }));
    const gndMain = makeCable(
      [
        new THREE.Vector3(-2.54, 0.46, 1.02),
        new THREE.Vector3(-1.92, 0.26, 0.92),
        new THREE.Vector3(-1.62, 0.08, 1.85),
        new THREE.Vector3(pinWorldPos.leftGnd.x, 0.54, pinWorldPos.leftGnd.z)
      ],
      0.04,
      gndMat,
      'ground'
    );
    wireGroup.add(gndMain.mesh);

    const gndServoBus = makeCable(
      [
        new THREE.Vector3(-1.62, 0.08, 1.85),
        new THREE.Vector3(-0.35, 0.07, 2.75),
        new THREE.Vector3(1.65, 0.07, 2.45),
        new THREE.Vector3(2.35, 0.26, 0.82),
        new THREE.Vector3(2.85, 0.22, 0.82)
      ],
      0.042,
      servoStubMatBrown,
      'ground'
    );
    wireGroup.add(gndServoBus.mesh);

    const gndRightEsp = makeCable(
      [
        new THREE.Vector3(1.65, 0.07, 2.45),
        new THREE.Vector3(1.22, 0.36, 2.02),
        new THREE.Vector3(pinWorldPos.rightGnd.x, 0.54, pinWorldPos.rightGnd.z)
      ],
      0.032,
      gndMat,
      'ground'
    );
    wireGroup.add(gndRightEsp.mesh);

    // Common GND Node Sphere & Capacitor bridge
    const nodeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, roughness: 0.3 }));
    const gndNode = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.085, 16, 12)), nodeMat);
    gndNode.position.set(-1.62, 0.1, 1.85);
    wireGroup.add(gndNode);

    const vccNode = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.085, 16, 12)), nodeMat);
    vccNode.position.set(-1.55, 0.14, 2.2);
    wireGroup.add(vccNode);

    // Animated PWM Signal Pulse Sphere riding along orange GPIO 18 curve
    const pulseMat = trackMat(new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    const pulseSphere = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.075, 14, 12)), pulseMat);
    pulseSphere.visible = false;
    scene.add(pulseSphere);

    // Raycasting setup (Layer 1)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();

    // Dispense Animation State Machine (PWM travel -> 0°->45° -> Hold 300ms -> 45°->0° -> 1 Slow Blue LED Blink)
    let dispenseActive = false;
    let dispenseElapsed = 0;

    triggerDispenseRef.current = () => {
      dispenseActive = true;
      dispenseElapsed = 0;
      setIsDispensingAnim(true);
      setSelectedSpec(COMPONENT_SPECS.servo);
      requestRender();
    };

    // Cancel camera preset damping when user starts orbiting manually
    const onControlStart = () => {
      presetTargetRef.current = null;
    };
    controls.addEventListener('start', onControlStart);

    // Render-on-Demand & Software WebGL Guard
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let lastClockMs = performance.now();
    let explodeCurrent = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const requestRender = () => {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = window.requestAnimationFrame((now) => {
        if (disposed) return;
        const dt = Math.min((now - lastClockMs) / 1000, 0.1);
        lastClockMs = now;
        renderDirty = false;

        let keepAnimating = false;

        // 1. Camera Preset Smooth Damping
        if (presetTargetRef.current) {
          camera.position.lerp(presetTargetRef.current.pos, 1 - Math.exp(-8 * dt));
          controls.target.lerp(presetTargetRef.current.target, 1 - Math.exp(-8 * dt));
          if (camera.position.distanceTo(presetTargetRef.current.pos) < 0.02) {
            camera.position.copy(presetTargetRef.current.pos);
            controls.target.copy(presetTargetRef.current.target);
            presetTargetRef.current = null;
          } else {
            keepAnimating = true;
          }
        }

        // 2. Exploded View Smooth Damping
        const explodeTarget = explodedRef.current;
        if (Math.abs(explodeCurrent - explodeTarget) > 0.004) {
          explodeCurrent = THREE.MathUtils.damp(explodeCurrent, explodeTarget, 8, dt);
          wireGroup.position.y = explodeCurrent * 0.72;
          rfCan.position.y = 0.4 + explodeCurrent * 0.48;
          hornPivot.position.y = 1.84 + explodeCurrent * 0.55;
          keepAnimating = true;
        } else if (explodeCurrent !== explodeTarget) {
          explodeCurrent = explodeTarget;
          wireGroup.position.y = explodeCurrent * 0.72;
          rfCan.position.y = 0.4 + explodeCurrent * 0.48;
          hornPivot.position.y = 1.84 + explodeCurrent * 0.55;
        }

        // 3. Dispense Cycle Animation (Matches real ESP32 firmware!)
        if (dispenseActive) {
          dispenseElapsed += dt;
          keepAnimating = true;

          // Phase A: 0.0s -> 0.45s PWM pulse travels from GPIO 18 to SG90
          if (dispenseElapsed < 0.45) {
            pulseSphere.visible = true;
            const u = dispenseElapsed / 0.45;
            orangeCurveResult.curve.getPointAt(u, _tmpVec);
            _tmpVec.y += wireGroup.position.y;
            pulseSphere.position.copy(_tmpVec);
            hornPivot.rotation.y = 0;
            setServoAngleDisplay(0);
          }
          // Phase B: 0.45s -> 0.9s Servo rotates smoothly 0° -> 45°
          else if (dispenseElapsed < 0.9) {
            pulseSphere.visible = false;
            const u = (dispenseElapsed - 0.45) / 0.45;
            const deg = Math.round(u * 45);
            hornPivot.rotation.y = -THREE.MathUtils.degToRad(u * 45);
            setServoAngleDisplay(deg);
          }
          // Phase C: 0.9s -> 1.2s Hold at 45° (300ms)
          else if (dispenseElapsed < 1.2) {
            hornPivot.rotation.y = -THREE.MathUtils.degToRad(45);
            setServoAngleDisplay(45);
          }
          // Phase D: 1.2s -> 1.65s Servo returns 45° -> 0°
          else if (dispenseElapsed < 1.65) {
            const u = 1 - (dispenseElapsed - 1.2) / 0.45;
            const deg = Math.round(u * 45);
            hornPivot.rotation.y = -THREE.MathUtils.degToRad(u * 45);
            setServoAngleDisplay(deg);
          }
          // Phase E: 1.65s -> 2.85s 1 Slow 1.2s Blue LED blink on ESP32 GPIO 2!
          else if (dispenseElapsed < 2.85) {
            hornPivot.rotation.y = 0;
            setServoAngleDisplay(0);
            blueLedMat.emissiveIntensity = 4.2;
          }
          // Finish cleanly
          else {
            dispenseActive = false;
            blueLedMat.emissiveIntensity = 0.3;
            pulseSphere.visible = false;
            setIsDispensingAnim(false);
          }
        }

        const ctrlMoved = controls.update();
        if (ctrlMoved && controls.enableDamping) {
          keepAnimating = true;
        }

        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty || keepAnimating) {
            lastClockMs = performance.now();
            requestRender();
          }
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    };

    const handleControlChange = () => {
      requestRender();
    };
    controls.addEventListener('change', handleControlChange);

    // Click to inspect parts & wires
    let pointerDownPos = { x: 0, y: 0 };
    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return; // Ignore orbit drags
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(interactiveTargets, false);
      if (hits.length > 0) {
        const compId = hits[0].object.userData.componentId as string;
        if (compId && COMPONENT_SPECS[compId]) {
          setSelectedSpec(COMPONENT_SPECS[compId]);
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Subtle pointer hover cursor feedback (throttled)
    let lastHoverTs = 0;
    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverTs < 65) return;
      lastHoverTs = now;
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(interactiveTargets, false);
      renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
    };
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // WebGL context loss safety
    const onContextLost = (e: Event) => {
      e.preventDefault();
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
    };
    const onContextRestored = () => {
      requestRender();
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    // ResizeObserver for crisp responsive viewport
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(entry.contentRect.width, 280);
      const h = Math.max(entry.contentRect.height, 260);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    });
    resizeObserver.observe(container);

    // Compile shaders once on GPU devices
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Initial render frame
    void _tmpDir;
    requestRender();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('change', handleControlChange);
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      disposables.geometries.forEach((g) => g.dispose());
      disposables.materials.forEach((m) => m.dispose());
      disposables.textures.forEach((t) => t.dispose());
      envRT.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglError) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-slate-900 rounded-xl">
        3D WebGL viewport unavailable on this device. Switch to the 2D Schematic tab above.
      </div>
    );
  }

  return (
    <div className="relative w-full h-[380px] sm:h-[430px] bg-slate-950 overflow-hidden select-none">
      {/* Isolated WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top-Left Minimal Inspected Component Spec Readout (Solid non-blur overlay) */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none max-w-[290px]">
        <div className="bg-slate-900/95 border border-slate-700/90 rounded-xl px-3 py-2 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${selectedSpec.accentClass}`} />
            <span className="text-xs font-semibold tracking-tight truncate">
              {selectedSpec.title}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug font-mono">
            {selectedSpec.pinInfo}
          </p>
        </div>
      </div>

      {/* Top-Right Compact Live Servo Angle Readout */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none">
        <div className="bg-slate-900/95 border border-slate-700/90 rounded-xl px-3 py-1.5 text-white text-right shadow-lg">
          <div className="text-[10px] text-slate-400 font-medium">Servo Angle (GPIO 18)</div>
          <div className="text-sm font-bold font-mono tabular-nums text-teal-300">
            {servoAngleDisplay}° / 45°
          </div>
        </div>
      </div>

      {/* Unified Collapsible Bottom Control Dock (Zero Viewport Center Occlusion, No backdrop-blur) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[min(96%,660px)] flex flex-col items-center">
        <button
          type="button"
          onClick={() => setHudCollapsed((c) => !c)}
          className="px-3 py-1 rounded-t-lg bg-slate-900/95 border border-b-0 border-slate-700 text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          {hudCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{hudCollapsed ? 'Show Controls' : 'Hide Controls'}</span>
        </button>

        {!hudCollapsed && (
          <div className="w-full bg-slate-900/95 border border-slate-700 rounded-2xl p-2 shadow-xl flex flex-wrap items-center justify-between gap-2 text-[11px]">
            {/* Camera View Presets */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
              {(
                [
                  { id: 'iso', label: '3D Iso' },
                  { id: 'top', label: 'Top Pinout' },
                  { id: 'esp32', label: 'ESP32 Pins' },
                  { id: 'servo', label: 'Servo' }
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activePreset === preset.id
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Interactive Hardware Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTriggerDispense}
                disabled={isDispensingAnim}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
              >
                <Play className="w-3 h-3" />
                <span>{ui.testDispense3dBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleExploded}
                className={`px-2.5 py-1.5 rounded-xl border font-medium flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors ${
                  exploded
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>{ui.explodedView3dLabel}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('iso')}
                title={ui.resetView3dBtn}
                className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
