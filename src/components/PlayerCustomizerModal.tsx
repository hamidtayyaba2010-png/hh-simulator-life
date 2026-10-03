import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

export interface PlayerCustomizerColors {
  shirt: string | null;
  pants: string | null;
  shoes: string | null;
  hair: string | null;
  skin: string | null;
}

export interface PlayerCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (colors: PlayerCustomizerColors) => void;
  initialColors: PlayerCustomizerColors;
}

type CustomizerTab = 'shirt' | 'pants' | 'shoes' | 'hair' | 'skin';

export const DEFAULT_PLAYER_COLORS = {
  shirt: '#00a8b5',
  pants: '#3b3b98',
  shoes: '#27272a',
  hair: '#4a2a18',
  skin: '#c68a5c',
};

const COLOR_BUTTONS = [
  { label: 'Green', icon: '🟩', hex: '#22c55e' },
  { label: 'Yellow', icon: '🟨', hex: '#eab308' },
  { label: 'Orange', icon: '🟧', hex: '#f97316' },
  { label: 'Red', icon: '🟥', hex: '#ef4444' },
  { label: 'Blue', icon: '🟦', hex: '#3b82f6' },
  { label: 'Purple', icon: '🟪', hex: '#a855f7' },
  { label: 'Black', icon: '⬛', hex: '#18181b' },
  { label: 'White', icon: '⬜', hex: '#f8fafc' },
  { label: 'Light Skin', icon: '🏻', hex: '#ffdfbf' },
  { label: 'Medium-Light', icon: '🏼', hex: '#e0b088' },
  { label: 'Medium Tan', icon: '🏽', hex: '#c68a5c' },
  { label: 'Medium Dark', icon: '🏾', hex: '#8d5524' },
  { label: 'Dark', icon: '🏿', hex: '#4a2c11' },
];

export function PlayerCustomizerModal({
  isOpen,
  onClose,
  onApply,
  initialColors,
}: PlayerCustomizerModalProps) {
  const [activeTab, setActiveTab] = useState<CustomizerTab>('shirt');
  const [previewColors, setPreviewColors] = useState<PlayerCustomizerColors>(initialColors);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer | null;
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    playerGroup: THREE.Group | null;
    skinMat: THREE.MeshStandardMaterial | null;
    hairMat: THREE.MeshStandardMaterial | null;
    shirtMat: THREE.MeshStandardMaterial | null;
    pantsMat: THREE.MeshStandardMaterial | null;
    shoesMat: THREE.MeshStandardMaterial | null;
    animId: number | null;
    rotationY: number;
    isDragging: boolean;
    lastMouseX: number;
  }>({
    renderer: null,
    scene: null,
    camera: null,
    playerGroup: null,
    skinMat: null,
    hairMat: null,
    shirtMat: null,
    pantsMat: null,
    shoesMat: null,
    animId: null,
    rotationY: 0,
    isDragging: false,
    lastMouseX: 0,
  });

  // Reset preview colors whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setPreviewColors(initialColors);
      threeRef.current.rotationY = 0;
    }
  }, [isOpen, initialColors]);

  // Update materials when previewColors change
  useEffect(() => {
    const t = threeRef.current;
    if (!t.shirtMat) return;

    t.shirtMat.color.set(previewColors.shirt || DEFAULT_PLAYER_COLORS.shirt);
    if (t.pantsMat) t.pantsMat.color.set(previewColors.pants || DEFAULT_PLAYER_COLORS.pants);
    if (t.shoesMat) t.shoesMat.color.set(previewColors.shoes || DEFAULT_PLAYER_COLORS.shoes);
    if (t.hairMat) t.hairMat.color.set(previewColors.hair || DEFAULT_PLAYER_COLORS.hair);
    if (t.skinMat) t.skinMat.color.set(previewColors.skin || DEFAULT_PLAYER_COLORS.skin);
  }, [previewColors]);

  // Setup 3D Scene for Player Character
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth || 380;
    const height = canvas.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 4.4);
    camera.lookAt(0, 1.1, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbf0, 1.3);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xbfdbfe, 0.6);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xe0e7ff, 0.8);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Circular pedestal platform
    const pedestalGeo = new THREE.CylinderGeometry(1.3, 1.45, 0.12, 36);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.8,
      metalness: 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, -0.06, 0);
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Subtle neon ring around pedestal
    const ringGeo = new THREE.RingGeometry(1.38, 1.44, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, 0.005, 0);
    scene.add(ringMesh);

    // BUILD PLAYER CHARACTER
    const playerGroup = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(previewColors.skin || DEFAULT_PLAYER_COLORS.skin),
      roughness: 0.8,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(previewColors.hair || DEFAULT_PLAYER_COLORS.hair),
      roughness: 0.9,
    });
    const shirtMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(previewColors.shirt || DEFAULT_PLAYER_COLORS.shirt),
      roughness: 0.7,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(previewColors.pants || DEFAULT_PLAYER_COLORS.pants),
      roughness: 0.7,
    });
    const shoesMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(previewColors.shoes || DEFAULT_PLAYER_COLORS.shoes),
      roughness: 0.8,
    });

    // Head Group
    const headGroup = new THREE.Group();
    const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), skinMat);
    headBox.position.y = 0.4;
    headBox.castShadow = true;
    headGroup.add(headBox);

    // Hair Box
    const hairBox = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.45, 0.84), hairMat);
    hairBox.position.set(0, 0.62, -0.02);
    headGroup.add(hairBox);

    // Eyes
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x2563eb });

    const lEyeWhite = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.02), eyeWhiteMat);
    lEyeWhite.position.set(-0.2, 0.38, 0.405);
    headGroup.add(lEyeWhite);

    const lEyePupil = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.03), eyePupilMat);
    lEyePupil.position.set(-0.17, 0.38, 0.408);
    headGroup.add(lEyePupil);

    const rEyeWhite = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.02), eyeWhiteMat);
    rEyeWhite.position.set(0.2, 0.38, 0.405);
    headGroup.add(rEyeWhite);

    const rEyePupil = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.03), eyePupilMat);
    rEyePupil.position.set(0.23, 0.38, 0.408);
    headGroup.add(rEyePupil);

    headGroup.position.y = 1.4;
    playerGroup.add(headGroup);

    // Torso (Shirt)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.4), shirtMat);
    torso.position.y = 0.95;
    torso.castShadow = true;
    playerGroup.add(torso);

    // Left Arm (Shirt upper sleeve + Skin hand)
    const leftArm = new THREE.Group();
    const lSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.6, 0.35), shirtMat);
    lSleeve.position.y = -0.3;
    lSleeve.castShadow = true;
    leftArm.add(lSleeve);
    const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.34), skinMat);
    lHand.position.y = -0.75;
    lHand.castShadow = true;
    leftArm.add(lHand);
    leftArm.position.set(-0.58, 1.4, 0);
    playerGroup.add(leftArm);

    // Right Arm (Shirt upper sleeve + Skin hand)
    const rightArm = new THREE.Group();
    const rSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.6, 0.35), shirtMat);
    rSleeve.position.y = -0.3;
    rSleeve.castShadow = true;
    rightArm.add(rSleeve);
    const rHand = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.34), skinMat);
    rHand.position.y = -0.75;
    rHand.castShadow = true;
    rightArm.add(rHand);
    rightArm.position.set(0.58, 1.4, 0);
    playerGroup.add(rightArm);

    // Left Leg (Upper Pants + Lower Shoes)
    const leftLeg = new THREE.Group();
    const lPants = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.65, 0.38), pantsMat);
    lPants.position.y = -0.325;
    lPants.castShadow = true;
    leftLeg.add(lPants);
    const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.25, 0.41), shoesMat);
    lShoe.position.set(0, -0.775, 0.015);
    lShoe.castShadow = true;
    leftLeg.add(lShoe);
    leftLeg.position.set(-0.21, 0.5, 0);
    playerGroup.add(leftLeg);

    // Right Leg (Upper Pants + Lower Shoes)
    const rightLeg = new THREE.Group();
    const rPants = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.65, 0.38), pantsMat);
    rPants.position.y = -0.325;
    rPants.castShadow = true;
    rightLeg.add(rPants);
    const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.25, 0.41), shoesMat);
    rShoe.position.set(0, -0.775, 0.015);
    rShoe.castShadow = true;
    rightLeg.add(rShoe);
    rightLeg.position.set(0.21, 0.5, 0);
    playerGroup.add(rightLeg);

    scene.add(playerGroup);

    threeRef.current = {
      renderer,
      scene,
      camera,
      playerGroup,
      skinMat,
      hairMat,
      shirtMat,
      pantsMat,
      shoesMat,
      animId: null,
      rotationY: 0,
      isDragging: false,
      lastMouseX: 0,
    };

    // Animation Loop
    let clock = 0;
    const animate = () => {
      threeRef.current.animId = requestAnimationFrame(animate);
      clock += 0.02;

      if (threeRef.current.playerGroup) {
        // Idle breathing subtle movement
        threeRef.current.playerGroup.rotation.y = threeRef.current.rotationY;
        headGroup.position.y = 1.4 + Math.sin(clock * 1.5) * 0.015;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Mouse / Touch Drag Rotation Handlers
    const onMouseDown = (e: MouseEvent) => {
      threeRef.current.isDragging = true;
      threeRef.current.lastMouseX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!threeRef.current.isDragging) return;
      const delta = e.clientX - threeRef.current.lastMouseX;
      threeRef.current.rotationY += delta * 0.015;
      threeRef.current.lastMouseX = e.clientX;
    };
    const onMouseUp = () => {
      threeRef.current.isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        threeRef.current.isDragging = true;
        threeRef.current.lastMouseX = e.touches[0].clientX;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!threeRef.current.isDragging || e.touches.length === 0) return;
      const delta = e.touches[0].clientX - threeRef.current.lastMouseX;
      threeRef.current.rotationY += delta * 0.015;
      threeRef.current.lastMouseX = e.touches[0].clientX;
    };
    const onTouchEnd = () => {
      threeRef.current.isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize Handler
    const onResize = () => {
      if (!canvas || !renderer || !camera) return;
      const w = canvas.clientWidth || 380;
      const h = canvas.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (threeRef.current.animId) {
        cancelAnimationFrame(threeRef.current.animId);
      }
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      window.removeEventListener('resize', onResize);

      renderer.dispose();
    };
  }, [isOpen]);

  const handleSelectColor = (hex: string | null) => {
    setPreviewColors((prev) => ({
      ...prev,
      [activeTab]: hex,
    }));
  };

  const handleApply = () => {
    onApply(previewColors);
    onClose();
  };

  if (!isOpen) return null;

  const currentActiveHex = previewColors[activeTab];

  return (
    <div
      id="player-customizer-screen"
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none overflow-hidden"
    >
      {/* Top Left: Back Button */}
      <button
        onClick={onClose}
        className="absolute top-5 left-5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-amber-300 transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-lg z-30 backdrop-blur-md"
        title="Back to Game"
      >
        <span>◀</span>
        <span>Back</span>
      </button>

      {/* Top Center: Title Indicator */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs sm:text-sm font-semibold tracking-wide pointer-events-none z-20 flex items-center gap-2 shadow-lg backdrop-blur-md">
        <span>🧍</span>
        <span>Player Settings</span>
      </div>

      {/* Top Right: Apply Button */}
      <button
        onClick={handleApply}
        className="absolute top-5 right-5 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/50 z-30 backdrop-blur-md"
        title="Apply Changes to Player"
      >
        <span>✓</span>
        <span>Apply</span>
      </button>

      {/* Center 3D Player Viewport */}
      <div className="relative w-full h-[65vh] sm:h-[70vh] flex items-center justify-center z-10">
        <canvas
          ref={canvasRef}
          className="w-full h-full max-w-[420px] max-h-[580px] cursor-grab active:cursor-grabbing outline-none"
        />
        {/* Subtle rotate guidance */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-slate-500 text-[11px] font-medium pointer-events-none flex items-center gap-1.5 opacity-80">
          <span>↔</span>
          <span>Drag to rotate player</span>
        </div>
      </div>

      {/* Right Side Vertical Column:
          Exact 5 icons in order:
          1. 👕 (Shirt)
          2. 👖 (Pants)
          3. 👞 (Shoes)
          4. 🧒 (Hair)
          5. 👤 (Skin)
      */}
      <div
        id="player-customizer-tabs"
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 p-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md z-30 w-auto"
        style={{ width: 'max-content' }}
      >
        {/* 1. Shirt */}
        <button
          onClick={() => setActiveTab('shirt')}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl transition cursor-pointer active:scale-95 shadow-md ${
            activeTab === 'shirt'
              ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 shadow-amber-500/20'
              : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
          }`}
          title="Shirt (👕)"
        >
          👕
        </button>

        {/* 2. Pants */}
        <button
          onClick={() => setActiveTab('pants')}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl transition cursor-pointer active:scale-95 shadow-md ${
            activeTab === 'pants'
              ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 shadow-amber-500/20'
              : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
          }`}
          title="Pants (👖)"
        >
          👖
        </button>

        {/* 3. Shoes */}
        <button
          onClick={() => setActiveTab('shoes')}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl transition cursor-pointer active:scale-95 shadow-md ${
            activeTab === 'shoes'
              ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 shadow-amber-500/20'
              : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
          }`}
          title="Shoes (👞)"
        >
          👞
        </button>

        {/* 4. Hair */}
        <button
          onClick={() => setActiveTab('hair')}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl transition cursor-pointer active:scale-95 shadow-md ${
            activeTab === 'hair'
              ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 shadow-amber-500/20'
              : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
          }`}
          title="Hair (🧒)"
        >
          🧒
        </button>

        {/* 5. Skin */}
        <button
          onClick={() => setActiveTab('skin')}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl transition cursor-pointer active:scale-95 shadow-md ${
            activeTab === 'skin'
              ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 shadow-amber-500/20'
              : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
          }`}
          title="Skin (👤)"
        >
          👤
        </button>
      </div>

      {/* Bottom Horizontal Scrolling Bar for Colors:
          🚫 (First button resets to actual original game color)
          Followed by: 🟩 🟨 🟧 🟥 🟦 🟪 ⬛ ⬜ 🏻 🏼 🏽 🏾 🏿
      */}
      <div
        id="player-customizer-colors-bar"
        className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 max-w-[92vw] sm:max-w-[85vw] p-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md z-30"
      >
        <div className="flex flex-row items-center gap-2 overflow-x-auto scrollbar-none px-1.5 py-1">
          {/* First Button: 🚫 Default Game Color */}
          <button
            onClick={() => handleSelectColor(null)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl transition cursor-pointer active:scale-95 shrink-0 ${
              currentActiveHex === null
                ? 'bg-amber-500/30 border-2 border-amber-400 ring-2 ring-amber-400/50'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50'
            }`}
            title="Reset to Original Game Default Color (🚫)"
          >
            🚫
          </button>

          {/* Color Buttons: 🟩 🟨 🟧 🟥 🟦 🟪 ⬛ ⬜ 🏻 🏼 🏽 🏾 🏿 */}
          {COLOR_BUTTONS.map((item) => {
            const isSelected = currentActiveHex?.toLowerCase() === item.hex.toLowerCase();
            return (
              <button
                key={item.label}
                onClick={() => handleSelectColor(item.hex)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl transition cursor-pointer active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-amber-500/30 border-2 border-amber-400 ring-2 ring-amber-400/50'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50'
                }`}
                title={`${item.label} (${item.hex})`}
              >
                {item.icon}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
