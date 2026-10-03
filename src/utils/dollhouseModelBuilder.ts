import * as THREE from 'three';

export function createFenceMesh(width: number, mat: THREE.Material): THREE.Group {
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

export function buildPitchedRoof(
  w: number,
  h: number,
  d: number,
  roofMat: THREE.Material
): THREE.Mesh {
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-w / 2, 0);
  roofShape.lineTo(0, h);
  roofShape.lineTo(w / 2, 0);
  roofShape.closePath();

  const extrudeSettings = { depth: d, bevelEnabled: false };
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.castShadow = true;
  return roof;
}

export function buildDollhouseRoom(
  w: number,
  h: number,
  d: number,
  wallMat: THREE.Material,
  trimMat: THREE.Material,
  type: string
): THREE.Group {
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
      wallMat
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
      wallMat
    );
    bed.position.set(-w / 4, 0.4, -d / 2 + 2.1);
    roomGroup.add(bed);
  } else if (type === 'vanity') {
    const vanity = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.4, 1.0),
      wallMat
    );
    vanity.position.set(0, 0.7, -d / 3);
    roomGroup.add(vanity);
  }

  return roomGroup;
}

export function buildBlueLadder(
  height: number,
  ladderMat: THREE.Material,
  rungMat: THREE.Material
): THREE.Group {
  const ladderGroup = new THREE.Group();
  const railRadius = 0.08;
  const ladderWidth = 0.8;

  const leftRail = new THREE.Mesh(
    new THREE.CylinderGeometry(railRadius, railRadius, height, 12),
    ladderMat
  );
  leftRail.position.set(-ladderWidth / 2, height / 2, 0);
  ladderGroup.add(leftRail);

  const rightRail = new THREE.Mesh(
    new THREE.CylinderGeometry(railRadius, railRadius, height, 12),
    ladderMat
  );
  rightRail.position.set(ladderWidth / 2, height / 2, 0);
  ladderGroup.add(rightRail);

  const numRungs = Math.floor(height * 2);
  const stepDist = height / (numRungs + 1);
  for (let i = 1; i <= numRungs; i++) {
    const rung = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, ladderWidth, 8),
      rungMat
    );
    rung.rotation.z = Math.PI / 2;
    rung.position.set(0, i * stepDist, 0);
    ladderGroup.add(rung);
  }

  return ladderGroup;
}

export function buildOctagonalGazebo(
  roofMat: THREE.Material,
  trimMat: THREE.Material,
  deckMat: THREE.Material
): THREE.Group {
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
  gazeboGroup.add(roof);

  return gazeboGroup;
}

export function createGardenPatioSet(
  tableMat: THREE.Material,
  poleMat: THREE.Material
): THREE.Group {
  const patioGroup = new THREE.Group();

  const table = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.1, 16), tableMat);
  table.position.set(0, 1.0, 0);
  patioGroup.add(table);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8), poleMat);
  pole.position.set(0, 1.4, 0);
  patioGroup.add(pole);

  const umbrella = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.2, 12), tableMat);
  umbrella.position.set(0, 2.8, 0);
  patioGroup.add(umbrella);

  return patioGroup;
}

/**
 * Builds the complete Villa Compound:
 * 3-Level Dollhouse Mansion + Gazebo Bridge + Gazebo + Patio
 */
export function buildCompleteVillaCompound(
  hotBlueMat: THREE.Material,
  lightBlueMat: THREE.Material,
  whiteMat: THREE.Material
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'villaCompound';

  // Ground Floor Slab
  const gFloorSlab = new THREE.Mesh(new THREE.BoxGeometry(20, 0.4, 10), lightBlueMat);
  gFloorSlab.position.set(-3, 0.2, -2);
  root.add(gFloorSlab);

  // Ground Floor Rooms
  const kitchen = buildDollhouseRoom(9, 4.5, 9.6, lightBlueMat, whiteMat, 'kitchen');
  kitchen.position.set(-8, 0.4, -2);
  root.add(kitchen);

  const dining = buildDollhouseRoom(10, 4.5, 9.6, lightBlueMat, whiteMat, 'dining');
  dining.position.set(2, 0.4, -2);
  root.add(dining);

  // Level 2 Slab
  const l2Slab = new THREE.Mesh(new THREE.BoxGeometry(20, 0.4, 10), hotBlueMat);
  l2Slab.position.set(-3, 5.1, -2);
  root.add(l2Slab);

  // Gazebo Roof Bridge
  const gazeboBridge = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.3, 6.4), lightBlueMat);
  gazeboBridge.position.set(9.0, 5.1, 5.5);
  gazeboBridge.rotation.y = Math.atan2(7 - 11, 3 - 8);
  root.add(gazeboBridge);

  const bridgeRailing = createFenceMesh(6.2, whiteMat);
  bridgeRailing.position.set(9.8, 5.3, 5.5);
  bridgeRailing.rotation.y = Math.atan2(7 - 11, 3 - 8) + Math.PI / 2;
  root.add(bridgeRailing);

  // Level 2 Rooms
  const bedroom = buildDollhouseRoom(9, 4.5, 9.6, lightBlueMat, whiteMat, 'bedroom');
  bedroom.position.set(-8, 5.3, -2);
  root.add(bedroom);

  const vanity = buildDollhouseRoom(10, 4.5, 9.6, lightBlueMat, whiteMat, 'vanity');
  vanity.position.set(2, 5.3, -2);
  root.add(vanity);

  const l2Railing = createFenceMesh(19.6, whiteMat);
  l2Railing.position.set(-3, 5.5, 2.9);
  root.add(l2Railing);

  // Level 3 Slab
  const l3Slab = new THREE.Mesh(new THREE.BoxGeometry(12, 0.4, 10), hotBlueMat);
  l3Slab.position.set(-2, 10.0, -2);
  root.add(l3Slab);

  // Level 3 Attic Room
  const attic = buildDollhouseRoom(11.5, 4.5, 9.6, lightBlueMat, whiteMat, 'attic');
  attic.position.set(-2, 10.2, -2);
  root.add(attic);

  const l3Railing = createFenceMesh(11.2, whiteMat);
  l3Railing.position.set(-2, 10.4, 2.9);
  root.add(l3Railing);

  // Ladders
  const ladder1 = buildBlueLadder(10.2 - 5.3, hotBlueMat, lightBlueMat);
  ladder1.position.set(5.2, 5.3, 2.7);
  root.add(ladder1);

  const ladder2 = buildBlueLadder(14.8 - 10.2, hotBlueMat, lightBlueMat);
  ladder2.position.set(3.0, 10.2, 2.7);
  root.add(ladder2);

  // Pitched Roofs
  const roof1 = buildPitchedRoof(13, 3.8, 10.4, hotBlueMat);
  roof1.position.set(-2, 14.8, -2 - 10.4 / 2);
  root.add(roof1);

  const roof2 = buildPitchedRoof(10, 3.2, 10.4, hotBlueMat);
  roof2.position.set(-8, 9.9, -2 - 10.4 / 2);
  root.add(roof2);

  const roof3 = buildPitchedRoof(8, 2.8, 8.4, hotBlueMat);
  roof3.position.set(11, 10.0, -2 - 8.4 / 2);
  root.add(roof3);

  // Gazebo
  const gazebo = buildOctagonalGazebo(hotBlueMat, whiteMat, lightBlueMat);
  gazebo.position.set(11, 0.2, 8);
  root.add(gazebo);

  // Patio
  const patio = createGardenPatioSet(hotBlueMat, whiteMat);
  patio.position.set(-12, 0.2, 12);
  root.add(patio);

  return root;
}
