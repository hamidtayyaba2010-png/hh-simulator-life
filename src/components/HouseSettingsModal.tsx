import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from './threeUtils';
import { buildCompleteVillaCompound } from '../utils/dollhouseModelBuilder';

export interface HouseCustomColors {
  blue: string | null;
  white: string | null;
}

export interface HouseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyColors: (colors: HouseCustomColors) => void;
  currentColors: HouseCustomColors;
  skyColor?: string | null;
  landColor?: string | null;
}

type ModalView = 'grid' | 'villa_menu' | 'about' | '3d_view' | 'color';
type ActiveColorPart = 'blue' | 'white';

const DEFAULT_HOUSE_BLUE = '#1d4ed8';
const DEFAULT_HOUSE_LIGHT_BLUE = '#bae6fd';
const DEFAULT_HOUSE_WHITE = '#ffffff';

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

export function HouseSettingsModal({
  isOpen,
  onClose,
  onApplyColors,
  currentColors,
  skyColor,
  landColor,
}: HouseSettingsModalProps) {
  const [currentView, setCurrentView] = useState<ModalView>('grid');
  const [activePart, setActivePart] = useState<ActiveColorPart>('blue');
  const [previewColors, setPreviewColors] = useState<HouseCustomColors>(currentColors);

  // Canvas refs for 3D views
  const thumbnailCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const view3DCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const colorCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync initial colors when opened
  useEffect(() => {
    if (isOpen) {
      setPreviewColors(currentColors);
      setCurrentView('grid');
    }
  }, [isOpen, currentColors]);

  // 1. Thumbnail Canvas inside Grid (Square 1)
  useEffect(() => {
    if (!isOpen || currentView !== 'grid' || !thumbnailCanvasRef.current) return;
    const canvas = thumbnailCanvasRef.current;
    const width = canvas.clientWidth || 160;
    const height = canvas.clientHeight || 160;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(16, 15, 24);
    camera.lookAt(0, 5.5, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const amb = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xfff5e6, 1.2);
    dir.position.set(15, 25, 20);
    scene.add(dir);

    const hotBlueMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(previewColors.blue || DEFAULT_HOUSE_BLUE),
      roughness: 0.3,
    });
    const lightBlueMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(previewColors.blue || DEFAULT_HOUSE_LIGHT_BLUE),
      roughness: 0.4,
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(previewColors.white || DEFAULT_HOUSE_WHITE),
      roughness: 0.2,
    });

    const compound = buildCompleteVillaCompound(hotBlueMat, lightBlueMat, whiteMat);
    scene.add(compound);

    let animId: number;
    let rot = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      rot += 0.008;
      compound.rotation.y = rot;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [isOpen, currentView, previewColors]);

  // 2. Full 3D VIEW (Screen 3B: with Sky, Land, Gazebo, Patio & OrbitControls)
  useEffect(() => {
    if (!isOpen || currentView !== '3d_view' || !view3DCanvasRef.current) return;
    const canvas = view3DCanvasRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(skyColor || 0xbfe0ff);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    camera.position.set(0, 14, 38);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 0.8;
    controls.panSpeed = 0.6;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minPolarAngle = 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 120;
    controls.target.set(0, 6, 0);

    const amb = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(amb);
    const hemi = new THREE.HemisphereLight(0xffffff, 0xbae6fd, 0.45);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xfffaed, 1.3);
    dir.position.set(40, 65, 40);
    dir.castShadow = true;
    scene.add(dir);

    // Ground plane matching game
    const groundGeo = new THREE.PlaneGeometry(360, 360);
    const groundMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(landColor || 0x65a30d),
      roughness: 0.85,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, 0);
    ground.receiveShadow = true;
    scene.add(ground);

    const hotBlueMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(previewColors.blue || DEFAULT_HOUSE_BLUE),
      roughness: 0.3,
    });
    const lightBlueMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(previewColors.blue || DEFAULT_HOUSE_LIGHT_BLUE),
      roughness: 0.4,
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(previewColors.white || DEFAULT_HOUSE_WHITE),
      roughness: 0.2,
    });

    const compound = buildCompleteVillaCompound(hotBlueMat, lightBlueMat, whiteMat);
    scene.add(compound);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
    };
  }, [isOpen, currentView, previewColors, skyColor, landColor]);

  // 3. COLOR Customizer 3D View (Screen 3C)
  const colorMatsRef = useRef<{
    hotBlueMat: THREE.MeshStandardMaterial | null;
    lightBlueMat: THREE.MeshStandardMaterial | null;
    whiteMat: THREE.MeshStandardMaterial | null;
  }>({ hotBlueMat: null, lightBlueMat: null, whiteMat: null });

  useEffect(() => {
    if (!isOpen || currentView !== 'color' || !colorCanvasRef.current) return;
    const canvas = colorCanvasRef.current;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 200);
    camera.position.set(0, 12, 34);
    camera.lookAt(0, 6, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const amb = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xfffbf0, 1.25);
    dir.position.set(25, 45, 30);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xbfdbfe, 0.5);
    fill.position.set(-25, 20, 20);
    scene.add(fill);

    const hotBlueMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(previewColors.blue || DEFAULT_HOUSE_BLUE),
      roughness: 0.3,
    });
    const lightBlueMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(previewColors.blue || DEFAULT_HOUSE_LIGHT_BLUE),
      roughness: 0.4,
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(previewColors.white || DEFAULT_HOUSE_WHITE),
      roughness: 0.2,
    });

    colorMatsRef.current = { hotBlueMat, lightBlueMat, whiteMat };

    const compound = buildCompleteVillaCompound(hotBlueMat, lightBlueMat, whiteMat);
    scene.add(compound);

    // Turntable rotation with dragging
    let isDragging = false;
    let lastX = 0;
    let rotationY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      rotationY += dx * 0.01;
      compound.rotation.y = rotationY;
      lastX = e.clientX;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging = true;
        lastX = e.touches[0].clientX;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - lastX;
      rotationY += dx * 0.01;
      compound.rotation.y = rotationY;
      lastX = e.touches[0].clientX;
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!canvas || !renderer || !camera) return;
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [isOpen, currentView]);

  // Update materials in COLOR view immediately
  useEffect(() => {
    const { hotBlueMat, lightBlueMat, whiteMat } = colorMatsRef.current;
    if (hotBlueMat) hotBlueMat.color.set(previewColors.blue || DEFAULT_HOUSE_BLUE);
    if (lightBlueMat) lightBlueMat.color.set(previewColors.blue || DEFAULT_HOUSE_LIGHT_BLUE);
    if (whiteMat) whiteMat.color.set(previewColors.white || DEFAULT_HOUSE_WHITE);
  }, [previewColors]);

  const handleSelectColor = (hex: string | null) => {
    setPreviewColors((prev) => ({
      ...prev,
      [activePart]: hex,
    }));
  };

  const handleApply = () => {
    onApplyColors(previewColors);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="house-settings-modal-container"
      className="fixed inset-0 z-50 bg-black flex flex-col select-none overflow-hidden text-white font-sans"
    >
      {/* ========================================================
          SCREEN 1: HOUSE SELECTION (5 ROWS x 2 SQUARES = 10 BOXES)
          ======================================================== */}
      {currentView === 'grid' && (
        <div className="relative w-full h-full flex flex-col items-center overflow-y-auto px-4 py-16 scrollbar-none">
          {/* Top Left: Back Button to Game */}
          <button
            onClick={onClose}
            className="fixed top-5 left-5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-amber-300 transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-lg z-30 backdrop-blur-md"
            title="Back to Game"
          >
            <span>◀</span>
            <span>Back</span>
          </button>

          {/* Title Header */}
          <div className="text-center mb-6 mt-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-slate-100 uppercase">
              🏠 House Settings
            </h1>
            <p className="text-xs text-slate-400 mt-1">Select a villa to customize and view</p>
          </div>

          {/* 5 Rows x 2 Squares Grid: transparent boxes with light white outline */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-[340px] sm:max-w-[420px] pb-12">
            {/* Box 1 (Row 1, Square 1): Contains Blue Luxury Villa */}
            <div
              onClick={() => setCurrentView('villa_menu')}
              className="group aspect-square rounded-2xl border border-white/40 bg-transparent hover:border-white/90 hover:bg-white/5 active:scale-95 transition-all duration-200 cursor-pointer flex flex-col items-center justify-between p-3 relative shadow-lg shadow-black/60 overflow-hidden"
              title="Blue Luxury Doll House Villa"
            >
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-blue-600/80 text-[10px] font-bold text-white tracking-wider border border-blue-400/50 shadow-sm">
                VILLA 1
              </div>

              {/* Live 3D Rotating Thumbnail of the Villa */}
              <div className="w-full h-full flex items-center justify-center pointer-events-none mt-2">
                <canvas
                  ref={thumbnailCanvasRef}
                  className="w-full h-full max-w-[130px] max-h-[130px] object-contain"
                />
              </div>

              <div className="text-center w-full z-10">
                <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors drop-shadow-md">
                  Blue Luxury Villa
                </span>
              </div>
            </div>

            {/* Boxes 2 to 10: Empty transparent squares with light white outline */}
            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <div
                key={num}
                className="aspect-square rounded-2xl border border-white/35 bg-transparent flex flex-col items-center justify-center relative p-3 transition-opacity"
              >
                <span className="text-white/20 text-xs font-semibold tracking-widest uppercase">
                  Empty
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 2: VILLA OPTIONS MENU (ABOUT / 3D VIEW / COLOR)
          ======================================================== */}
      {currentView === 'villa_menu' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-black">
          {/* Top Left: Back to Screen 1 (Boxes) */}
          <button
            onClick={() => setCurrentView('grid')}
            className="absolute top-5 left-5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-amber-300 transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-lg z-30 backdrop-blur-md"
            title="Back to Houses"
          >
            <span>◀</span>
            <span>Back</span>
          </button>

          {/* Villa Showcase Title */}
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30">
              Villa 1
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-wide">
              Blue Luxury Doll House Villa
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select an option to inspect or customize this villa
            </p>
          </div>

          {/* Action Buttons: Each in its own separate row */}
          <div className="flex flex-col gap-4 w-full max-w-xs sm:max-w-sm">
            {/* Row 1: ABOUT */}
            <button
              onClick={() => setCurrentView('about')}
              className="w-full py-4 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-600/60 hover:border-amber-400/80 text-white hover:text-amber-300 font-extrabold text-sm sm:text-base tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer shadow-xl flex items-center justify-between group"
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">📖</span>
                <span>ABOUT</span>
              </span>
              <span className="text-slate-400 group-hover:text-amber-300 text-lg transition-transform group-hover:translate-x-1">
                ➔
              </span>
            </button>

            {/* Row 2: 3D VIEW */}
            <button
              onClick={() => setCurrentView('3d_view')}
              className="w-full py-4 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-600/60 hover:border-cyan-400/80 text-white hover:text-cyan-300 font-extrabold text-sm sm:text-base tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer shadow-xl flex items-center justify-between group"
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">🌐</span>
                <span>3D VIEW</span>
              </span>
              <span className="text-slate-400 group-hover:text-cyan-300 text-lg transition-transform group-hover:translate-x-1">
                ➔
              </span>
            </button>

            {/* Row 3: COLOR */}
            <button
              onClick={() => setCurrentView('color')}
              className="w-full py-4 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-600/60 hover:border-emerald-400/80 text-white hover:text-emerald-300 font-extrabold text-sm sm:text-base tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer shadow-xl flex items-center justify-between group"
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">🎨</span>
                <span>COLOR</span>
              </span>
              <span className="text-slate-400 group-hover:text-emerald-300 text-lg transition-transform group-hover:translate-x-1">
                ➔
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 3A: ABOUT (VILLA INFORMATION)
          ======================================================== */}
      {currentView === 'about' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-black">
          {/* Top Left: Back to Villa Options Menu */}
          <button
            onClick={() => setCurrentView('villa_menu')}
            className="absolute top-5 left-5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-amber-300 transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-lg z-30 backdrop-blur-md"
            title="Back to Villa Menu"
          >
            <span>◀</span>
            <span>Back</span>
          </button>

          {/* Information Card */}
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-slate-700/90 shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="text-center mb-6">
              <span className="text-3xl">🏛️</span>
              <h3 className="text-xl sm:text-2xl font-black text-amber-400 uppercase tracking-wide mt-2">
                Villa Information
              </h3>
            </div>

            <div className="space-y-5 text-left border-t border-slate-800 pt-5">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  NAME:
                </span>
                <span className="block text-base sm:text-lg font-bold text-white mt-0.5">
                  Blue Luxury Doll House Villa
                </span>
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  CREATER:
                </span>
                <span className="block text-base sm:text-lg font-bold text-amber-300 mt-0.5">
                  Muhammad Huzaifa Hamid
                </span>
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  DATE OF CREATION:
                </span>
                <span className="block text-base sm:text-lg font-bold text-emerald-400 mt-0.5">
                  8th September 2026, Tuesday
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 text-center">
              <button
                onClick={() => setCurrentView('villa_menu')}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 transition active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 3B: 3D VIEW (INTERACTIVE 3D VILLA + SKY + LAND)
          ======================================================== */}
      {currentView === '3d_view' && (
        <div className="relative w-full h-full bg-slate-900 overflow-hidden">
          {/* Top Left: Back to Villa Options Menu */}
          <button
            onClick={() => setCurrentView('villa_menu')}
            className="absolute top-5 left-5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-amber-300 transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-lg z-30 backdrop-blur-md"
            title="Back to Villa Menu"
          >
            <span>◀</span>
            <span>Back</span>
          </button>

          {/* Top Center: 3D Navigation Controls Hint */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-300 text-xs sm:text-sm font-semibold tracking-wide pointer-events-none z-20 flex items-center gap-2 shadow-lg backdrop-blur-md">
            <span>🌐</span>
            <span>3D View: Zoom & Rotate with Mouse / Touch</span>
          </div>

          <canvas ref={view3DCanvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        </div>
      )}

      {/* ========================================================
          SCREEN 3C: COLOR CUSTOMIZATION (3D VILLA + 2 ICONS + COLOR BAR)
          ======================================================== */}
      {currentView === 'color' && (
        <div className="relative w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden">
          {/* Top Left: Back to Villa Options Menu */}
          <button
            onClick={() => setCurrentView('villa_menu')}
            className="absolute top-5 left-5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-amber-300 transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-lg z-30 backdrop-blur-md"
            title="Back to Villa Menu"
          >
            <span>◀</span>
            <span>Back</span>
          </button>

          {/* Top Center: Indicator */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs sm:text-sm font-semibold tracking-wide pointer-events-none z-20 flex items-center gap-2 shadow-lg backdrop-blur-md">
            <span>🎨</span>
            <span>Customize Villa & Gazebo / Patio Colors</span>
          </div>

          {/* Top Right: Apply Button */}
          <button
            onClick={handleApply}
            className="absolute top-5 right-5 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/50 z-30 backdrop-blur-md"
            title="Apply Colors to Game"
          >
            <span>✓</span>
            <span>Apply</span>
          </button>

          {/* Center 3D Viewport of Villa */}
          <div className="relative w-full h-[65vh] sm:h-[70vh] flex items-center justify-center z-10">
            <canvas ref={colorCanvasRef} className="w-full h-full cursor-grab active:cursor-grabbing outline-none" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-slate-500 text-[11px] font-medium pointer-events-none flex items-center gap-1.5 opacity-80">
              <span>↔</span>
              <span>Drag to rotate villa</span>
            </div>
          </div>

          {/* Screen Right Side: Vertical 2 Icons:
              1. 🟦 (Blue parts)
              2. ⬜ (White parts)
          */}
          <div
            id="house-color-parts-bar"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 p-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md z-30 w-auto"
            style={{ width: 'max-content' }}
          >
            {/* 1. Blue Parts (Roofs, Slabs, Gazebo Roof/Deck, Patio) */}
            <button
              onClick={() => setActivePart('blue')}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition cursor-pointer active:scale-95 shadow-md ${
                activePart === 'blue'
                  ? 'bg-amber-500/25 border-2 border-amber-400 shadow-amber-500/30'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50'
              }`}
              title="Blue Parts (Roofs, Slabs, Gazebo, Patio)"
            >
              🟦
            </button>

            {/* 2. White Parts (Walls, Trims, Railings, Pillars) */}
            <button
              onClick={() => setActivePart('white')}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition cursor-pointer active:scale-95 shadow-md ${
                activePart === 'white'
                  ? 'bg-amber-500/25 border-2 border-amber-400 shadow-amber-500/30'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50'
              }`}
              title="White Parts (Walls, Railings, Pillars)"
            >
              ⬜
            </button>
          </div>

          {/* Bottom Horizontal Scrolling Bar for Colors:
              🚫 (First button resets to actual original classic game color)
              Followed by: 🟩 🟨 🟧 🟥 🟦 🟪 ⬛ ⬜ 🏻 🏼 🏽 🏾 🏿
          */}
          <div
            id="house-color-palette-bar"
            className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 max-w-[92vw] sm:max-w-[85vw] p-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md z-30"
          >
            <div className="flex flex-row items-center gap-2 overflow-x-auto scrollbar-none px-1.5 py-1">
              {/* 🚫 Reset to Classic Original Color */}
              <button
                onClick={() => handleSelectColor(null)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl transition cursor-pointer active:scale-95 shrink-0 ${
                  previewColors[activePart] === null
                    ? 'bg-amber-500/30 border-2 border-amber-400 ring-2 ring-amber-400/50'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50'
                }`}
                title="Reset to Original Game Color (🚫)"
              >
                🚫
              </button>

              {/* 🟩 🟨 🟧 🟥 🟦 🟪 ⬛ ⬜ 🏻 🏼 🏽 🏾 🏿 */}
              {COLOR_BUTTONS.map((item) => {
                const currentHex = previewColors[activePart];
                const isSelected = currentHex?.toLowerCase() === item.hex.toLowerCase();
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
      )}
    </div>
  );
}
