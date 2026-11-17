import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function createPalace(scale = 1) {
  const group = new THREE.Group();
  const matWall = new THREE.MeshStandardMaterial({ color: 0xf0ede0, roughness: 0.8 });
  const matRoof = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.6, metalness: 0.2 });
  const matWindow = new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x4466aa, emissiveIntensity: 0.3, transparent: true, opacity: 0.7 });
  const matGold = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });

  const main = new THREE.Mesh(new THREE.BoxGeometry(30, 14, 22), matWall);
  main.position.y = 7;
  main.castShadow = true;
  main.receiveShadow = true;
  group.add(main);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(32, 2, 24), matRoof);
  roof.position.y = 15;
  group.add(roof);

  const dome = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 16, 0, Math.PI*2, 0, Math.PI/2), matGold);
  dome.position.y = 16;
  group.add(dome);

  for (let i = -3; i <= 3; i++) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 12, 12), matWall);
    col.position.set(i * 3.5, 6, 11.5);
    col.castShadow = true;
    group.add(col);
  }

  for (let row = 0; row < 2; row++) {
    for (let col = -4; col <= 4; col++) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.1), matWindow);
      win.position.set(col * 3, 4 + row * 5, 11.05);
      group.add(win);
    }
  }

  const stepMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
  for (let i = 0; i < 6; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(20, 0.3, 1), stepMat);
    step.position.set(0, 0.15 + i * 0.3, 11 + i * 1);
    group.add(step);
  }

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 8, 8), matGold);
  pole.position.set(0, 20, 0);
  group.add(pole);

  const flag = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), new THREE.MeshStandardMaterial({ color: 0xe63946, side: THREE.DoubleSide }));
  flag.position.set(1.6, 22, 0);
  group.add(flag);

  return group;
}

export function createMosque() {
  const group = new THREE.Group();
  const matWall = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.7 });
  const matDome = new THREE.MeshStandardMaterial({ color: 0x228855, metalness: 0.4, roughness: 0.4 });
  const matGold = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });
  const matWindow = new THREE.MeshStandardMaterial({ color: 0x88ddff, transparent: true, opacity: 0.6 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 20), matWall);
  base.position.y = 5;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const dome = new THREE.Mesh(new THREE.SphereGeometry(6, 32, 20, 0, Math.PI*2, 0, Math.PI/2), matDome);
  dome.position.y = 12;
  dome.castShadow = true;
  group.add(dome);

  const crescentBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8), matGold);
  crescentBase.position.y = 18.5;
  group.add(crescentBase);

  for (const [x, z] of [[-11, -11], [11, -11], [-11, 11], [11, 11]]) {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.3, 22, 12), matWall);
    tower.position.set(x, 11, z);
    tower.castShadow = true;
    group.add(tower);
    const towerTop = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 8), matDome);
    towerTop.position.set(x, 22.5, z);
    group.add(towerTop);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.15, 2, 8), matGold);
    spire.position.set(x, 24.5, z);
    group.add(spire);
  }

  const archMat = new THREE.MeshStandardMaterial({ color: 0xddddcc });
  for (const x of [-6, 0, 6]) {
    const arch = new THREE.Mesh(new THREE.BoxGeometry(3, 6, 0.5), archMat);
    arch.position.set(x, 3, 10.2);
    group.add(arch);
  }

  for (const x of [-7, -3, 3, 7]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.2), matWindow);
    win.position.set(x, 6, 10.1);
    group.add(win);
  }
  return group;
}

export function createHospital() {
  const group = new THREE.Group();
  const matWall = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
  const matWindow = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.7, emissive: 0x4466aa, emissiveIntensity: 0.2 });
  const matRed = new THREE.MeshStandardMaterial({ color: 0xff2222 });

  const main = new THREE.Mesh(new THREE.BoxGeometry(20, 30, 20), matWall);
  main.position.y = 15;
  main.castShadow = true;
  main.receiveShadow = true;
  group.add(main);

  for (let y = 4; y < 30; y += 3) {
    for (let x = -8; x <= 8; x += 3) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.1), matWindow);
      w.position.set(x, y, 10.05);
      group.add(w);
    }
  }

  const cross1 = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 0.3), matRed);
  cross1.position.set(0, 27, 10.2);
  group.add(cross1);
  const cross2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4, 0.3), matRed);
  cross2.position.set(0, 27, 10.2);
  group.add(cross2);
  return group;
}

export function createSchool() {
  const group = new THREE.Group();
  const matWall = new THREE.MeshStandardMaterial({ color: 0xfff8dc, roughness: 0.7 });
  const matRoof = new THREE.MeshStandardMaterial({ color: 0xcc4422, roughness: 0.6 });
  const matWindow = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.7 });

  const main = new THREE.Mesh(new THREE.BoxGeometry(24, 8, 16), matWall);
  main.position.y = 4;
  main.castShadow = true;
  main.receiveShadow = true;
  group.add(main);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(17, 4, 4), matRoof);
  roof.position.y = 10;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  for (let x = -10; x <= 10; x += 4) {
    for (let y = 3; y <= 7; y += 3) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.1), matWindow);
      w.position.set(x, y, 8.05);
      group.add(w);
    }
  }
  return group;
}

export function createSkyscraper(width = 15, height = 60, color = 0x667788) {
  const group = new THREE.Group();
  const matWall = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.3 });
  const matWin = new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x224488, emissiveIntensity: 0.3, transparent: true, opacity: 0.8 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, width), matWall);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const rows = Math.floor(height / 3);
  const cols = Math.floor(width / 2);
  for (let r = 0; r < rows; r++) {
    for (let c = -Math.floor(cols/2); c <= Math.floor(cols/2); c++) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.05), matWin);
      w.position.set(c * 2, 2 + r * 3, width/2 + 0.03);
      group.add(w);
    }
  }
  return group;
}

export function createHouse(color = 0xe8d8b8) {
  const group = new THREE.Group();
  const matWall = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
  const matRoof = new THREE.MeshStandardMaterial({ color: 0x884422, roughness: 0.7 });
  const matWindow = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.7 });
  const matDoor = new THREE.MeshStandardMaterial({ color: 0x552211 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 6), matWall);
  body.position.y = 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(5, 3, 4), matRoof);
  roof.position.y = 5.5;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  const door = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.1), matDoor);
  door.position.set(0, 1, 3.05);
  group.add(door);

  for (const x of [-2, 2]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.1), matWindow);
    win.position.set(x, 2.5, 3.05);
    group.add(win);
  }
  return group;
}

export function createRoad(width = 8, length = 100) {
  const group = new THREE.Group();
  const matRoad = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
  const matLine = new THREE.MeshStandardMaterial({ color: 0xffff00 });

  const road = new THREE.Mesh(new THREE.BoxGeometry(width, 0.1, length), matRoad);
  road.receiveShadow = true;
  group.add(road);

  const line = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.11, length * 0.9), matLine);
  line.position.y = 0.01;
  group.add(line);
  return group;
}

export function createTree() {
  const group = new THREE.Group();
  const matTrunk = new THREE.MeshStandardMaterial({ color: 0x5a3a1a });
  const matLeaf = new THREE.MeshStandardMaterial({ color: 0x2a7a2a, roughness: 0.9 });

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 8), matTrunk);
  trunk.position.y = 1.5;
  trunk.castShadow = true;
  group.add(trunk);

  for (let i = 0; i < 3; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(1.5 - i * 0.3, 10, 8), matLeaf);
    leaf.position.y = 3 + i * 0.8;
    leaf.castShadow = true;
    group.add(leaf);
  }
  return group;
}

export function createStreetlight() {
  const group = new THREE.Group();
  const matPole = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const matLight = new THREE.MeshStandardMaterial({ color: 0xffeeaa, emissive: 0xffeeaa, emissiveIntensity: 0.1 });

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 6, 8), matPole);
  pole.position.y = 3;
  group.add(pole);

  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.1), matPole);
  arm.position.set(0.7, 6, 0);
  group.add(arm);

  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), matLight);
  lamp.position.set(1.4, 6, 0);
  group.add(lamp);
  group.userData.lamp = lamp;
  return group;
    }
