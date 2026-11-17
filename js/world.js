import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import {
  createPalace, createMosque, createHospital, createSchool,
  createSkyscraper, createHouse, createRoad, createTree, createStreetlight
} from './buildings.js';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.buildings = [];
    this.streetlights = [];
    this.minimapRoads = [];
    this.trees = [];
  }

  build() {
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x3a5a3a, roughness: 0.95 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const plaza = new THREE.Mesh(
      new THREE.CircleGeometry(60, 32),
      new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.8 })
    );
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.02;
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    const palace = createPalace();
    palace.position.set(0, 0, 0);
    this.scene.add(palace);
    this.addBuilding(palace, 'palace', 'Istana Presiden', 22, '#ffd700');

    this.buildRoadGrid();

    const mosque = createMosque();
    mosque.position.set(0, 0, -90);
    this.scene.add(mosque);
    this.addBuilding(mosque, 'mosque', 'Masjid Raya', 20, '#22aa55');

    for (let i = 0; i < 3; i++) {
      const m = createMosque();
      m.scale.set(0.4, 0.4, 0.4);
      m.position.set(-80 + i * 80, 0, -140);
      this.scene.add(m);
      this.addBuilding(m, 'mosque', 'Masjid Kecil', 8, '#22aa55');
    }

    const hospital = createHospital();
    hospital.position.set(110, 0, -20);
    this.scene.add(hospital);
    this.addBuilding(hospital, 'hospital', 'Rumah Sakit', 18, '#ff4444');

    const school = createSchool();
    school.position.set(0, 0, 100);
    this.scene.add(school);
    this.addBuilding(school, 'school', 'Sekolah', 15, '#ffaa22');

    const uni = createSchool();
    uni.scale.set(1.6, 1.6, 1.6);
    uni.position.set(-120, 0, 80);
    this.scene.add(uni);
    this.addBuilding(uni, 'university', 'Universitas', 22, '#aa44ff');

    const skyPositions = [
      [-150, -150], [-130, -120], [-180, -100], [-160, -160], [-110, -140],
      [-140, -180], [-100, -110], [-170, -140], [-200, -160], [-130, -180]
    ];
    for (let i = 0; i < skyPositions.length; i++) {
      const [x, z] = skyPositions[i];
      const h = 40 + Math.random() * 50;
      const sk = createSkyscraper(12 + Math.random() * 4, h, 0x445566 + (i % 3) * 0x111111);
      sk.position.set(x, 0, z);
      this.scene.add(sk);
      this.addBuilding(sk, 'skyscraper', 'Gedung', 14, '#6688aa');
    }

    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const radius = 120 + Math.random() * 80;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const house = createHouse(0xd8c8a8 + i * 0x010101);
      house.position.set(x, 0, z);
      house.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(house);
      this.addBuilding(house, 'house', 'Rumah', 6, '#aa8866');
    }

    for (let x = -60; x <= 60; x += 20) {
      for (let z = 140; z <= 200; z += 20) {
        if (Math.random() < 0.6) {
          const h = createHouse(0xddccaa);
          h.position.set(x + (Math.random()-0.5)*4, 0, z + (Math.random()-0.5)*4);
          h.rotation.y = Math.random() * Math.PI * 2;
          this.scene.add(h);
          this.addBuilding(h, 'house', 'Rumah', 5, '#aa8866');
        }
      }
    }

    const mall = createSkyscraper(20, 15, 0xcc8844);
    mall.position.set(80, 0, 60);
    this.scene.add(mall);
    this.addBuilding(mall, 'mall', 'Pusat Perbelanjaan', 18, '#ffaa44');

    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 400;
      const z = (Math.random() - 0.5) * 400;
      if (Math.abs(x) < 30 && Math.abs(z) < 30) continue;
      const t = createTree();
      t.position.set(x, 0, z);
      t.scale.setScalar(0.8 + Math.random() * 0.5);
      this.scene.add(t);
      this.trees.push(t);
    }

    for (let z = -200; z <= 200; z += 25) {
      for (const x of [-12, 12]) {
        const sl = createStreetlight();
        sl.position.set(x, 0, z);
        this.scene.add(sl);
        this.streetlights.push(sl);
      }
    }

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const r = 45;
      const t = createTree();
      t.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      this.scene.add(t);
      this.trees.push(t);
    }
  }

  buildRoadGrid() {
    const roadNS = createRoad(12, 400);
    roadNS.position.set(0, 0.03, 0);
    this.scene.add(roadNS);
    this.minimapRoads.push({ x: 0, z: 0, w: 12, h: 400 });
    this.minimapRoads.push({ x: 0, z: 0, w: 400, h: 12 });

    const roadEW = createRoad(12, 400);
    roadEW.rotation.y = Math.PI / 2;
    roadEW.position.set(0, 0.03, 0);
    this.scene.add(roadEW);

    for (const z of [-60, 60, -140, 140]) {
      const r = createRoad(8, 300);
      r.rotation.y = Math.PI / 2;
      r.position.set(0, 0.03, z);
      this.scene.add(r);
      this.minimapRoads.push({ x: 0, z, w: 300, h: 8 });
    }
    for (const x of [-60, 60, -140, 140]) {
      const r = createRoad(8, 300);
      r.position.set(x, 0.03, 0);
      this.scene.add(r);
      this.minimapRoads.push({ x, z: 0, w: 8, h: 300 });
    }
  }

  addBuilding(group, type, name, radius = 10, minimapColor = '#ffd700') {
    this.buildings.push({ group, type, name, radius, minimapColor });
  }

  setStreetlightsOn(on) {
    for (const sl of this.streetlights) {
      const lamp = sl.userData.lamp;
      if (lamp) lamp.material.emissiveIntensity = on ? 1.2 : 0.1;
    }
  }
  }
