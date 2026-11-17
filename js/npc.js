import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const FIRST_NAMES = ['Budi', 'Siti', 'Agus', 'Dewi', 'Rudi', 'Rina', 'Joko', 'Ani', 'Hadi', 'Maya', 'Fajar', 'Lina'];
const LAST_NAMES = ['Santoso', 'Wijaya', 'Pratama', 'Sari', 'Kusuma', 'Hartono', 'Lestari', 'Nugroho'];
const JOBS = ['Petani', 'Guru', 'Dokter', 'Pedagang', 'Pegawai', 'Buruh', 'Sopir', 'Nelayan', 'Pensiunan'];
const SHIRT_COLORS = [0x445588, 0x884444, 0x448844, 0x888844, 0x884488, 0x444488, 0x888888, 0xaa6633];

class NPC {
  constructor(scene, position, id) {
    this.scene = scene;
    this.id = id;
    this.name = FIRST_NAMES[Math.floor(Math.random()*FIRST_NAMES.length)] + ' ' + LAST_NAMES[Math.floor(Math.random()*LAST_NAMES.length)];
    this.job = JOBS[Math.floor(Math.random()*JOBS.length)];
    this.group = new THREE.Group();
    this.group.position.copy(position);
    this.rotation = Math.random() * Math.PI * 2;
    this.state = 'idle';
    this.timer = Math.random() * 3;
    this.target = null;
    this.walkPhase = Math.random() * Math.PI * 2;
    this.speed = 1.5;
    this.satisfaction = Math.floor(50 + Math.random() * 40);
    this.build();
    scene.add(this.group);
  }

  build() {
    const shirtColor = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)];
    const isFemale = Math.random() < 0.5;
    const matSkin = new THREE.MeshStandardMaterial({ color: 0xE0B080, roughness: 0.8 });
    const matShirt = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 });
    const matPants = new THREE.MeshStandardMaterial({ color: isFemale ? 0x3a3a5a : 0x2a2a3a, roughness: 0.7 });
    const matHair = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 0.28), matShirt);
    torso.position.y = 1.15;
    torso.castShadow = true;
    this.group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), matSkin);
    head.position.y = 1.58;
    head.scale.y = 1.1;
    head.castShadow = true;
    this.group.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 12, 0, Math.PI*2, 0, Math.PI/2), matHair);
    hair.position.y = 1.6;
    this.group.add(hair);

    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 6);
    this.armL = new THREE.Mesh(armGeo, matShirt);
    this.armL.position.set(-0.28, 1.15, 0);
    this.group.add(this.armL);
    this.armR = this.armL.clone();
    this.armR.position.x = 0.28;
    this.group.add(this.armR);

    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6);
    this.legL = new THREE.Mesh(legGeo, matPants);
    this.legL.position.set(-0.12, 0.55, 0);
    this.group.add(this.legL);
    this.legR = this.legL.clone();
    this.legR.position.x = 0.12;
    this.group.add(this.legR);

    const footGeo = new THREE.BoxGeometry(0.13, 0.08, 0.22);
    const matFoot = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const footL = new THREE.Mesh(footGeo, matFoot);
    footL.position.set(-0.12, 0.04, 0.04);
    this.group.add(footL);
    const footR = footL.clone();
    footR.position.x = 0.12;
    this.group.add(footR);

    this.group.rotation.y = this.rotation;
  }

  update(delta, isNight) {
    this.timer -= delta;
    if (this.timer <= 0) {
      const r = Math.random();
      if (isNight) this.state = r < 0.7 ? 'idle' : 'walk';
      else this.state = r < 0.4 ? 'walk' : 'idle';
      this.timer = 3 + Math.random() * 5;
      if (this.state === 'walk') {
        this.target = new THREE.Vector3((Math.random() - 0.5) * 100, 0, (Math.random() - 0.5) * 100);
      }
    }

    if (this.state === 'walk' && this.target) {
      const dir = this.target.clone().sub(this.group.position);
      dir.y = 0;
      const dist = dir.length();
      if (dist > 1) {
        dir.normalize();
        const targetRot = Math.atan2(dir.x, dir.z);
        let diff = targetRot - this.group.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.group.rotation.y += diff * 5 * delta;
        this.group.position.x += dir.x * this.speed * delta;
        this.group.position.z += dir.z * this.speed * delta;
        this.walkPhase += delta * 8;
        const swing = Math.sin(this.walkPhase) * 0.5;
        this.armL.rotation.x = swing;
        this.armR.rotation.x = -swing;
        this.legL.rotation.x = -swing;
        this.legR.rotation.x = swing;
      } else this.state = 'idle';
    } else {
      this.walkPhase += delta * 2;
      this.armL.rotation.x *= 0.9;
      this.armR.rotation.x *= 0.9;
      this.legL.rotation.x *= 0.9;
      this.legR.rotation.x *= 0.9;
    }
    const lim = 250;
    this.group.position.x = Math.max(-lim, Math.min(lim, this.group.position.x));
    this.group.position.z = Math.max(-lim, Math.min(lim, this.group.position.z));
  }
}

export class NPCManager {
  constructor(scene, world, population) {
    this.scene = scene;
    this.world = world;
    this.population = population;
    this.npcs = [];
  }

  spawnAll(count) {
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      const npc = new NPC(this.scene, new THREE.Vector3(x, 0, z), i);
      this.npcs.push(npc);
    }
  }

  update(delta, isNight) {
    for (const n of this.npcs) n.update(delta, isNight);
  }
                                                       }
