import React, { useEffect, useRef } from 'react';
import { THREE, OrbitControls } from './threeUtils';
import { HouseColorTheme, LandPlace, LandType, SkyDesign, TimeOfDay, TreeType, ViewPerspective, WeatherType, DroppedPhoneData } from '../types';
import { ambientSound } from '../utils/audioManager';

interface DollhouseCanvasProps {
  perspective: ViewPerspective;
  onJumpRef?: React.MutableRefObject<(() => void) | null>;
  joystickInputRef: React.MutableRefObject<{ x: number; y: number }>;
  timeOfDay: TimeOfDay;
  landType: LandType;
  landPlace?: LandPlace | null;
  houseTheme: HouseColorTheme;
  playerSpeedMultiplier: number;
  teleportTarget: { x: number; y: number; z: number } | null;
  onTeleportComplete: () => void;
  customSkyColor: string | null;
  customLandColor: string | null;
  customWoodColor: string | null;
  customLeafColor: string | null;
  skyDesign?: SkyDesign;
  weather?: WeatherType;
  treeType?: TreeType;
  customCactusColor?: string | null;
  customBambooColor?: string | null;
  playerShirtColor?: string | null;
  playerPantsColor?: string | null;
  playerShoesColor?: string | null;
  playerHairColor?: string | null;
  playerSkinColor?: string | null;
  customHouseBlueColor?: string | null;
  customHouseWhiteColor?: string | null;
  droppedPhone?: DroppedPhoneData | null;
  onDropCoordsRef?: React.MutableRefObject<(() => DroppedPhoneData) | null>;
  onAimAtPhoneChange?: (isAiming: boolean) => void;
}

export const DollhouseCanvas: React.FC<DollhouseCanvasProps> = ({
  perspective,
  onJumpRef,
  joystickInputRef,
  timeOfDay,
  landType,
  landPlace,
  houseTheme,
  playerSpeedMultiplier,
  teleportTarget,
  onTeleportComplete,
  customSkyColor,
  customLandColor,
  customWoodColor,
  customLeafColor,
  skyDesign,
  weather,
  treeType = 'classic',
  customCactusColor,
  customBambooColor,
  playerShirtColor,
  playerPantsColor,
  playerShoesColor,
  playerHairColor,
  playerSkinColor,
  customHouseBlueColor,
  customHouseWhiteColor,
  droppedPhone,
  onDropCoordsRef,
  onAimAtPhoneChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const perspectiveRef = useRef<ViewPerspective>(perspective);
  perspectiveRef.current = perspective;

  const droppedPhoneRef = useRef<DroppedPhoneData | null | undefined>(droppedPhone);
  droppedPhoneRef.current = droppedPhone;

  const playerSpeedMultiplierRef = useRef<number>(playerSpeedMultiplier);
  playerSpeedMultiplierRef.current = playerSpeedMultiplier;

  const onAimAtPhoneChangeRef = useRef(onAimAtPhoneChange);
  onAimAtPhoneChangeRef.current = onAimAtPhoneChange;

  const landTypeRef = useRef<LandType>(landType);
  landTypeRef.current = landType;

  const stateRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    controls: OrbitControls | null;
    playerGroup: THREE.Group | null;
    leftArm: THREE.Group | null;
    rightArm: THREE.Group | null;
    leftLeg: THREE.Group | null;
    rightLeg: THREE.Group | null;
    fpHandGroup: THREE.Group | null;
    fpYaw: number;
    fpPitch: number;
    currentPerspective: ViewPerspective;
    dirLight: THREE.DirectionalLight | null;
    ambientLight: THREE.AmbientLight | null;
    hemiLight: THREE.HemisphereLight | null;
    groundMesh: THREE.Mesh | null;
    hotBlueMat: THREE.MeshStandardMaterial | null;
    lightBlueMat: THREE.MeshStandardMaterial | null;
    whiteMat: THREE.MeshStandardMaterial | null;
    treeWoodMat: THREE.MeshStandardMaterial | null;
    treeLeafMat: THREE.MeshStandardMaterial | null;
    treeCactusMat: THREE.MeshStandardMaterial | null;
    treeBambooMat: THREE.MeshStandardMaterial | null;
    treesGroup: THREE.Group | null;
    rebuildTrees: ((type: TreeType) => void) | null;
    snowParticles: THREE.Points | null;
    snowVelocities: Float32Array | null;
    rainParticles: THREE.Points | null;
    rainVelocities: Float32Array | null;
    lightningGroup: THREE.Group | null;
    lightningLine: THREE.LineSegments | null;
    lightningLight: THREE.PointLight | null;
    lightningTimer: number;
    lightningFlashStage: number;
    tornadoGroup: THREE.Group | null;
    tornadoOuterFunnel: THREE.Mesh | null;
    tornadoInnerFunnel: THREE.Mesh | null;
    tornadoTex: THREE.CanvasTexture | null;
    tornadoParticles: THREE.Points | null;
    tornadoParticleData: { angle: number; y: number; speed: number }[] | null;
    tornadoStartTime: number;
    currentWeather: WeatherType;
    placeDecorationsGroup: THREE.Group | null;
    skyDesignGroup: THREE.Group | null;
    saturnPlanetMesh: THREE.Mesh | null;
    cloudMat: THREE.MeshStandardMaterial | null;
    playerSkinMat: THREE.MeshStandardMaterial | null;
    playerHairMat: THREE.MeshStandardMaterial | null;
    playerShirtMat: THREE.MeshStandardMaterial | null;
    playerPantsMat: THREE.MeshStandardMaterial | null;
    playerShoesMat: THREE.MeshStandardMaterial | null;
    droppedPhoneGroup: THREE.Group | null;
    droppedPhoneRingMat: THREE.MeshBasicMaterial | null;
    currentSkyDesign: SkyDesign;
    playerVelocityY: number;
    isGrounded: boolean;
    walkCycleTime: number;
    distanceAccumulator: number;
    lastFootstepDist: number;
    keyState: { forward: boolean; backward: boolean; left: boolean; right: boolean };
    animationFrameId: number | null;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    playerGroup: null,
    leftArm: null,
    rightArm: null,
    leftLeg: null,
    rightLeg: null,
    fpHandGroup: null,
    fpYaw: 0,
    fpPitch: 0,
    currentPerspective: perspective,
    dirLight: null,
    ambientLight: null,
    hemiLight: null,
    groundMesh: null,
    hotBlueMat: null,
    lightBlueMat: null,
    whiteMat: null,
    treeWoodMat: null,
    treeLeafMat: null,
    treeCactusMat: null,
    treeBambooMat: null,
    treesGroup: null,
    rebuildTrees: null,
    snowParticles: null,
    snowVelocities: null,
    rainParticles: null,
    rainVelocities: null,
    lightningGroup: null,
    lightningLine: null,
    lightningLight: null,
    lightningTimer: 0,
    lightningFlashStage: 0,
    tornadoGroup: null,
    tornadoOuterFunnel: null,
    tornadoInnerFunnel: null,
    tornadoTex: null,
    tornadoParticles: null,
    tornadoParticleData: null,
    tornadoStartTime: 0,
    currentWeather: null,
    placeDecorationsGroup: null,
    skyDesignGroup: null,
    saturnPlanetMesh: null,
    cloudMat: null as THREE.MeshStandardMaterial | null,
    playerSkinMat: null as THREE.MeshStandardMaterial | null,
    playerHairMat: null as THREE.MeshStandardMaterial | null,
    playerShirtMat: null as THREE.MeshStandardMaterial | null,
    playerPantsMat: null as THREE.MeshStandardMaterial | null,
    playerShoesMat: null as THREE.MeshStandardMaterial | null,
    droppedPhoneGroup: null as THREE.Group | null,
    droppedPhoneRingMat: null as THREE.MeshBasicMaterial | null,
    currentSkyDesign: null,
    playerVelocityY: 0,
    isGrounded: true,
    walkCycleTime: 0,
    distanceAccumulator: 0,
    lastFootstepDist: 0,
    keyState: { forward: false, backward: false, left: false, right: false },
    animationFrameId: null,
  });

  const treePositions = [
    { x: -26, z: 15 },
    { x: -30, z: -18 },
    { x: 28, z: -22 },
    { x: 32, z: 18 },
    { x: -10, z: -30 },
    { x: 22, z: -32 },
    { x: 120, z: -25 },
    { x: 150, z: 35 },
    { x: 180, z: -15 },
    { x: 210, z: 25 },
    { x: 240, z: -35 },
  ];

  const GRAVITY = -0.018;
  const JUMP_STRENGTH = 0.28;

  // Handle jump triggering
  const performJump = () => {
    const s = stateRef.current;
    if (s.isGrounded && s.playerGroup) {
      const px = s.playerGroup.position.x;
      const pz = s.playerGroup.position.z;

      const distGazebo = Math.hypot(px - 11, pz - 8);
      const distPatio = Math.hypot(px - -12, pz - 12);

      let nearTree = false;
      for (let i = 0; i < treePositions.length; i++) {
        if (Math.hypot(px - treePositions[i].x, pz - treePositions[i].z) <= 3.2) {
          nearTree = true;
          break;
        }
      }

      // Gazebo boost onto roof y = 5.1
      if (distGazebo <= 5.2) {
        s.playerVelocityY = 0.42;
      } else if (distPatio <= 3.2) {
        s.playerVelocityY = 0.38;
      } else if (nearTree) {
        s.playerVelocityY = 0.40;
      } else {
        s.playerVelocityY = JUMP_STRENGTH;
      }
      s.isGrounded = false;
    }
  };

  if (onJumpRef) {
    onJumpRef.current = performJump;
  }

  // Handle teleporting
  useEffect(() => {
    if (teleportTarget && stateRef.current.playerGroup) {
      stateRef.current.playerGroup.position.set(
        teleportTarget.x,
        teleportTarget.y,
        teleportTarget.z
      );
      stateRef.current.playerVelocityY = 0;
      stateRef.current.isGrounded = true;
      if (stateRef.current.controls) {
        stateRef.current.controls.target.set(
          teleportTarget.x,
          teleportTarget.y + 1.5,
          teleportTarget.z
        );
        stateRef.current.controls.update();
      }
      onTeleportComplete();
    }
  }, [teleportTarget, onTeleportComplete]);

  // Handle perspective switch
  useEffect(() => {
    const s = stateRef.current;
    if (!s.camera || !s.playerGroup) return;

    s.currentPerspective = perspective;
    const isFirstPerson = perspective === 'first-person';

    // Completely hide player group in first person so view in front is clear
    if (s.playerGroup) s.playerGroup.visible = !isFirstPerson;
    if (s.fpHandGroup) s.fpHandGroup.visible = false;

    const eyePos = s.playerGroup.position.clone().add(new THREE.Vector3(0, 1.65, 0));

    if (isFirstPerson) {
      if (s.controls) s.controls.enabled = false;

      // Initialize fpYaw from current camera direction
      const camDir = new THREE.Vector3();
      s.camera.getWorldDirection(camDir);
      camDir.y = 0;
      if (camDir.lengthSq() > 0.001) {
        camDir.normalize();
        s.fpYaw = Math.atan2(camDir.x, -camDir.z);
      } else {
        s.fpYaw = s.playerGroup.rotation.y;
      }
      s.fpPitch = 0;

      s.camera.position.copy(eyePos);
      const lookTarget = eyePos.clone().add(
        new THREE.Vector3(Math.sin(s.fpYaw), 0, -Math.cos(s.fpYaw))
      );
      s.camera.lookAt(lookTarget);
    } else {
      if (s.controls) {
        s.controls.enabled = true;
        s.controls.minDistance = 3;
        s.controls.maxDistance = 40;
        s.controls.target.copy(eyePos);
        const dist = 9;
        const yaw = s.fpYaw || s.playerGroup.rotation.y;
        s.camera.position.set(
          eyePos.x - Math.sin(yaw) * dist,
          eyePos.y + 3.8,
          eyePos.z + Math.cos(yaw) * dist
        );
        s.controls.update();
      }
    }
  }, [perspective]);

  // Handle Sky / Time of Day & Custom Sky Color changes
  useEffect(() => {
    const s = stateRef.current;
    if (!s.scene || !s.dirLight || !s.ambientLight || !s.hemiLight) return;

    if (customSkyColor) {
      s.scene.background = new THREE.Color(customSkyColor);
    } else {
      if (timeOfDay === 'sunrise') {
        // Dark peach color (not orange)
        s.scene.background = new THREE.Color(0xdb7b68);
        s.dirLight.color.set(0xffe4d6);
        s.dirLight.intensity = 0.95;
        s.dirLight.position.set(60, 25, 40);
        s.ambientLight.color.set(0xdb7b68);
        s.ambientLight.intensity = 0.45;
        s.hemiLight.color.set(0xffd5c8);
        s.hemiLight.groundColor.set(0x5c2a1e);
      } else if (timeOfDay === 'morning') {
        // Very light blue color
        s.scene.background = new THREE.Color(0xcce5ff);
        s.dirLight.color.set(0xfffbf0);
        s.dirLight.intensity = 1.15;
        s.dirLight.position.set(40, 60, 45);
        s.ambientLight.color.set(0xffffff);
        s.ambientLight.intensity = 0.65;
        s.hemiLight.color.set(0xffffff);
        s.hemiLight.groundColor.set(0xcce5ff);
      } else if (timeOfDay === 'noon') {
        // Dark blue color
        s.scene.background = new THREE.Color(0x1d4ed8);
        s.dirLight.color.set(0xffffff);
        s.dirLight.intensity = 1.3;
        s.dirLight.position.set(10, 85, 10);
        s.ambientLight.color.set(0x93c5fd);
        s.ambientLight.intensity = 0.6;
        s.hemiLight.color.set(0x60a5fa);
        s.hemiLight.groundColor.set(0x1e3a8a);
      } else if (timeOfDay === 'night') {
        // Dark gray (not black) and dark
        s.scene.background = new THREE.Color(0x374151);
        s.dirLight.color.set(0x94a3b8);
        s.dirLight.intensity = 0.3;
        s.dirLight.position.set(-45, 60, -35);
        s.ambientLight.color.set(0x1e293b);
        s.ambientLight.intensity = 0.22;
        s.hemiLight.color.set(0x475569);
        s.hemiLight.groundColor.set(0x0f172a);
      } else if (timeOfDay === 'midnight') {
        // Full black and extra dark
        s.scene.background = new THREE.Color(0x000000);
        s.dirLight.color.set(0x475569);
        s.dirLight.intensity = 0.12;
        s.dirLight.position.set(-45, 60, -35);
        s.ambientLight.color.set(0x0f172a);
        s.ambientLight.intensity = 0.08;
        s.hemiLight.color.set(0x1e293b);
        s.hemiLight.groundColor.set(0x020617);
      } else if (timeOfDay === 'sunset') {
        s.scene.background = new THREE.Color(0xfdba74);
        s.dirLight.color.set(0xffedd5);
        s.dirLight.intensity = 1.0;
        s.dirLight.position.set(70, 30, 40);
        s.ambientLight.color.set(0xfb923c);
        s.ambientLight.intensity = 0.55;
        s.hemiLight.color.set(0xffedd5);
        s.hemiLight.groundColor.set(0x7c2d12);
      } else {
        // Day - Normal default state
        s.scene.background = new THREE.Color(0xbfe0ff);
        s.dirLight.color.set(0xfffaed);
        s.dirLight.intensity = 1.2;
        s.dirLight.position.set(45, 70, 45);
        s.ambientLight.color.set(0xffffff);
        s.ambientLight.intensity = 0.65;
        s.hemiLight.color.set(0xffffff);
        s.hemiLight.groundColor.set(0xbae6fd);
      }
    }
  }, [timeOfDay, customSkyColor]);

  // Handle Sky Design changes (clouds, sun, moon, saturn, stars, galaxy, clear)
  useEffect(() => {
    const s = stateRef.current;
    if (!s.scene) return;

    s.currentSkyDesign = skyDesign ?? null;

    // Clean up previous sky design objects
    if (s.skyDesignGroup) {
      s.scene.remove(s.skyDesignGroup);
      s.skyDesignGroup.traverse((obj: any) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m: any) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      s.skyDesignGroup = null;
      s.saturnPlanetMesh = null;
      s.cloudMat = null;
    }

    // Automatically ensure clouds are visible if weather is rain, thunder, or snow
    const effectiveSkyDesign = skyDesign || ((weather === 'rain' || weather === 'thunder' || weather === 'snow') ? 'clouds' : null);

    if (!effectiveSkyDesign || effectiveSkyDesign === 'clear') {
      return;
    }

    const group = new THREE.Group();
    group.name = 'skyDesignGroup';

    if (effectiveSkyDesign === 'clouds') {
      // If weather is thunder, display black clouds; otherwise normal white cumulus clouds
      const isThunder = weather === 'thunder';
      const cloudMat = new THREE.MeshStandardMaterial({
        color: isThunder ? 0x181e28 : 0xffffff,
        roughness: isThunder ? 0.96 : 0.9,
        metalness: 0.05,
        transparent: true,
        opacity: isThunder ? 0.96 : 0.88,
      });
      s.cloudMat = cloudMat;

      const cloudClusterPositions = [
        { x: -180, y: 72, z: -70, scale: 1.3 },
        { x: -120, y: 80, z: -90, scale: 1.5 },
        { x: -60,  y: 65, z: -60, scale: 1.1 },
        { x: 0,    y: 78, z: -85, scale: 1.4 },
        { x: 60,   y: 68, z: -65, scale: 1.2 },
        { x: 130,  y: 82, z: -95, scale: 1.6 },
        { x: 190,  y: 72, z: -70, scale: 1.3 },

        { x: -160, y: 62, z: 0,   scale: 1.3 },
        { x: -90,  y: 75, z: -20, scale: 1.2 },
        { x: 80,   y: 76, z: -15, scale: 1.4 },
        { x: 160,  y: 64, z: 5,   scale: 1.2 },

        { x: -190, y: 72, z: 65,  scale: 1.4 },
        { x: -130, y: 80, z: 80,  scale: 1.2 },
        { x: -60,  y: 68, z: 60,  scale: 1.5 },
        { x: 10,   y: 74, z: 75,  scale: 1.3 },
        { x: 80,   y: 66, z: 55,  scale: 1.2 },
        { x: 140,  y: 82, z: 85,  scale: 1.5 },
        { x: 200,  y: 70, z: 60,  scale: 1.2 },

        { x: -30,  y: 90, z: -120, scale: 1.7 },
        { x: 40,   y: 88, z: -130, scale: 1.8 },
        { x: -220, y: 65, z: -30,  scale: 1.3 },
        { x: 220,  y: 66, z: 30,   scale: 1.4 },
      ];

      cloudClusterPositions.forEach((pos, idx) => {
        const cluster = new THREE.Group();
        cluster.name = `cloudCluster_${idx}`;
        cluster.position.set(pos.x, pos.y, pos.z);
        cluster.userData = {
          initialY: pos.y,
          driftSpeed: 0.024 + (idx % 6) * 0.0035, // subtle varied drift speed
          phase: idx * 0.75,
        };

        const puffs = [
          { dx: 0, dy: 0, dz: 0, r: 6.0, sy: 0.7 },
          { dx: -4.5, dy: -0.8, dz: 1.2, r: 4.8, sy: 0.65 },
          { dx: 4.8, dy: -0.6, dz: -1.0, r: 5.2, sy: 0.68 },
          { dx: -2.2, dy: 1.8, dz: -0.5, r: 4.2, sy: 0.75 },
          { dx: 2.5, dy: 1.5, dz: 0.8, r: 4.5, sy: 0.72 },
          { dx: 6.8, dy: -1.5, dz: 1.5, r: 3.8, sy: 0.6 },
          { dx: -6.5, dy: -1.2, dz: -1.2, r: 3.9, sy: 0.6 },
        ];

        puffs.forEach((p) => {
          const puffGeo = new THREE.SphereGeometry(p.r * pos.scale * 0.9, 16, 16);
          const puffMesh = new THREE.Mesh(puffGeo, cloudMat);
          puffMesh.position.set(p.dx * pos.scale, p.dy * pos.scale, p.dz * pos.scale);
          puffMesh.scale.set(1.3, p.sy, 1.2);
          cluster.add(puffMesh);
        });

        group.add(cluster);
      });
    } else if (skyDesign === 'sun') {
      // Spherical bright yellow sun in the front sky ahead of the player
      const sunCenter = new THREE.Vector3(20, 32, -135);
      const sunGeo = new THREE.SphereGeometry(14, 32, 32);
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
      const sunMesh = new THREE.Mesh(sunGeo, sunMat);
      sunMesh.position.copy(sunCenter);
      group.add(sunMesh);

      // Inner corona glow
      const corona1Geo = new THREE.SphereGeometry(18, 32, 32);
      const corona1Mat = new THREE.MeshBasicMaterial({
        color: 0xffd000,
        transparent: true,
        opacity: 0.42,
        side: THREE.BackSide,
      });
      const corona1 = new THREE.Mesh(corona1Geo, corona1Mat);
      corona1.position.copy(sunCenter);
      group.add(corona1);

      // Outer corona glow
      const corona2Geo = new THREE.SphereGeometry(24, 32, 32);
      const corona2Mat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.18,
        side: THREE.BackSide,
      });
      const corona2 = new THREE.Mesh(corona2Geo, corona2Mat);
      corona2.position.copy(sunCenter);
      group.add(corona2);
    } else if (skyDesign === 'moon' || skyDesign === 'moon_stars') {
      // Circular moon shape gray color in the front sky ahead of the player
      const moonHolder = new THREE.Group();
      const moonCenter = new THREE.Vector3(-20, 32, -135);
      const moonGeo = new THREE.SphereGeometry(13, 32, 32);

      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#cbd5e1'; // Silver gray
        ctx.fillRect(0, 0, 256, 256);

        const craters = [
          { x: 70, y: 80, r: 35, c: '#94a3b8' },
          { x: 160, y: 70, r: 40, c: '#94a3b8' },
          { x: 120, y: 150, r: 50, c: '#8492a6' },
          { x: 60, y: 170, r: 25, c: '#94a3b8' },
          { x: 190, y: 140, r: 28, c: '#8492a6' },
          { x: 100, y: 90, r: 18, c: '#64748b' },
          { x: 140, y: 180, r: 22, c: '#64748b' },
          { x: 180, y: 85, r: 15, c: '#64748b' },
          { x: 50, y: 120, r: 16, c: '#64748b' },
        ];
        craters.forEach((cr) => {
          ctx.beginPath();
          ctx.arc(cr.x, cr.y, cr.r, 0, Math.PI * 2);
          ctx.fillStyle = cr.c;
          ctx.globalAlpha = 0.55;
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
      }
      const moonTexture = new THREE.CanvasTexture(canvas);
      const moonMat = new THREE.MeshStandardMaterial({
        map: moonTexture,
        roughness: 0.85,
        emissive: 0x94a3b8,
        emissiveIntensity: 0.35,
      });
      const moonMesh = new THREE.Mesh(moonGeo, moonMat);
      moonMesh.position.copy(moonCenter);
      moonHolder.add(moonMesh);

      // Soft gray halo
      const haloGeo = new THREE.SphereGeometry(16.5, 32, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xe2e8f0,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.copy(moonCenter);
      moonHolder.add(haloMesh);

      group.add(moonHolder);

      // If moon_stars, also add stars
      if (skyDesign === 'moon_stars') {
        const starCount = 1400;
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
          const radius = 220 + Math.random() * 60;
          const theta = Math.random() * Math.PI * 2;
          const elevation = Math.random() * (Math.PI * 0.44) + 0.05;

          const x = radius * Math.cos(elevation) * Math.sin(theta);
          const y = radius * Math.sin(elevation);
          const z = -radius * Math.cos(elevation) * Math.cos(theta);

          starPositions[i * 3] = x;
          starPositions[i * 3 + 1] = y;
          starPositions[i * 3 + 2] = z;

          const tint = Math.random();
          if (tint > 0.8) {
            starColors[i * 3] = 0.9;
            starColors[i * 3 + 1] = 0.95;
            starColors[i * 3 + 2] = 1.0;
          } else if (tint > 0.65) {
            starColors[i * 3] = 1.0;
            starColors[i * 3 + 1] = 0.95;
            starColors[i * 3 + 2] = 0.8;
          } else {
            starColors[i * 3] = 1.0;
            starColors[i * 3 + 1] = 1.0;
            starColors[i * 3 + 2] = 1.0;
          }
        }

        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        const starMat = new THREE.PointsMaterial({
          size: 2.2,
          vertexColors: true,
          sizeAttenuation: false,
          transparent: true,
          opacity: 0.95,
        });

        const starPoints = new THREE.Points(starGeo, starMat);
        group.add(starPoints);
      }
    } else if (skyDesign === 'saturn') {
      // Spherical object matching Saturn's color with an encircling ring in front sky
      const saturnCenter = new THREE.Vector3(20, 30, -135);
      const saturnHolder = new THREE.Group();
      saturnHolder.position.copy(saturnCenter);

      // Spherical body with Saturn's authentic golden-ochre bands
      const bodyGeo = new THREE.SphereGeometry(12, 32, 32);
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const bands = [
          '#d8b070', '#e5c58a', '#cb9e57', '#edd4a5', '#c7964b',
          '#dfbc7e', '#eed8ad', '#cb9950', '#e8caa0', '#d2a764'
        ];
        const bandH = 256 / bands.length;
        bands.forEach((color, i) => {
          ctx.fillStyle = color;
          ctx.fillRect(0, i * bandH, 256, bandH + 1);
        });
      }
      const saturnTex = new THREE.CanvasTexture(canvas);
      const bodyMat = new THREE.MeshStandardMaterial({
        map: saturnTex,
        roughness: 0.65,
        metalness: 0.1,
      });
      const saturnMesh = new THREE.Mesh(bodyGeo, bodyMat);
      saturnHolder.add(saturnMesh);
      s.saturnPlanetMesh = saturnMesh;

      // Encircling Ring
      const ringGeo = new THREE.RingGeometry(16, 29, 64);
      const ringCanvas = document.createElement('canvas');
      ringCanvas.width = 256;
      ringCanvas.height = 256;
      const rctx = ringCanvas.getContext('2d');
      if (rctx) {
        const radGrad = rctx.createRadialGradient(128, 128, 60, 128, 128, 128);
        radGrad.addColorStop(0.0, 'rgba(216, 185, 137, 0)');
        radGrad.addColorStop(0.1, 'rgba(224, 195, 148, 0.85)');
        radGrad.addColorStop(0.4, 'rgba(196, 162, 114, 0.95)');
        radGrad.addColorStop(0.55, 'rgba(40, 30, 20, 0.25)'); // Cassini division
        radGrad.addColorStop(0.65, 'rgba(215, 183, 135, 0.9)');
        radGrad.addColorStop(0.9, 'rgba(190, 155, 105, 0.7)');
        radGrad.addColorStop(1.0, 'rgba(180, 140, 90, 0)');
        rctx.fillStyle = radGrad;
        rctx.fillRect(0, 0, 256, 256);
      }
      const ringTex = new THREE.CanvasTexture(ringCanvas);
      const ringMat = new THREE.MeshStandardMaterial({
        map: ringTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92,
        roughness: 0.7,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      saturnHolder.add(ringMesh);

      // Saturn's realistic tilt
      saturnHolder.rotation.z = THREE.MathUtils.degToRad(27);
      saturnHolder.rotation.x = THREE.MathUtils.degToRad(14);
      group.add(saturnHolder);
    } else if (skyDesign === 'stars') {
      // Tiny dotted bright stars distributed across the sky canopy and in front
      const starCount = 1400;
      const starPositions = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount; i++) {
        const radius = 220 + Math.random() * 60;
        const theta = Math.random() * Math.PI * 2;
        const elevation = Math.random() * (Math.PI * 0.44) + 0.05;

        const x = radius * Math.cos(elevation) * Math.sin(theta);
        const y = radius * Math.sin(elevation);
        const z = -radius * Math.cos(elevation) * Math.cos(theta);

        starPositions[i * 3] = x;
        starPositions[i * 3 + 1] = y;
        starPositions[i * 3 + 2] = z;

        const tint = Math.random();
        if (tint > 0.8) {
          starColors[i * 3] = 0.9;
          starColors[i * 3 + 1] = 0.95;
          starColors[i * 3 + 2] = 1.0;
        } else if (tint > 0.65) {
          starColors[i * 3] = 1.0;
          starColors[i * 3 + 1] = 0.95;
          starColors[i * 3 + 2] = 0.8;
        } else {
          starColors[i * 3] = 1.0;
          starColors[i * 3 + 1] = 1.0;
          starColors[i * 3 + 2] = 1.0;
        }
      }

      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

      const starMat = new THREE.PointsMaterial({
        size: 2.2,
        vertexColors: true,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.95,
      });

      const starPoints = new THREE.Points(starGeo, starMat);
      group.add(starPoints);
    } else if (skyDesign === 'galaxy') {
      // Galaxial view with colorful groups of stars and nebulas directly in the front sky
      const galaxyGroup = new THREE.Group();
      galaxyGroup.position.set(0, 36, -125);
      galaxyGroup.rotation.x = THREE.MathUtils.degToRad(72);
      galaxyGroup.rotation.z = THREE.MathUtils.degToRad(20);

      // Colorful swirling group of stars in spiral arms
      const starCount = 1800;
      const starPositions = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);

      const colorPalette = [
        new THREE.Color('#ffffff'),
        new THREE.Color('#fde047'),
        new THREE.Color('#ec4899'),
        new THREE.Color('#a855f7'),
        new THREE.Color('#06b6d4'),
        new THREE.Color('#38bdf8'),
        new THREE.Color('#3b82f6'),
      ];

      for (let i = 0; i < starCount; i++) {
        const armIndex = i % 3;
        const armAngle = (armIndex * 2 * Math.PI) / 3;
        const dist = Math.pow(Math.random(), 1.5) * 130 + 5;
        const angle = dist * 0.055 + armAngle;

        const spreadX = (Math.random() - 0.5) * (dist * 0.35 + 4);
        const spreadY = (Math.random() - 0.5) * 12;
        const spreadZ = (Math.random() - 0.5) * (dist * 0.35 + 4);

        starPositions[i * 3] = Math.cos(angle) * dist + spreadX;
        starPositions[i * 3 + 1] = spreadY;
        starPositions[i * 3 + 2] = Math.sin(angle) * dist + spreadZ;

        let col: THREE.Color;
        if (dist < 25) {
          col = Math.random() > 0.4 ? colorPalette[0] : colorPalette[1];
        } else if (dist < 70) {
          col = Math.random() > 0.5 ? colorPalette[2] : colorPalette[3];
        } else {
          col = Math.random() > 0.5 ? colorPalette[4] : (Math.random() > 0.5 ? colorPalette[5] : colorPalette[6]);
        }

        starColors[i * 3] = col.r;
        starColors[i * 3 + 1] = col.g;
        starColors[i * 3 + 2] = col.b;
      }

      const galaxyGeo = new THREE.BufferGeometry();
      galaxyGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      galaxyGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

      const galaxyMat = new THREE.PointsMaterial({
        size: 2.4,
        vertexColors: true,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.95,
      });

      const galaxyPoints = new THREE.Points(galaxyGeo, galaxyMat);
      galaxyGroup.add(galaxyPoints);

      // Colorful Glowing Nebulas
      const nebulaCanvas = document.createElement('canvas');
      nebulaCanvas.width = 128;
      nebulaCanvas.height = 128;
      const nctx = nebulaCanvas.getContext('2d');
      if (nctx) {
        const radGrad = nctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        radGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        radGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.6)');
        radGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
        radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        nctx.fillStyle = radGrad;
        nctx.fillRect(0, 0, 128, 128);
      }
      const nebulaTex = new THREE.CanvasTexture(nebulaCanvas);

      const corePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.MeshBasicMaterial({
          map: nebulaTex,
          color: 0xfff7ed,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      corePlane.rotation.x = Math.PI / 2;
      galaxyGroup.add(corePlane);

      const nebulaPlacements = [
        { x: -35, z: 25, color: 0xd946ef, scale: 55, op: 0.4 },
        { x: 40, z: -30, color: 0xa855f7, scale: 60, op: 0.4 },
        { x: -55, z: -40, color: 0x06b6d4, scale: 65, op: 0.38 },
        { x: 50, z: 45, color: 0x3b82f6, scale: 65, op: 0.38 },
        { x: 75, z: -20, color: 0xec4899, scale: 50, op: 0.35 },
        { x: -70, z: 20, color: 0x22d3ee, scale: 50, op: 0.35 },
      ];

      nebulaPlacements.forEach((neb) => {
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(neb.scale, neb.scale),
          new THREE.MeshBasicMaterial({
            map: nebulaTex,
            color: neb.color,
            transparent: true,
            opacity: neb.op,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false,
          })
        );
        plane.position.set(neb.x, (Math.random() - 0.5) * 6, neb.z);
        plane.rotation.x = Math.PI / 2;
        galaxyGroup.add(plane);
      });

      group.add(galaxyGroup);
    } else if (skyDesign === 'rainbow') {
      const rainbowGroup = new THREE.Group();
      rainbowGroup.name = 'rainbowArch';

      // 7 spectral rainbow bands: Red, Orange, Yellow, Green, Blue, Indigo, Violet
      const rainbowColors = [
        0xef4444, // Red
        0xf97316, // Orange
        0xfacc15, // Yellow
        0x22c55e, // Green
        0x3b82f6, // Blue
        0x6366f1, // Indigo
        0xa855f7, // Violet
      ];

      const baseRadius = 84;
      const bandWidth = 1.35;

      rainbowColors.forEach((color, idx) => {
        const radius = baseRadius - idx * bandWidth;
        const torusGeo = new THREE.TorusGeometry(radius, bandWidth * 0.52, 12, 72, Math.PI);
        const bandMat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.78,
          side: THREE.DoubleSide,
        });
        const bandMesh = new THREE.Mesh(torusGeo, bandMat);
        rainbowGroup.add(bandMesh);
      });

      // Position high in the northern horizon spanning across the world
      rainbowGroup.position.set(0, 10, -115);
      rainbowGroup.rotation.x = 0.12;
      group.add(rainbowGroup);
    }

    s.scene.add(group);
    s.skyDesignGroup = group;
  }, [skyDesign, weather]);

  // Handle Land Type, Land Place & Custom Land Color changes
  useEffect(() => {
    const s = stateRef.current;
    if (!s.groundMesh) return;

    const mat = s.groundMesh.material as THREE.MeshStandardMaterial;

    // Toggle snowfall visibility (active on ice place, snow land, or snow weather)
    if (s.snowParticles) {
      s.snowParticles.visible = (landPlace === 'ice' || landType === 'snow' || weather === 'snow');
    }

    // Clear previous 3D place decorations
    if (s.placeDecorationsGroup) {
      while (s.placeDecorationsGroup.children.length > 0) {
        const child = s.placeDecorationsGroup.children[0];
        s.placeDecorationsGroup.remove(child);
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (landPlace === 'mountain') {
      // Mountain: Dark brown rocky earth with cracks
      const baseBrown = customLandColor || '#451a03';
      ctx.fillStyle = baseBrown;
      ctx.fillRect(0, 0, 256, 256);

      // Fine rocky pebbles and texture noise
      for (let i = 0; i < 2000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#271102' : '#5c2a07';
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
      }

      // Branching dark geological fissure cracks
      ctx.strokeStyle = '#150902';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const crackFissures = [
        [{ x: 25, y: 35 }, { x: 50, y: 65 }, { x: 42, y: 105 }, { x: 72, y: 145 }, { x: 60, y: 195 }, { x: 78, y: 235 }],
        [{ x: 50, y: 65 }, { x: 80, y: 78 }, { x: 98, y: 112 }],
        [{ x: 175, y: 15 }, { x: 195, y: 60 }, { x: 232, y: 100 }, { x: 215, y: 140 }, { x: 242, y: 185 }],
        [{ x: 195, y: 60 }, { x: 165, y: 88 }, { x: 155, y: 125 }],
        [{ x: 110, y: 150 }, { x: 135, y: 178 }, { x: 168, y: 198 }, { x: 192, y: 238 }],
        [{ x: 135, y: 178 }, { x: 118, y: 215 }],
      ];

      crackFissures.forEach((crack) => {
        ctx.beginPath();
        ctx.moveTo(crack[0].x, crack[0].y);
        for (let i = 1; i < crack.length; i++) {
          ctx.lineTo(crack[i].x, crack[i].y);
        }
        ctx.stroke();
      });

      // Highlight edges of cracks
      ctx.strokeStyle = '#68350d';
      ctx.lineWidth = 1.0;
      crackFissures.forEach((crack) => {
        ctx.beginPath();
        ctx.moveTo(crack[0].x + 1, crack[0].y + 1);
        for (let i = 1; i < crack.length; i++) {
          ctx.lineTo(crack[i].x + 1, crack[i].y + 1);
        }
        ctx.stroke();
      });
    } else if (landPlace === 'island') {
      // Island: Light peach beach sand with vibrant green grass patches
      const basePeach = customLandColor || '#fed7aa';
      ctx.fillStyle = basePeach;
      ctx.fillRect(0, 0, 256, 256);

      // Fine sand specks
      for (let i = 0; i < 2200; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#fde68a' : '#ffedd5';
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
      }

      // Green grass patches on top of peach sand
      const grassSpots = [
        { x: 55, y: 60, r: 28 },
        { x: 195, y: 70, r: 32 },
        { x: 115, y: 175, r: 36 },
        { x: 215, y: 200, r: 26 },
        { x: 45, y: 205, r: 24 },
      ];

      grassSpots.forEach((gs) => {
        ctx.fillStyle = '#65a30d';
        ctx.beginPath();
        ctx.arc(gs.x, gs.y, gs.r, 0, Math.PI * 2);
        ctx.fill();

        // Grass blades inside patch
        ctx.fillStyle = '#4d7c0f';
        for (let b = 0; b < 28; b++) {
          const bx = gs.x + (Math.random() - 0.5) * gs.r * 1.5;
          const by = gs.y + (Math.random() - 0.5) * gs.r * 1.5;
          ctx.fillRect(bx, by, 2, 4);
        }
      });

      // Add light 3D grass tufts in scene
      if (s.placeDecorationsGroup) {
        const tuftMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.8 });
        const tuftPositions = [
          { x: -16, z: 8 }, { x: -8, z: 16 }, { x: 6, z: 14 },
          { x: 18, z: 12 }, { x: -22, z: -10 }, { x: 15, z: -14 },
          { x: -5, z: -18 }, { x: 24, z: -8 }, { x: -14, z: 22 },
        ];
        tuftPositions.forEach((tp) => {
          const blade1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.05), tuftMat);
          blade1.position.set(tp.x, 0.2, tp.z);
          blade1.rotation.y = Math.random() * Math.PI;
          s.placeDecorationsGroup?.add(blade1);

          const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.05), tuftMat);
          blade2.position.set(tp.x, 0.2, tp.z);
          blade2.rotation.y = blade1.rotation.y + Math.PI / 2;
          s.placeDecorationsGroup?.add(blade2);
        });
      }
    } else if (landPlace === 'ice' || landType === 'snow') {
      // Ice: Pure snowy white with ice crystals
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 3000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#f1f5f9' : '#e2e8f0';
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
      }
    } else if (landPlace === 'desert' || landType === 'sand') {
      // Desert sand dunes
      ctx.fillStyle = customLandColor || '#fde047';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 3000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#eab308' : '#ca8a04';
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
      }
    } else if (customLandColor) {
      // Custom solid/tinted land color
      ctx.fillStyle = customLandColor;
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 1500; i++) {
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
      }
    } else {
      // Normal grass
      ctx.fillStyle = '#65a30d';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 3000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#4d7c0f' : '#84cc16';
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
      }
    }

    const newTexture = new THREE.CanvasTexture(canvas);
    newTexture.wrapS = THREE.RepeatWrapping;
    newTexture.wrapT = THREE.RepeatWrapping;
    newTexture.repeat.set(150, 50);

    mat.map = newTexture;
    mat.color.set(0xffffff);
    mat.needsUpdate = true;
  }, [landType, landPlace, customLandColor, weather]);

  // Handle Weather changes
  useEffect(() => {
    const s = stateRef.current;
    s.currentWeather = weather ?? null;

    // Toggle Snowfall particles
    if (s.snowParticles) {
      s.snowParticles.visible = (landPlace === 'ice' || landType === 'snow' || weather === 'snow');
    }

    // Toggle Rain particles (visible ONLY for rain, NEVER for thunder)
    if (s.rainParticles) {
      s.rainParticles.visible = (weather === 'rain');
    }

    // Update cloud color (black clouds for thunder, white for other weather)
    if (s.cloudMat) {
      if (weather === 'thunder') {
        s.cloudMat.color.set(0x181e28);
        s.cloudMat.opacity = 0.96;
      } else {
        s.cloudMat.color.set(0xffffff);
        s.cloudMat.opacity = 0.88;
      }
      s.cloudMat.needsUpdate = true;
    }

    // Toggle Lightning / Thunder (Only lightning animation, no rain)
    if (s.lightningGroup) {
      s.lightningGroup.visible = (weather === 'thunder');
      if (weather === 'thunder') {
        // Trigger initial lightning bolt immediately
        s.lightningTimer = 999;
        s.lightningFlashStage = 0;
      } else {
        s.lightningFlashStage = 0;
        if (s.lightningLight) s.lightningLight.intensity = 0;
        if (s.lightningLine) s.lightningLine.visible = false;
      }
    }

    // Toggle 3D Tornado
    if (s.tornadoGroup) {
      if (weather === 'tornado') {
        s.tornadoGroup.visible = true;
        s.tornadoStartTime = performance.now();
        s.tornadoGroup.scale.set(0.01, 0.01, 0.01);
      } else {
        s.tornadoGroup.visible = false;
        s.tornadoStartTime = 0;
      }
    }
  }, [weather, landPlace, landType]);

  // Handle Tree Wood Color changes
  useEffect(() => {
    const s = stateRef.current;
    if (!s.treeWoodMat) return;
    if (customWoodColor) {
      s.treeWoodMat.color.set(customWoodColor);
    } else {
      s.treeWoodMat.color.set(0x78350f); // Normal wood state
    }
  }, [customWoodColor]);

  // Handle Tree Leaf Color changes
  useEffect(() => {
    const s = stateRef.current;
    if (!s.treeLeafMat) return;
    if (customLeafColor) {
      s.treeLeafMat.color.set(customLeafColor);
    } else {
      s.treeLeafMat.color.set(0x15803d); // Normal leaf state
    }
  }, [customLeafColor]);

  // Handle Tree Cactus Color changes
  useEffect(() => {
    const s = stateRef.current;
    if (!s.treeCactusMat) return;
    if (customCactusColor) {
      s.treeCactusMat.color.set(customCactusColor);
    } else {
      s.treeCactusMat.color.set(0x16a34a); // Default vibrant desert green
    }
  }, [customCactusColor]);

  // Handle Tree Bamboo Color changes
  useEffect(() => {
    const s = stateRef.current;
    if (!s.treeBambooMat) return;
    if (customBambooColor) {
      s.treeBambooMat.color.set(customBambooColor);
    } else {
      s.treeBambooMat.color.set(0x65a30d); // Default lush bamboo lime green
    }
  }, [customBambooColor]);

  // Handle Tree Type changes
  useEffect(() => {
    const s = stateRef.current;
    if (s.rebuildTrees && treeType) {
      s.rebuildTrees(treeType);
    }
  }, [treeType]);

  // Handle Player Appearance Color changes
  useEffect(() => {
    const s = stateRef.current;
    if (s.playerShirtMat) {
      s.playerShirtMat.color.set(playerShirtColor || 0x00a8b5);
    }
    if (s.playerPantsMat) {
      s.playerPantsMat.color.set(playerPantsColor || 0x3b3b98);
    }
    if (s.playerShoesMat) {
      s.playerShoesMat.color.set(playerShoesColor || 0x27272a);
    }
    if (s.playerHairMat) {
      s.playerHairMat.color.set(playerHairColor || 0x4a2a18);
    }
    if (s.playerSkinMat) {
      s.playerSkinMat.color.set(playerSkinColor || 0xc68a5c);
    }
  }, [playerShirtColor, playerPantsColor, playerShoesColor, playerHairColor, playerSkinColor]);

  // Handle House Theme and Custom House Colors changes
  useEffect(() => {
    const s = stateRef.current;
    if (!s.hotBlueMat || !s.lightBlueMat) return;

    if (customHouseBlueColor) {
      s.hotBlueMat.color.set(customHouseBlueColor);
      s.lightBlueMat.color.set(customHouseBlueColor);
    } else {
      if (houseTheme === 'pink') {
        s.hotBlueMat.color.set(0xec4899); // Pink dollhouse
        s.lightBlueMat.color.set(0xfbcfe8);
      } else if (houseTheme === 'modern') {
        s.hotBlueMat.color.set(0x334155); // Slate modern villa
        s.lightBlueMat.color.set(0x94a3b8);
      } else if (houseTheme === 'gold') {
        s.hotBlueMat.color.set(0xd97706); // Royal gold villa
        s.lightBlueMat.color.set(0xfef08a);
      } else {
        // Blue Luxury
        s.hotBlueMat.color.set(0x1d4ed8);
        s.lightBlueMat.color.set(0xbae6fd);
      }
    }

    if (s.whiteMat) {
      if (customHouseWhiteColor) {
        s.whiteMat.color.set(customHouseWhiteColor);
      } else {
        s.whiteMat.color.set(0xffffff);
      }
    }
  }, [houseTheme, customHouseBlueColor, customHouseWhiteColor]);

  const lastAimRef = useRef(false);

  // Provide drop coordinates in front of player
  const getDropCoordinates = (): DroppedPhoneData => {
    const s = stateRef.current;
    if (!s.playerGroup) return { x: 0, y: 0.04, z: 0, rotationY: 0 };
    const px = s.playerGroup.position.x;
    const py = s.playerGroup.position.y;
    const pz = s.playerGroup.position.z;
    let forwardX = 0;
    let forwardZ = 0;
    let rotY = 0;

    if (perspectiveRef.current === 'first-person') {
      rotY = s.fpYaw;
      forwardX = Math.sin(s.fpYaw);
      forwardZ = -Math.cos(s.fpYaw);
    } else {
      rotY = s.playerGroup.rotation.y;
      forwardX = Math.sin(rotY);
      forwardZ = Math.cos(rotY);
    }

    return {
      x: px + forwardX * 1.5,
      y: Math.max(0.04, py + 0.04),
      z: pz + forwardZ * 1.5,
      rotationY: rotY,
    };
  };

  if (onDropCoordsRef) {
    onDropCoordsRef.current = getDropCoordinates;
  }

  // Handle Dropped Phone 3D Model in Scene
  useEffect(() => {
    const s = stateRef.current;
    if (!s.scene) return;

    if (s.droppedPhoneGroup) {
      s.scene.remove(s.droppedPhoneGroup);
      s.droppedPhoneGroup.traverse((child: any) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach((m: any) => m.dispose());
          else child.material.dispose();
        }
      });
      s.droppedPhoneGroup = null;
      s.droppedPhoneRingMat = null;
    }

    if (!droppedPhone) return;

    const phoneGroup = new THREE.Group();
    phoneGroup.name = 'droppedPhoneGroup';

    // 1. Sleek metallic dark chassis
    const bodyGeo = new THREE.BoxGeometry(0.36, 0.025, 0.72);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.35,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0.0125, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    phoneGroup.add(body);

    // 2. Off-state pitch black screen
    const screenGeo = new THREE.PlaneGeometry(0.33, 0.68);
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x050811,
      metalness: 0.2,
      roughness: 0.12,
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.rotation.x = -Math.PI / 2;
    screen.position.set(0, 0.0255, 0);
    phoneGroup.add(screen);

    // 3. Notch / Dynamic island pill
    const notchGeo = new THREE.PlaneGeometry(0.08, 0.018);
    const notchMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const notch = new THREE.Mesh(notchGeo, notchMat);
    notch.rotation.x = -Math.PI / 2;
    notch.position.set(0, 0.026, -0.28);
    phoneGroup.add(notch);

    // 4. Home gesture indicator line
    const homeGeo = new THREE.PlaneGeometry(0.12, 0.01);
    const homeMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
    const home = new THREE.Mesh(homeGeo, homeMat);
    home.rotation.x = -Math.PI / 2;
    home.position.set(0, 0.026, 0.28);
    phoneGroup.add(home);

    // 5. Pulsing glowing interaction ring on ground
    const ringGeo = new THREE.RingGeometry(0.48, 0.54, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, 0.005, 0);
    phoneGroup.add(ring);
    s.droppedPhoneRingMat = ringMat;

    phoneGroup.position.set(droppedPhone.x, droppedPhone.y, droppedPhone.z);
    phoneGroup.rotation.y = droppedPhone.rotationY;

    s.scene.add(phoneGroup);
    s.droppedPhoneGroup = phoneGroup;
  }, [droppedPhone]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // SCENE INITIALIZATION
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfe0ff);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      800
    );
    camera.position.set(0, 6, 22);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.style.touchAction = 'none';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.6;
    controls.panSpeed = 0.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minPolarAngle = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 40;
    controls.target.set(0, 1.5, 20);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbae6fd, 0.4);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    dirLight.position.set(45, 70, 45);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // MATERIALS
    const primaryColor = houseTheme === 'pink' ? 0xec4899 : houseTheme === 'modern' ? 0x334155 : houseTheme === 'gold' ? 0xd97706 : 0x1d4ed8;
    const secondaryColor = houseTheme === 'pink' ? 0xfbcfe8 : houseTheme === 'modern' ? 0x94a3b8 : houseTheme === 'gold' ? 0xfef08a : 0xbae6fd;
    const hotBlueMat = new THREE.MeshStandardMaterial({
      color: customHouseBlueColor ? customHouseBlueColor : primaryColor,
      roughness: 0.3,
    });
    const lightBlueMat = new THREE.MeshStandardMaterial({
      color: customHouseBlueColor ? customHouseBlueColor : secondaryColor,
      roughness: 0.4,
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: customHouseWhiteColor ? customHouseWhiteColor : 0xffffff,
      roughness: 0.2,
    });

    // PROCEDURAL GRASS TEXTURE
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#65a30d';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#4d7c0f' : '#84cc16';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    const grassTexture = new THREE.CanvasTexture(canvas);
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(150, 50);

    const grassMat = new THREE.MeshStandardMaterial({ map: grassTexture, roughness: 0.8 });

    // GROUND (540 x 180)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(540, 180), grassMat);
    ground.position.set(0, 0, 0);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // FENCE HELPER
    function createFenceMesh(width: number, mat: THREE.Material) {
      const fenceGroup = new THREE.Group();
      const picketCount = Math.floor(width / 0.4);

      for (let i = 0; i < picketCount; i++) {
        const picket = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 0.05), mat);
        picket.position.set(-width / 2 + i * 0.4, 0.4, 0);
        fenceGroup.add(picket);
      }

      const rail = new THREE.Mesh(new THREE.BoxGeometry(width, 0.08, 0.06), mat);
      rail.position.set(0, 0.3, 0);
      fenceGroup.add(rail);

      return fenceGroup;
    }

    function createFenceRailing(x: number, y: number, z: number, width: number, mat: THREE.Material) {
      const fence = createFenceMesh(width, mat);
      fence.position.set(x, y, z);
      scene.add(fence);
    }

    function createBoundaryFence(sizeX: number, sizeZ: number, mat: THREE.Material) {
      const halfZ = sizeZ / 2;
      const f1 = createFenceMesh(sizeX, mat);
      f1.position.set(0, 0.4, halfZ);
      scene.add(f1);
      const f2 = createFenceMesh(sizeX, mat);
      f2.position.set(0, 0.4, -halfZ);
      scene.add(f2);
      const f3 = createFenceMesh(sizeZ, mat);
      f3.position.set(-270, 0.4, 0);
      f3.rotation.y = Math.PI / 2;
      scene.add(f3);
      const f4 = createFenceMesh(sizeZ, mat);
      f4.position.set(270, 0.4, 0);
      f4.rotation.y = Math.PI / 2;
      scene.add(f4);
    }

    createBoundaryFence(540, 180, whiteMat);

    // ROOM BUILDER
    function buildDollhouseRoom(
      x: number,
      baseY: number,
      z: number,
      w: number,
      h: number,
      d: number,
      wallMat: THREE.Material,
      trimMat: THREE.Material,
      type: string
    ) {
      const roomGroup = new THREE.Group();

      const backWall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.3), wallMat);
      backWall.position.set(0, h / 2, -d / 2);
      backWall.castShadow = true;
      roomGroup.add(backWall);

      const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, d), wallMat);
      sideWall.position.set(-w / 2, h / 2, 0);
      sideWall.castShadow = true;
      roomGroup.add(sideWall);

      const fence = createFenceMesh(w - 0.4, trimMat);
      fence.position.set(0, 0.4, d / 2 - 0.2);
      roomGroup.add(fence);

      if (type === 'kitchen') {
        const counter = new THREE.Mesh(
          new THREE.BoxGeometry(3.5, 1.4, 1.2),
          new THREE.MeshStandardMaterial({ color: 0x0284c7 })
        );
        counter.position.set(-w / 4, 0.7, -d / 3);
        roomGroup.add(counter);
      } else if (type === 'dining') {
        const table = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.2, 1.8), trimMat);
        table.position.set(0, 0.6, -d / 4);
        roomGroup.add(table);
      } else if (type === 'bedroom') {
        const bed = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 0.8, 3.8),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
        );
        bed.position.set(-w / 4, 0.4, -d / 2 + 2.1);
        roomGroup.add(bed);
      } else if (type === 'vanity') {
        const vanity = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 1.4, 1.0),
          new THREE.MeshStandardMaterial({ color: 0xbae6fd })
        );
        vanity.position.set(0, 0.7, -d / 3);
        roomGroup.add(vanity);
      }

      roomGroup.position.set(x, baseY, z);
      scene.add(roomGroup);
    }

    // BLUE LADDER BUILDER
    function buildBlueLadder(x: number, bottomY: number, topY: number, z: number) {
      const ladderGroup = new THREE.Group();
      const height = topY - bottomY;
      const blueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.1 });
      const darkBlueMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 });

      const railRadius = 0.08;
      const ladderWidth = 0.8;

      const leftRail = new THREE.Mesh(
        new THREE.CylinderGeometry(railRadius, railRadius, height, 12),
        darkBlueMat
      );
      leftRail.position.set(-ladderWidth / 2, height / 2, 0);
      leftRail.castShadow = true;
      ladderGroup.add(leftRail);

      const rightRail = new THREE.Mesh(
        new THREE.CylinderGeometry(railRadius, railRadius, height, 12),
        darkBlueMat
      );
      rightRail.position.set(ladderWidth / 2, height / 2, 0);
      rightRail.castShadow = true;
      ladderGroup.add(rightRail);

      const numRungs = Math.floor(height * 2);
      const stepDist = height / (numRungs + 1);
      for (let i = 1; i <= numRungs; i++) {
        const rung = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, ladderWidth, 8),
          blueMat
        );
        rung.rotation.z = Math.PI / 2;
        rung.position.set(0, i * stepDist, 0);
        rung.castShadow = true;
        ladderGroup.add(rung);
      }

      ladderGroup.position.set(x, bottomY, z);
      scene.add(ladderGroup);
    }

    // ROOF BUILDER
    function buildPitchedRoof(
      x: number,
      baseY: number,
      z: number,
      w: number,
      h: number,
      d: number,
      roofMat: THREE.Material
    ) {
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-w / 2, 0);
      roofShape.lineTo(0, h);
      roofShape.lineTo(w / 2, 0);
      roofShape.closePath();

      const extrudeSettings = { depth: d, bevelEnabled: false };
      const roofGeo = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(x, baseY, z - d / 2);
      roof.castShadow = true;
      scene.add(roof);
    }

    // GAZEBO BUILDER
    function buildOctagonalGazebo(
      x: number,
      baseY: number,
      z: number,
      roofMat: THREE.Material,
      trimMat: THREE.Material,
      deckMat: THREE.Material
    ) {
      const gazeboGroup = new THREE.Group();

      const deck = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 0.4, 8), deckMat);
      deck.position.set(0, 0.2, 0);
      gazeboGroup.add(deck);

      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4.2, 8), trimMat);
        col.position.set(Math.cos(angle) * 3.8, 2.3, Math.sin(angle) * 3.8);
        gazeboGroup.add(col);
      }

      const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.5, 8), roofMat);
      roof.position.set(0, 5.5, 0);
      roof.castShadow = true;
      gazeboGroup.add(roof);

      gazeboGroup.position.set(x, baseY, z);
      scene.add(gazeboGroup);
    }

    // PATIO SET BUILDER
    function createGardenPatioSet(
      x: number,
      baseY: number,
      z: number,
      tableMat: THREE.Material,
      poleMat: THREE.Material
    ) {
      const patioGroup = new THREE.Group();

      const table = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.1, 16), tableMat);
      table.position.set(0, 1.0, 0);
      patioGroup.add(table);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8), poleMat);
      pole.position.set(0, 1.4, 0);
      patioGroup.add(pole);

      const umbrella = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.2, 12), tableMat);
      umbrella.position.set(0, 2.8, 0);
      umbrella.castShadow = true;
      patioGroup.add(umbrella);

      patioGroup.position.set(x, baseY, z);
      scene.add(patioGroup);
    }

    // TREE BUILDERS
    function buildClassicTree(group: THREE.Group, x: number, z: number, woodMat: THREE.Material, leafMat: THREE.Material) {
      const treeG = new THREE.Group();
      treeG.position.set(x, 0, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 3.2, 8), woodMat);
      trunk.position.set(0, 1.6, 0);
      trunk.castShadow = true;
      treeG.add(trunk);

      const mainLeaves = new THREE.Mesh(new THREE.SphereGeometry(2.0, 10, 10), leafMat);
      mainLeaves.position.set(0, 4.0, 0);
      mainLeaves.castShadow = true;
      treeG.add(mainLeaves);

      const sub1 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), leafMat);
      sub1.position.set(0.8, 3.8, 0.5);
      sub1.castShadow = true;
      treeG.add(sub1);

      const sub2 = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 8), leafMat);
      sub2.position.set(-0.7, 4.1, -0.6);
      sub2.castShadow = true;
      treeG.add(sub2);

      const sub3 = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 8), leafMat);
      sub3.position.set(0, 4.7, 0);
      sub3.castShadow = true;
      treeG.add(sub3);

      group.add(treeG);
    }

    function buildCactus(group: THREE.Group, x: number, z: number, cactusMat: THREE.Material) {
      const cactusG = new THREE.Group();
      cactusG.position.set(x, 0, z);

      // Central Column
      const mainStem = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.56, 5.0, 12), cactusMat);
      mainStem.position.set(0, 2.5, 0);
      mainStem.castShadow = true;
      cactusG.add(mainStem);

      const mainDome = new THREE.Mesh(new THREE.SphereGeometry(0.52, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), cactusMat);
      mainDome.position.set(0, 5.0, 0);
      mainDome.castShadow = true;
      cactusG.add(mainDome);

      // Left Arm
      const leftElbow = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.2, 8), cactusMat);
      leftElbow.rotation.z = Math.PI / 2;
      leftElbow.position.set(-0.8, 2.7, 0);
      leftElbow.castShadow = true;
      cactusG.add(leftElbow);

      const leftBranch = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 2.0, 8), cactusMat);
      leftBranch.position.set(-1.4, 3.7, 0);
      leftBranch.castShadow = true;
      cactusG.add(leftBranch);

      const leftDome = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), cactusMat);
      leftDome.position.set(-1.4, 4.7, 0);
      leftDome.castShadow = true;
      cactusG.add(leftDome);

      // Right Arm (higher up)
      const rightElbow = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.1, 8), cactusMat);
      rightElbow.rotation.z = Math.PI / 2;
      rightElbow.position.set(0.75, 3.4, 0);
      rightElbow.castShadow = true;
      cactusG.add(rightElbow);

      const rightBranch = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.7, 8), cactusMat);
      rightBranch.position.set(1.3, 4.25, 0);
      rightBranch.castShadow = true;
      cactusG.add(rightBranch);

      const rightDome = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), cactusMat);
      rightDome.position.set(1.3, 5.1, 0);
      rightDome.castShadow = true;
      cactusG.add(rightDome);

      // Flower bloom on the main peak
      const flower = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.3, 6),
        new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 })
      );
      flower.position.set(0, 5.55, 0);
      cactusG.add(flower);

      group.add(cactusG);
    }

    function buildEvergreenTree(group: THREE.Group, x: number, z: number, woodMat: THREE.Material, leafMat: THREE.Material) {
      const treeG = new THREE.Group();
      treeG.position.set(x, 0, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 3.5, 8), woodMat);
      trunk.position.set(0, 1.75, 0);
      trunk.castShadow = true;
      treeG.add(trunk);

      const tiers = [
        { r: 2.6, h: 2.3, y: 3.2 },
        { r: 2.1, h: 2.1, y: 4.4 },
        { r: 1.6, h: 1.9, y: 5.5 },
        { r: 1.0, h: 1.7, y: 6.5 },
      ];
      tiers.forEach((t) => {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(t.r, t.h, 8), leafMat);
        cone.position.set(0, t.y, 0);
        cone.castShadow = true;
        treeG.add(cone);
      });

      group.add(treeG);
    }

    function buildBamboo(group: THREE.Group, x: number, z: number, bambooMat: THREE.Material) {
      const bambooG = new THREE.Group();
      bambooG.position.set(x, 0, z);

      const stalks = [
        { dx: -0.5, dz: -0.4, h: 6.2, r: 0.14 },
        { dx: 0.5, dz: -0.3, h: 7.2, r: 0.16 },
        { dx: -0.3, dz: 0.5, h: 5.8, r: 0.13 },
        { dx: 0.4, dz: 0.4, h: 6.6, r: 0.15 },
      ];

      stalks.forEach((st) => {
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(st.r, st.r, st.h, 8), bambooMat);
        stalk.position.set(st.dx, st.h / 2, st.dz);
        stalk.castShadow = true;
        bambooG.add(stalk);

        for (let ny = 1.2; ny < st.h - 0.6; ny += 1.2) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(st.r + 0.03, 0.035, 6, 12), bambooMat);
          ring.rotation.x = Math.PI / 2;
          ring.position.set(st.dx, ny, st.dz);
          ring.castShadow = true;
          bambooG.add(ring);

          if (ny >= 3.0) {
            const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.6, 6), bambooMat);
            branch.rotation.z = Math.PI / 3;
            branch.rotation.y = ny * 1.5;
            branch.position.set(st.dx + 0.25, ny + 0.15, st.dz);
            branch.castShadow = true;
            bambooG.add(branch);

            for (let li = 0; li < 3; li++) {
              const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.8), bambooMat);
              leaf.position.set(st.dx + 0.45, ny + 0.2, st.dz + (li - 1) * 0.2);
              leaf.rotation.x = -0.35;
              leaf.rotation.y = (li - 1) * 0.35 + ny * 1.5;
              leaf.castShadow = true;
              bambooG.add(leaf);
            }
          }
        }
      });

      group.add(bambooG);
    }

    function buildPalmTree(group: THREE.Group, x: number, z: number, woodMat: THREE.Material, leafMat: THREE.Material) {
      const palmG = new THREE.Group();
      palmG.position.set(x, 0, z);

      const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, 2.0, 8), woodMat);
      seg1.position.set(0, 1.0, 0);
      seg1.rotation.z = 0.05;
      seg1.castShadow = true;
      palmG.add(seg1);

      const seg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 2.2, 8), woodMat);
      seg2.position.set(0.18, 3.0, 0);
      seg2.rotation.z = 0.12;
      seg2.castShadow = true;
      palmG.add(seg2);

      const seg3 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 2.0, 8), woodMat);
      seg3.position.set(0.48, 4.8, 0);
      seg3.rotation.z = 0.18;
      seg3.castShadow = true;
      palmG.add(seg3);

      const crownX = 0.65;
      const crownY = 5.7;
      const crownZ = 0;

      const coconutGeom = new THREE.SphereGeometry(0.24, 6, 6);
      const c1 = new THREE.Mesh(coconutGeom, woodMat);
      c1.position.set(crownX - 0.2, crownY - 0.15, crownZ);
      palmG.add(c1);
      const c2 = new THREE.Mesh(coconutGeom, woodMat);
      c2.position.set(crownX + 0.15, crownY - 0.15, crownZ + 0.2);
      palmG.add(c2);
      const c3 = new THREE.Mesh(coconutGeom, woodMat);
      c3.position.set(crownX + 0.15, crownY - 0.15, crownZ - 0.2);
      palmG.add(c3);

      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const frondGroup = new THREE.Group();
        frondGroup.position.set(crownX, crownY, crownZ);
        frondGroup.rotation.y = angle;

        const frond = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 2.8), leafMat);
        frond.position.set(0, -0.4, 1.4);
        frond.rotation.x = -0.45;
        frond.castShadow = true;
        frondGroup.add(frond);

        const frondTip = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 1.2), leafMat);
        frondTip.position.set(0, -1.1, 2.8);
        frondTip.rotation.x = -0.75;
        frondTip.castShadow = true;
        frondGroup.add(frondTip);

        palmG.add(frondGroup);
      }

      group.add(palmG);
    }

    function buildChristmasTree(group: THREE.Group, x: number, z: number, woodMat: THREE.Material, leafMat: THREE.Material) {
      const treeG = new THREE.Group();
      treeG.position.set(x, 0, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.44, 3.0, 8), woodMat);
      trunk.position.set(0, 1.5, 0);
      trunk.castShadow = true;
      treeG.add(trunk);

      const tiers = [
        { r: 2.6, h: 2.2, y: 2.9 },
        { r: 2.1, h: 2.0, y: 4.0 },
        { r: 1.6, h: 1.8, y: 5.0 },
        { r: 1.0, h: 1.6, y: 5.9 },
      ];
      tiers.forEach((t) => {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(t.r, t.h, 8), leafMat);
        cone.position.set(0, t.y, 0);
        cone.castShadow = true;
        treeG.add(cone);
      });

      const starMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffaa00,
        emissiveIntensity: 0.9,
        roughness: 0.2,
      });
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), starMat);
      star.position.set(0, 6.85, 0);
      star.rotation.y = Math.PI / 4;
      treeG.add(star);

      const baubleColors = [0xef4444, 0xf59e0b, 0x3b82f6, 0xec4899, 0x10b981, 0x8b5cf6, 0xf8fafc];
      const baubleGeom = new THREE.SphereGeometry(0.18, 6, 6);

      tiers.forEach((t, tierIdx) => {
        const numBaubles = 4 + tierIdx * 2;
        for (let b = 0; b < numBaubles; b++) {
          const angle = (b * Math.PI * 2) / numBaubles + tierIdx * 0.4;
          const bColor = baubleColors[(tierIdx * 3 + b) % baubleColors.length];
          const bMat = new THREE.MeshStandardMaterial({
            color: bColor,
            emissive: bColor,
            emissiveIntensity: 0.35,
            roughness: 0.2,
          });
          const bauble = new THREE.Mesh(baubleGeom, bMat);
          const radius = t.r * 0.88;
          bauble.position.set(
            Math.cos(angle) * radius,
            t.y - t.h * 0.42,
            Math.sin(angle) * radius
          );
          bauble.castShadow = true;
          treeG.add(bauble);
        }
      });

      group.add(treeG);
    }

    // TREE BUILDER & REBUILDER
    const treeWoodMat = new THREE.MeshStandardMaterial({
      color: customWoodColor ? customWoodColor : 0x78350f,
      roughness: 0.8,
    });
    const treeLeafMat = new THREE.MeshStandardMaterial({
      color: customLeafColor ? customLeafColor : 0x15803d,
      roughness: 0.6,
    });
    const treeCactusMat = new THREE.MeshStandardMaterial({
      color: customCactusColor ? customCactusColor : 0x16a34a,
      roughness: 0.7,
    });
    const treeBambooMat = new THREE.MeshStandardMaterial({
      color: customBambooColor ? customBambooColor : 0x65a30d,
      roughness: 0.7,
    });
    stateRef.current.treeWoodMat = treeWoodMat;
    stateRef.current.treeLeafMat = treeLeafMat;
    stateRef.current.treeCactusMat = treeCactusMat;
    stateRef.current.treeBambooMat = treeBambooMat;

    const treesGroup = new THREE.Group();
    scene.add(treesGroup);
    stateRef.current.treesGroup = treesGroup;

    function rebuildTrees(type: TreeType) {
      const group = stateRef.current.treesGroup;
      if (!group) return;
      while (group.children.length > 0) {
        group.remove(group.children[0]);
      }
      const s = stateRef.current;
      const wood = s.treeWoodMat || treeWoodMat;
      const leaf = s.treeLeafMat || treeLeafMat;
      const cactus = s.treeCactusMat || treeCactusMat;
      const bamboo = s.treeBambooMat || treeBambooMat;

      treePositions.forEach((pos) => {
        switch (type) {
          case 'cactus':
            buildCactus(group, pos.x, pos.z, cactus);
            break;
          case 'evergreen':
            buildEvergreenTree(group, pos.x, pos.z, wood, leaf);
            break;
          case 'bamboo':
            buildBamboo(group, pos.x, pos.z, bamboo);
            break;
          case 'palm':
            buildPalmTree(group, pos.x, pos.z, wood, leaf);
            break;
          case 'christmas':
            buildChristmasTree(group, pos.x, pos.z, wood, leaf);
            break;
          case 'classic':
          default:
            buildClassicTree(group, pos.x, pos.z, wood, leaf);
            break;
        }
      });
    }

    stateRef.current.rebuildTrees = rebuildTrees;
    rebuildTrees(treeType || 'classic');

    // BUILD DOLLHOUSE MANSION STRUCTURE
    // Level 1 (Ground Floor)
    const gFloorSlab = new THREE.Mesh(new THREE.BoxGeometry(20, 0.4, 10), lightBlueMat);
    gFloorSlab.position.set(-3, 0.2, -2);
    gFloorSlab.receiveShadow = true;
    scene.add(gFloorSlab);

    buildDollhouseRoom(-8, 0.4, -2, 9, 4.5, 9.6, lightBlueMat, whiteMat, 'kitchen');
    buildDollhouseRoom(2, 0.4, -2, 10, 4.5, 9.6, lightBlueMat, whiteMat, 'dining');

    // Level 2
    const l2Slab = new THREE.Mesh(new THREE.BoxGeometry(20, 0.4, 10), hotBlueMat);
    l2Slab.position.set(-3, 5.1, -2);
    l2Slab.receiveShadow = true;
    scene.add(l2Slab);

    // Gazebo Roof Bridge
    const gazeboBridge = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.3, 6.4), lightBlueMat);
    gazeboBridge.position.set(9.0, 5.1, 5.5);
    gazeboBridge.rotation.y = Math.atan2(7 - 11, 3 - 8);
    gazeboBridge.receiveShadow = true;
    gazeboBridge.castShadow = true;
    scene.add(gazeboBridge);

    const bridgeRailing = createFenceMesh(6.2, whiteMat);
    bridgeRailing.position.set(9.8, 5.3, 5.5);
    bridgeRailing.rotation.y = Math.atan2(7 - 11, 3 - 8) + Math.PI / 2;
    scene.add(bridgeRailing);

    buildDollhouseRoom(-8, 5.3, -2, 9, 4.5, 9.6, lightBlueMat, whiteMat, 'bedroom');
    buildDollhouseRoom(2, 5.3, -2, 10, 4.5, 9.6, lightBlueMat, whiteMat, 'vanity');
    createFenceRailing(-3, 5.5, 2.9, 19.6, whiteMat);

    // Level 3
    const l3Slab = new THREE.Mesh(new THREE.BoxGeometry(12, 0.4, 10), hotBlueMat);
    l3Slab.position.set(-2, 10.0, -2);
    scene.add(l3Slab);

    buildDollhouseRoom(-2, 10.2, -2, 11.5, 4.5, 9.6, lightBlueMat, whiteMat, 'attic');
    createFenceRailing(-2, 10.4, 2.9, 11.2, whiteMat);

    // 1st Blue Ladder connecting Level 2 to Level 3 (Positioned at x: 5.2, z: 2.7)
    buildBlueLadder(5.2, 5.3, 10.2, 2.7);

    // 2nd Blue Ladder connecting Level 3 (Top Attic) to Roof / Chat (Positioned at x: 3.0, z: 2.7)
    buildBlueLadder(3.0, 10.2, 14.8, 2.7);

    // Roofs
    buildPitchedRoof(-2, 14.8, -2, 13, 3.8, 10.4, hotBlueMat);
    buildPitchedRoof(-8, 9.9, -2, 10, 3.2, 10.4, hotBlueMat);
    buildPitchedRoof(11, 10.0, -2, 8, 2.8, 8.4, hotBlueMat);

    // Gazebo & Patio
    buildOctagonalGazebo(11, 0.2, 8, hotBlueMat, whiteMat, lightBlueMat);
    createGardenPatioSet(-12, 0.2, 12, hotBlueMat, whiteMat);

    // CREATE MINECRAFT CHARACTER
    const playerGroup = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(playerSkinColor || 0xc68a5c),
      roughness: 0.8,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(playerHairColor || 0x4a2a18),
      roughness: 0.9,
    });
    const shirtMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(playerShirtColor || 0x00a8b5),
      roughness: 0.7,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(playerPantsColor || 0x3b3b98),
      roughness: 0.7,
    });
    const shoesMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(playerShoesColor || 0x27272a),
      roughness: 0.8,
    });

    stateRef.current.playerSkinMat = skinMat;
    stateRef.current.playerHairMat = hairMat;
    stateRef.current.playerShirtMat = shirtMat;
    stateRef.current.playerPantsMat = pantsMat;
    stateRef.current.playerShoesMat = shoesMat;

    // Head
    const headGroup = new THREE.Group();
    const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), skinMat);
    headBox.position.y = 0.4;
    headBox.castShadow = true;
    headGroup.add(headBox);

    const hairBox = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.45, 0.84), hairMat);
    hairBox.position.set(0, 0.62, -0.02);
    headGroup.add(hairBox);

    headGroup.position.y = 1.4;
    playerGroup.add(headGroup);

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.4), shirtMat);
    torso.position.y = 0.95;
    torso.castShadow = true;
    playerGroup.add(torso);

    // Arms
    const leftArm = new THREE.Group();
    const lArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.35), shirtMat);
    lArmMesh.position.y = -0.45;
    lArmMesh.castShadow = true;
    leftArm.add(lArmMesh);
    leftArm.position.set(-0.58, 1.4, 0);
    playerGroup.add(leftArm);

    const rightArm = new THREE.Group();
    const rArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.35), shirtMat);
    rArmMesh.position.y = -0.45;
    rArmMesh.castShadow = true;
    rightArm.add(rArmMesh);
    rightArm.position.set(0.58, 1.4, 0);
    playerGroup.add(rightArm);

    // Legs & Shoes
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

    playerGroup.position.set(0, 0, 20);
    scene.add(playerGroup);

    // FIRST PERSON HAND
    const fpHandGroup = new THREE.Group();
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.55, 0.22), shirtMat);
    sleeve.position.set(0, -0.1, 0);
    fpHandGroup.add(sleeve);

    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.38, 0.21), skinMat);
    hand.position.set(0, -0.42, 0);
    fpHandGroup.add(hand);

    fpHandGroup.position.set(0.38, -0.32, -0.65);
    fpHandGroup.rotation.set(0.35, -0.25, 0.08);
    fpHandGroup.visible = perspective === 'first-person';

    camera.add(fpHandGroup);
    scene.add(camera);

    controls.target.copy(playerGroup.position).add(new THREE.Vector3(0, 1.5, 0));
    controls.update();

    // STORE IN STATE REF
    stateRef.current.scene = scene;
    stateRef.current.camera = camera;
    stateRef.current.renderer = renderer;
    stateRef.current.controls = controls;
    stateRef.current.playerGroup = playerGroup;
    stateRef.current.leftArm = leftArm;
    stateRef.current.rightArm = rightArm;
    stateRef.current.leftLeg = leftLeg;
    stateRef.current.rightLeg = rightLeg;
    stateRef.current.fpHandGroup = fpHandGroup;
    stateRef.current.dirLight = dirLight;
    stateRef.current.ambientLight = ambientLight;
    stateRef.current.hemiLight = hemiLight;
    stateRef.current.groundMesh = ground;
    stateRef.current.hotBlueMat = hotBlueMat;
    stateRef.current.lightBlueMat = lightBlueMat;
    stateRef.current.whiteMat = whiteMat;

    // 3D PLACE DECORATIONS GROUP (for Island 3D grass tufts, etc.)
    const placeDecorationsGroup = new THREE.Group();
    placeDecorationsGroup.name = 'placeDecorationsGroup';
    scene.add(placeDecorationsGroup);
    stateRef.current.placeDecorationsGroup = placeDecorationsGroup;

    // SNOWFALL PARTICLE SYSTEM (Active for Ice place or Snow land)
    const snowCount = 1800;
    const snowGeo = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(snowCount * 3);
    const snowVelocities = new Float32Array(snowCount * 3);
    for (let i = 0; i < snowCount; i++) {
      snowPositions[i * 3] = (Math.random() - 0.5) * 260;
      snowPositions[i * 3 + 1] = Math.random() * 55;
      snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 260;

      snowVelocities[i * 3] = (Math.random() - 0.5) * 0.08;
      snowVelocities[i * 3 + 1] = 0.12 + Math.random() * 0.18;
      snowVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    }
    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));

    const snowCanvas = document.createElement('canvas');
    snowCanvas.width = 16;
    snowCanvas.height = 16;
    const sctx = snowCanvas.getContext('2d');
    if (sctx) {
      const grad = sctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 16, 16);
    }
    const snowTexture = new THREE.CanvasTexture(snowCanvas);

    const snowMat = new THREE.PointsMaterial({
      size: 0.9,
      map: snowTexture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xffffff,
    });
    const snowParticles = new THREE.Points(snowGeo, snowMat);
    snowParticles.name = 'snowParticles';
    snowParticles.visible = (landPlace === 'ice' || landType === 'snow' || weather === 'snow');
    scene.add(snowParticles);
    stateRef.current.snowParticles = snowParticles;
    stateRef.current.snowVelocities = snowVelocities;

    // RAINFALL PARTICLE SYSTEM (Blue color and smaller droplets)
    const rainCount = 2800;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    const rainVelocities = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 260;
      rainPositions[i * 3 + 1] = Math.random() * 52;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 260;

      rainVelocities[i * 3] = 0.05;
      rainVelocities[i * 3 + 1] = 1.1 + Math.random() * 0.7;
      rainVelocities[i * 3 + 2] = -0.03;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

    const rainCanvas = document.createElement('canvas');
    rainCanvas.width = 4;
    rainCanvas.height = 28;
    const rctx = rainCanvas.getContext('2d');
    if (rctx) {
      const grad = rctx.createLinearGradient(2, 0, 2, 28);
      grad.addColorStop(0, 'rgba(30, 64, 175, 0)');
      grad.addColorStop(0.3, 'rgba(37, 99, 235, 0.75)');
      grad.addColorStop(0.8, 'rgba(96, 165, 250, 0.95)');
      grad.addColorStop(1, 'rgba(191, 219, 254, 1)');
      rctx.fillStyle = grad;
      rctx.fillRect(0, 0, 4, 28);
    }
    const rainTexture = new THREE.CanvasTexture(rainCanvas);

    const rainMat = new THREE.PointsMaterial({
      size: 1.05, // Smaller droplets as requested
      map: rainTexture,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0x3b82f6, // Rich vibrant blue color as requested
    });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    rainParticles.name = 'rainParticles';
    rainParticles.visible = (weather === 'rain'); // Rain only, NOT thunder
    scene.add(rainParticles);
    stateRef.current.rainParticles = rainParticles;
    stateRef.current.rainVelocities = rainVelocities;

    // LIGHTNING SYSTEM (For Thunder weather - 4 simultaneous lightning bolts continuously from 4 locations)
    const lightningGroup = new THREE.Group();
    lightningGroup.name = 'lightningGroup';

    const maxLightningPoints = 512;
    const lightningPositions = new Float32Array(maxLightningPoints * 3);
    const lightningGeo = new THREE.BufferGeometry();
    lightningGeo.setAttribute('position', new THREE.BufferAttribute(lightningPositions, 3));
    lightningGeo.setDrawRange(0, 0);

    const lightningMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 3,
      transparent: true,
      opacity: 0.98,
      blending: THREE.AdditiveBlending,
    });
    const lightningLine = new THREE.LineSegments(lightningGeo, lightningMat);
    lightningGroup.add(lightningLine);

    const lightningLight = new THREE.PointLight(0xdbeafe, 0, 360);
    lightningLight.position.set(0, 42, -45);
    lightningGroup.add(lightningLight);

    lightningGroup.visible = (weather === 'thunder');
    scene.add(lightningGroup);
    stateRef.current.lightningGroup = lightningGroup;
    stateRef.current.lightningLine = lightningLine;
    stateRef.current.lightningLight = lightningLight;

    // 3D TORNADO SYSTEM (Positioned near house, rapid rotation, 10s duration)
    const tornadoGroup = new THREE.Group();
    tornadoGroup.name = 'tornadoGroup';
    tornadoGroup.position.set(24, 0, -18);

    const tCanvas = document.createElement('canvas');
    tCanvas.width = 256;
    tCanvas.height = 256;
    const tctx = tCanvas.getContext('2d');
    if (tctx) {
      tctx.fillStyle = 'rgba(51, 65, 85, 0.2)';
      tctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 32; i++) {
        tctx.fillStyle = i % 2 === 0 ? 'rgba(71, 85, 105, 0.55)' : 'rgba(30, 41, 59, 0.75)';
        const x = (i * 16) % 256;
        tctx.beginPath();
        tctx.moveTo(x, 0);
        tctx.lineTo((x + 70) % 256, 256);
        tctx.lineTo((x + 85) % 256, 256);
        tctx.lineTo((x + 15) % 256, 0);
        tctx.fill();
      }
    }
    const tornadoTex = new THREE.CanvasTexture(tCanvas);
    tornadoTex.wrapS = THREE.RepeatWrapping;
    tornadoTex.wrapT = THREE.RepeatWrapping;
    tornadoTex.repeat.set(2, 1);

    const outerFunnelGeo = new THREE.CylinderGeometry(9.8, 1.2, 30, 32, 12, true);
    const outerFunnelMat = new THREE.MeshStandardMaterial({
      map: tornadoTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.82,
      roughness: 0.85,
      metalness: 0.05,
      color: 0x64748b,
      depthWrite: false,
    });
    const outerFunnel = new THREE.Mesh(outerFunnelGeo, outerFunnelMat);
    outerFunnel.position.y = 15;
    tornadoGroup.add(outerFunnel);

    const innerFunnelGeo = new THREE.CylinderGeometry(8.2, 0.8, 29, 24, 8, true);
    const innerFunnelMat = new THREE.MeshStandardMaterial({
      map: tornadoTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
      roughness: 0.9,
      color: 0x334155,
      depthWrite: false,
    });
    const innerFunnel = new THREE.Mesh(innerFunnelGeo, innerFunnelMat);
    innerFunnel.position.y = 14.5;
    tornadoGroup.add(innerFunnel);

    const groundDustGeo = new THREE.RingGeometry(0.8, 5.2, 32);
    const dustMat = new THREE.MeshBasicMaterial({
      map: tornadoTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      color: 0x475569,
      depthWrite: false,
    });
    const groundDustMesh = new THREE.Mesh(groundDustGeo, dustMat);
    groundDustMesh.rotation.x = Math.PI / 2;
    groundDustMesh.position.y = 0.25;
    tornadoGroup.add(groundDustMesh);

    const tornadoPartCount = 800;
    const tornadoPartGeo = new THREE.BufferGeometry();
    const tornadoPartPos = new Float32Array(tornadoPartCount * 3);
    const tornadoParticleData: { angle: number; y: number; speed: number; radiusBase: number }[] = [];

    for (let i = 0; i < tornadoPartCount; i++) {
      const y = Math.random() * 30;
      const angle = Math.random() * Math.PI * 2;
      const radiusBase = 1.0 + (y / 30) * 8.5;
      const r = radiusBase + (Math.random() - 0.5) * 1.5;
      tornadoPartPos[i * 3] = Math.cos(angle) * r;
      tornadoPartPos[i * 3 + 1] = y;
      tornadoPartPos[i * 3 + 2] = Math.sin(angle) * r;
      tornadoParticleData.push({
        angle,
        y,
        speed: 0.08 + Math.random() * 0.12,
        radiusBase,
      });
    }
    tornadoPartGeo.setAttribute('position', new THREE.BufferAttribute(tornadoPartPos, 3));
    const tornadoPartMat = new THREE.PointsMaterial({
      size: 1.2,
      color: 0x334155,
      transparent: true,
      opacity: 0.85,
    });
    const tornadoParticles = new THREE.Points(tornadoPartGeo, tornadoPartMat);
    tornadoGroup.add(tornadoParticles);

    tornadoGroup.visible = (weather === 'tornado');
    scene.add(tornadoGroup);

    stateRef.current.tornadoGroup = tornadoGroup;
    stateRef.current.tornadoOuterFunnel = outerFunnel;
    stateRef.current.tornadoInnerFunnel = innerFunnel;
    stateRef.current.tornadoTex = tornadoTex;
    stateRef.current.tornadoParticles = tornadoParticles;
    stateRef.current.tornadoParticleData = tornadoParticleData;
    stateRef.current.tornadoStartTime = weather === 'tornado' ? performance.now() : 0;

    // KEYBOARD EVENT LISTENERS
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = stateRef.current.keyState;
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') k.forward = true;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') k.backward = true;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') k.left = true;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') k.right = true;
      if (e.code === 'Space') performJump();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = stateRef.current.keyState;
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') k.forward = false;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') k.backward = false;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') k.left = false;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') k.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // FIRST PERSON VIEW LOOK CONTROLS (Pointer drag to look around in first person)
    let isLooking = false;
    let lookStartX = 0;
    let lookStartY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      if (perspectiveRef.current !== 'first-person') return;
      // Ignore if clicking interactive controls, buttons, joystick or inventory
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, [role="button"], input, a, #joystick-container, #held-phone-container, #fullscreen-phone-modal, #hand-action-btn, #jump-button')) {
        return;
      }
      // Exclude left joystick area (bottom-left) and jump button area (bottom-right)
      if (e.clientX < 170 && e.clientY > window.innerHeight - 170) return;
      if (e.clientX > window.innerWidth - 130 && e.clientY > window.innerHeight - 170) return;
      // Exclude top-left navigation buttons
      if (e.clientY < 90 && e.clientX < 240) return;

      isLooking = true;
      lookStartX = e.clientX;
      lookStartY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isLooking || perspectiveRef.current !== 'first-person') return;
      const dx = e.clientX - lookStartX;
      const dy = e.clientY - lookStartY;
      lookStartX = e.clientX;
      lookStartY = e.clientY;

      const sensitivity = 0.0035;
      // Scrolling finger right rotates view right; scrolling left rotates view left
      stateRef.current.fpYaw -= dx * sensitivity;
      stateRef.current.fpPitch = Math.max(-1.3, Math.min(1.3, stateRef.current.fpPitch - dy * sensitivity));
    };

    const handlePointerUp = () => {
      isLooking = false;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    // RESIZE LISTENER
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // ANIMATION & PHYSICS LOOP
    const animate = () => {
      stateRef.current.animationFrameId = requestAnimationFrame(animate);

      const s = stateRef.current;
      if (s.playerGroup && s.camera && s.controls) {
        const px = s.playerGroup.position.x;
        const pz = s.playerGroup.position.z;

        // Zone detection
        const inGroundFloorSlab = px >= -13 && px <= 7 && pz >= -7 && pz <= 3;
        const distGazebo = Math.hypot(px - 11, pz - 8);
        const inGazeboZone = distGazebo <= 5.2;
        const distGazeboBridge = Math.hypot(px - 9.0, pz - 5.5);
        const inGazeboBridge = distGazeboBridge <= 3.8;
        const inPatioZone = px >= -15.0 && px <= -9.0 && pz >= 9.0 && pz <= 15.0;

        // Ladder 1 (Level 2 -> Level 3) at (5.2, 2.7)
        // Ladder 2 (Level 3 -> Chat/Roof) at (3.0, 2.7)
        const inLadderZone1 = Math.abs(px - 5.2) < 1.4 && Math.abs(pz - 2.7) < 1.4;
        const inLadderZone2 = Math.abs(px - 3.0) < 1.4 && Math.abs(pz - 2.7) < 1.4;

        const inLevel3Slab = px >= -8.0 && px <= 4.0 && pz >= -7.0 && pz <= 3.2;
        const inRoofZone =
          px >= -8.5 && px <= 4.5 && pz >= -7.2 && pz <= 3.2 && s.playerGroup.position.y >= 12.5;

        let inTreeUpper = false;
        for (let i = 0; i < treePositions.length; i++) {
          const dist = Math.hypot(px - treePositions[i].x, pz - treePositions[i].z);
          if (dist <= 3.0 && s.playerGroup.position.y >= 3.0) {
            inTreeUpper = true;
            break;
          }
        }

        const isElevated = s.playerGroup.position.y >= 3.5;
        const inPatioUpper = inPatioZone && s.playerGroup.position.y >= 2.5;
        const inRoof = inRoofZone;
        const inLevel3 =
          inLevel3Slab && s.playerGroup.position.y >= 8.0 && s.playerGroup.position.y < 12.5;
        const inLevel2 =
          (inGroundFloorSlab &&
            s.playerGroup.position.y >= 4.0 &&
            s.playerGroup.position.y < 8.0) ||
          (inGazeboBridge && isElevated);

        // Ladder climbing
        if (inLadderZone2) {
          if (s.keyState.backward || joystickInputRef.current.y > 0.4) {
            s.playerGroup.position.y = Math.max(10.2, s.playerGroup.position.y - 0.2);
          } else {
            s.playerGroup.position.y = Math.min(14.8, s.playerGroup.position.y + 0.2);
          }
          s.playerVelocityY = 0;
          s.isGrounded = true;
        } else if (inLadderZone1) {
          if (s.keyState.backward || joystickInputRef.current.y > 0.4) {
            s.playerGroup.position.y = Math.max(5.3, s.playerGroup.position.y - 0.2);
          } else {
            s.playerGroup.position.y = Math.min(10.2, s.playerGroup.position.y + 0.2);
          }
          s.playerVelocityY = 0;
          s.isGrounded = true;
        } else {
          let targetGroundHeight = 0.0;

          if (inRoof) {
            targetGroundHeight = 14.8;
          } else if (inLevel3) {
            targetGroundHeight = 10.2;
          } else if (inGazeboZone && isElevated) {
            targetGroundHeight = 5.1;
          } else if (inGazeboBridge && isElevated) {
            targetGroundHeight = 5.1;
          } else if (inGazeboZone) {
            targetGroundHeight = 0.2;
          } else if (inPatioUpper) {
            targetGroundHeight = 3.2;
          } else if (inTreeUpper) {
            targetGroundHeight = 4.8;
          } else if (inLevel2) {
            targetGroundHeight = 5.1;
          } else if (inGroundFloorSlab) {
            targetGroundHeight = 0.4;
          } else {
            targetGroundHeight = 0.0;
          }

          s.playerGroup.position.y += s.playerVelocityY;
          s.playerVelocityY += GRAVITY;

          if (s.playerGroup.position.y <= targetGroundHeight) {
            s.playerGroup.position.y = targetGroundHeight;
            s.playerVelocityY = 0;
            s.isGrounded = true;
          } else {
            s.isGrounded = false;
          }
        }

        // Horizontal velocity
        const baseSpeed = 0.26 * playerSpeedMultiplierRef.current;
        let inputX = joystickInputRef.current.x;
        let inputY = joystickInputRef.current.y;

        if (s.keyState.right) inputX += 1;
        if (s.keyState.left) inputX -= 1;
        if (s.keyState.backward) inputY += 1;
        if (s.keyState.forward) inputY -= 1;

        const mag = Math.hypot(inputX, inputY);
        const isMoving = mag > 0.1;
        const curPerspective = perspectiveRef.current;

        if (isMoving) {
          const normX = inputX / (mag > 1 ? mag : 1);
          const normY = inputY / (mag > 1 ? mag : 1);

          let camDir: THREE.Vector3;
          let camRight: THREE.Vector3;

          if (curPerspective === 'first-person') {
            camDir = new THREE.Vector3(Math.sin(s.fpYaw), 0, -Math.cos(s.fpYaw)).normalize();
            camRight = new THREE.Vector3(Math.cos(s.fpYaw), 0, Math.sin(s.fpYaw)).normalize();
          } else {
            camDir = new THREE.Vector3();
            s.camera.getWorldDirection(camDir);
            camDir.y = 0;
            camDir.normalize();
            camRight = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();
          }

          const moveVector = new THREE.Vector3()
            .addScaledVector(camRight, normX)
            .addScaledVector(camDir, -normY);

          if (moveVector.lengthSq() > 0) {
            moveVector.normalize().multiplyScalar(baseSpeed);

            if (curPerspective === 'first-person') {
              s.playerGroup.rotation.y = s.fpYaw;
            } else {
              const targetAngle = Math.atan2(moveVector.x, moveVector.z);
              s.playerGroup.rotation.y = targetAngle;
            }

            const nextX = s.playerGroup.position.x + moveVector.x;
            const nextZ = s.playerGroup.position.z + moveVector.z;

            if (nextX > -268 && nextX < 268 && Math.abs(nextZ) < 88) {
              s.playerGroup.position.x = nextX;
              s.playerGroup.position.z = nextZ;
            }

            // Trigger footstep sound based on landType when player moves on ground
            if (s.isGrounded && !inLadderZone1 && !inLadderZone2) {
              s.distanceAccumulator += moveVector.length();
              if (s.distanceAccumulator - s.lastFootstepDist >= 1.65) {
                s.lastFootstepDist = s.distanceAccumulator;
                ambientSound.playFootstep(landTypeRef.current);
              }
            }
          }

          s.walkCycleTime += 0.2;
          const swing = Math.sin(s.walkCycleTime) * 0.6;

          if (curPerspective === 'third-person') {
            if (s.leftArm && s.rightArm) {
              s.leftArm.rotation.x = swing;
              s.rightArm.rotation.x = -swing;
            }
            if (s.leftLeg && s.rightLeg) {
              s.leftLeg.rotation.x = -swing;
              s.rightLeg.rotation.x = swing;
            }
          }
        } else {
          if (s.leftArm) s.leftArm.rotation.x = 0;
          if (s.rightArm) s.rightArm.rotation.x = 0;
          if (s.leftLeg) s.leftLeg.rotation.x = 0;
          if (s.rightLeg) s.rightLeg.rotation.x = 0;
        }

        const playerEyePos = s.playerGroup.position.clone().add(new THREE.Vector3(0, 1.65, 0));

        if (curPerspective === 'first-person') {
          // In first-person: hide player completely so view of world in front is unobstructed
          s.playerGroup.visible = false;
          if (s.fpHandGroup) s.fpHandGroup.visible = false;
          s.camera.position.copy(playerEyePos);
          const lookDir = new THREE.Vector3(
            Math.sin(s.fpYaw) * Math.cos(s.fpPitch),
            Math.sin(s.fpPitch),
            -Math.cos(s.fpYaw) * Math.cos(s.fpPitch)
          );
          s.camera.lookAt(playerEyePos.clone().add(lookDir));
        } else {
          // In third-person: show player and orbit around
          s.playerGroup.visible = true;
          if (s.fpHandGroup) s.fpHandGroup.visible = false;
          const targetDelta = playerEyePos.clone().sub(s.controls.target);
          s.controls.target.copy(playerEyePos);
          s.camera.position.add(targetDelta);
        }
      }

      // Crosshair / Aim detection on dropped phone in First-Person view
      const activeDroppedPhone = droppedPhoneRef.current;
      const curPerspective = perspectiveRef.current;
      if (activeDroppedPhone && curPerspective === 'first-person' && s.camera) {
        const camDir = new THREE.Vector3();
        s.camera.getWorldDirection(camDir);
        const camPos = s.camera.position;
        const phonePos = new THREE.Vector3(activeDroppedPhone.x, activeDroppedPhone.y + 0.08, activeDroppedPhone.z);
        const toPhone = phonePos.clone().sub(camPos);
        const dist = toPhone.length();
        if (dist <= 7.5) {
          toPhone.normalize();
          const dot = camDir.dot(toPhone);
          const threshold = dist < 2.5 ? 0.90 : dist < 5.0 ? 0.93 : 0.96;
          const isAiming = dot > threshold;
          if (isAiming !== lastAimRef.current) {
            lastAimRef.current = isAiming;
            onAimAtPhoneChangeRef.current?.(isAiming);
          }
          if (s.droppedPhoneRingMat) {
            if (isAiming) {
              s.droppedPhoneRingMat.color.setHex(0xfbbf24);
              s.droppedPhoneRingMat.opacity = 0.9;
            } else {
              s.droppedPhoneRingMat.color.setHex(0x38bdf8);
              s.droppedPhoneRingMat.opacity = 0.4 + Math.sin(Date.now() * 0.006) * 0.25;
            }
          }
        } else {
          if (lastAimRef.current) {
            lastAimRef.current = false;
            onAimAtPhoneChangeRef.current?.(false);
          }
          if (s.droppedPhoneRingMat) {
            s.droppedPhoneRingMat.color.setHex(0x38bdf8);
            s.droppedPhoneRingMat.opacity = 0.35 + Math.sin(Date.now() * 0.005) * 0.2;
          }
        }
      } else {
        if (lastAimRef.current) {
          lastAimRef.current = false;
          onAimAtPhoneChangeRef.current?.(false);
        }
        if (s.droppedPhoneRingMat) {
          s.droppedPhoneRingMat.color.setHex(0x38bdf8);
          s.droppedPhoneRingMat.opacity = 0.35 + Math.sin(Date.now() * 0.005) * 0.2;
        }
      }

      // Pulse ground indicator ring around dropped phone
      if (s.droppedPhoneRingMat && !activeDroppedPhone) {
        s.droppedPhoneRingMat.opacity = 0.35 + Math.sin(Date.now() * 0.005) * 0.2;
      }

      if (s.skyDesignGroup) {
        if (s.currentSkyDesign === 'galaxy') {
          s.skyDesignGroup.rotation.y += 0.0004;
        } else if (s.currentSkyDesign === 'saturn' && s.saturnPlanetMesh) {
          s.saturnPlanetMesh.rotation.y += 0.002;
        }
      }

      // Animate snowfall particles
      if (s.snowParticles && s.snowParticles.visible && s.snowVelocities) {
        const positions = s.snowParticles.geometry.attributes.position.array as Float32Array;
        const count = positions.length / 3;
        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          positions[idx] += s.snowVelocities[idx];
          positions[idx + 1] -= s.snowVelocities[idx + 1];
          positions[idx + 2] += s.snowVelocities[idx + 2];

          // Wrap around top when flake hits ground
          if (positions[idx + 1] < 0) {
            positions[idx + 1] = 50 + Math.random() * 5;
            positions[idx] = (Math.random() - 0.5) * 260;
            positions[idx + 2] = (Math.random() - 0.5) * 260;
          }
        }
        s.snowParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Animate rainfall particles
      if (s.rainParticles && s.rainParticles.visible && s.rainVelocities) {
        const positions = s.rainParticles.geometry.attributes.position.array as Float32Array;
        const count = positions.length / 3;
        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          positions[idx] += s.rainVelocities[idx];
          positions[idx + 1] -= s.rainVelocities[idx + 1];
          positions[idx + 2] += s.rainVelocities[idx + 2];

          if (positions[idx + 1] < 0) {
            positions[idx + 1] = 48 + Math.random() * 6;
            positions[idx] = (Math.random() - 0.5) * 260;
            positions[idx + 2] = (Math.random() - 0.5) * 260;
          }
        }
        s.rainParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Animate subtle cloud drift across the horizon when clouds are present in the sky
      if (s.cloudMat && s.skyDesignGroup && s.skyDesignGroup.children) {
        for (let i = 0; i < s.skyDesignGroup.children.length; i++) {
          const cluster = s.skyDesignGroup.children[i];
          const u = cluster.userData;
          const speed = (u && typeof u.driftSpeed === 'number') ? u.driftSpeed : 0.026;
          cluster.position.x += speed;

          if (u && typeof u.initialY === 'number') {
            cluster.position.y = u.initialY + Math.sin(Date.now() * 0.0005 + (u.phase || 0)) * 0.65;
          }

          // Seamless wrap around when drifting past horizon boundary
          if (cluster.position.x > 250) {
            cluster.position.x = -250;
          }
        }
      }

      // Animate lightning (during thunder weather - 4 simultaneous bolts continuously from 4 different locations)
      if (s.currentWeather === 'thunder' && s.lightningGroup && s.lightningLine && s.lightningLight) {
        s.lightningTimer++;
        if (s.lightningFlashStage === 0 && s.lightningTimer > (3 + Math.random() * 8)) {
          s.lightningTimer = 0;
          const lPositions = (s.lightningLine.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
          let pIdx = 0;

          // 4 distinct sky sectors so 4 bolts emerge simultaneously from 4 separate locations:
          const sectors = [
            { minX: -120, maxX: -40, minZ: -105, maxZ: -25, minY: 44, maxY: 56 }, // Sector 1: Left / Northwest sky
            { minX: 40,   maxX: 120, minZ: -105, maxZ: -25, minY: 44, maxY: 56 }, // Sector 2: Right / Northeast sky
            { minX: -35,  maxX: 35,  minZ: -80,  maxZ: -20, minY: 48, maxY: 60 }, // Sector 3: Center / Zenith sky
            { minX: -90,  maxX: 90,  minZ: -135, maxZ: -70, minY: 42, maxY: 52 }, // Sector 4: Far Horizon sky
          ];

          for (let b = 0; b < 4; b++) {
            const sec = sectors[b];
            const originX = sec.minX + Math.random() * (sec.maxX - sec.minX);
            const originY = sec.minY + Math.random() * (sec.maxY - sec.minY);
            const originZ = sec.minZ + Math.random() * (sec.maxZ - sec.minZ);

            const strikeX = originX + (Math.random() - 0.5) * 45;
            const strikeY = Math.max(0, (Math.random() - 0.2) * 12);
            const strikeZ = originZ + (Math.random() - 0.5) * 45;

            const segments = 14;
            let curX = originX;
            let curY = originY;
            let curZ = originZ;

            for (let step = 1; step <= segments; step++) {
              const frac = step / segments;
              const targetX = originX + (strikeX - originX) * frac + (Math.random() - 0.5) * 5.5;
              const targetY = originY + (strikeY - originY) * frac;
              const targetZ = originZ + (strikeZ - originZ) * frac + (Math.random() - 0.5) * 5.5;

              if (pIdx + 6 <= lPositions.length) {
                lPositions[pIdx++] = curX;
                lPositions[pIdx++] = curY;
                lPositions[pIdx++] = curZ;
                lPositions[pIdx++] = targetX;
                lPositions[pIdx++] = targetY;
                lPositions[pIdx++] = targetZ;
              }

              // Fork 1
              if (step === 5 && pIdx + 6 <= lPositions.length) {
                lPositions[pIdx++] = curX;
                lPositions[pIdx++] = curY;
                lPositions[pIdx++] = curZ;
                lPositions[pIdx++] = curX + (Math.random() - 0.5) * 14;
                lPositions[pIdx++] = curY - 6;
                lPositions[pIdx++] = curZ + (Math.random() - 0.5) * 14;
              }

              // Fork 2
              if (step === 9 && pIdx + 6 <= lPositions.length) {
                lPositions[pIdx++] = curX;
                lPositions[pIdx++] = curY;
                lPositions[pIdx++] = curZ;
                lPositions[pIdx++] = curX + (Math.random() - 0.5) * 16;
                lPositions[pIdx++] = curY - 8;
                lPositions[pIdx++] = curZ + (Math.random() - 0.5) * 16;
              }

              curX = targetX;
              curY = targetY;
              curZ = targetZ;
            }
          }

          s.lightningLine.geometry.setDrawRange(0, pIdx / 3);
          s.lightningLine.geometry.attributes.position.needsUpdate = true;
          s.lightningFlashStage = 9;
        }

        if (s.lightningFlashStage > 0) {
          s.lightningFlashStage--;
          if (s.lightningFlashStage === 8 || s.lightningFlashStage === 7) {
            s.lightningLine.visible = true;
            s.lightningLight.intensity = 7.0;
          } else if (s.lightningFlashStage === 6) {
            s.lightningLine.visible = false;
            s.lightningLight.intensity = 1.5;
          } else if (s.lightningFlashStage === 5 || s.lightningFlashStage === 4) {
            s.lightningLine.visible = true;
            s.lightningLight.intensity = 5.5;
          } else {
            s.lightningLine.visible = false;
            s.lightningLight.intensity *= 0.5;
          }
        }
      }

      // Animate 3D Tornado (rotates and lasts 10 seconds)
      if (s.tornadoGroup && s.tornadoGroup.visible) {
        const now = performance.now();
        if (!s.tornadoStartTime) {
          s.tornadoStartTime = now;
        }
        const elapsed = (now - s.tornadoStartTime) / 1000;

        if (elapsed >= 10.0) {
          s.tornadoGroup.visible = false;
          s.tornadoGroup.scale.set(1, 1, 1);
        } else {
          let currentScale = 1;
          if (elapsed < 0.6) {
            currentScale = elapsed / 0.6;
          } else if (elapsed > 8.5) {
            currentScale = Math.max(0, 1 - (elapsed - 8.5) / 1.5);
          }
          s.tornadoGroup.scale.set(currentScale, currentScale, currentScale);

          if (s.tornadoOuterFunnel) {
            s.tornadoOuterFunnel.rotation.y += 0.14;
            s.tornadoOuterFunnel.position.x = Math.sin(elapsed * 2.8) * 0.8;
            s.tornadoOuterFunnel.position.z = Math.cos(elapsed * 2.2) * 0.8;
          }
          if (s.tornadoInnerFunnel) {
            s.tornadoInnerFunnel.rotation.y -= 0.18;
          }
          if (s.tornadoTex) {
            s.tornadoTex.offset.x -= 0.035;
          }

          if (s.tornadoParticles && s.tornadoParticleData) {
            const pos = (s.tornadoParticles.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
            for (let i = 0; i < s.tornadoParticleData.length; i++) {
              const p = s.tornadoParticleData[i];
              p.angle += p.speed;
              p.y += 0.35;
              if (p.y > 30) p.y = 0.2;
              const r = 1.0 + (p.y / 30) * 8.5 + (Math.sin(p.angle * 2) * 0.8);
              pos[i * 3] = Math.cos(p.angle) * r;
              pos[i * 3 + 1] = p.y;
              pos[i * 3 + 2] = Math.sin(p.angle) * r;
            }
            s.tornadoParticles.geometry.attributes.position.needsUpdate = true;
          }
        }
      }

      if (perspectiveRef.current !== 'first-person') {
        controls.update();
      }
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      if (stateRef.current.animationFrameId) {
        cancelAnimationFrame(stateRef.current.animationFrameId);
      }
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  return <div id="webgl-container" ref={containerRef} />;
};
