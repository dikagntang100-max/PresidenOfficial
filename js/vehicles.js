// ============================================================
// VEHICLES - Realistic 3D Vehicles with Wheels & Doors
// ============================================================
import * as THREE from 'three';

class Vehicle {
  constructor(scene, type, position) {
    this.type = type;
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.copy(position);
    this.rotation = 0;
    this.speed = 0;
    this.maxSpeed = 20;
    this.driver = null;
    this.wheels = [];
    this.name = type;
    this.build();
    scene.add(this.group);
  }

  build() {
    switch (this.type) {
      case 'presidential': this.buildCar(0x0a0a0a, 0.9, 4.6, 'Presidential Limo', 0xffd700); break;
      case 'sedan': this.buildCar(0x2a4a7a, 0.8, 4.2, 'Sedan', 0xffffff); break;
      case 'suv': this.buildCar(0x1a1a1a, 1.0, 4.4, 'SUV', 0xffffff); break;
      case 'police': this.buildCar(0xffffff, 0.9, 4.2, 'Mobil Polisi', 0x1a4aff); break;
      case 'ambulance': this.buildCar(0xffffff, 1.05, 4.5, 'Ambulans', 0xff2222); break;
      case 'bus': this.buildBus(); break;
      case 'taxi': this.buildCar(0xffcc00, 0.85, 4.2, 'Taksi', 0x000000); break;
      case 'firetruck': this.buildTruck(0xff2222, 1.1, 6.5, 'Pemadam'); break;
      case 'truck': this.buildTruck(0x445566, 1.0, 6.0, 'Truk'); break;
      case 'motorcycle': this.buildMotorcycle(); break;
      case 'helicopter': this.buildHelicopter(); break;
      case 'plane': this.buildPlane(); break;
      case 'ship': this.buildShip(); break;
      default: this.buildCar(0x555555, 0.8, 4.2, 'Kendaraan', 0xffffff);
    }
  }

  buildCar(bodyColor, height, length, name, accentColor) {
    this.name = name;
    this.maxSpeed = 22;

    const matBody = new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.6, roughness: 0.3 });
    const matGlass = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5, metalness: 0.9, roughness: 0.1 });
    const matWheel = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const matRim = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 });
    const matLightF = new THREE.MeshStandardMaterial({ color: 0xffeecc, emissive: 0xffeecc, emissiveIntensity: 0.4 });
    const matLightR = new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xff2222, emissiveIntensity: 0.4 });

    const width = 1.9;

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height * 0.5, length), matBody);
    body.position.y = height * 0.55;
    body.castShadow = true;
    this.group.add(body);

    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(width * 0.9, height * 0.6, length * 0.5), matBody);
    cabin.position.set(0, height * 0.55 + height * 0.45, 0.2);
    cabin.castShadow = true;
    this.group.add(cabin);

    // Windshield
    const shield = new THREE.Mesh(new THREE.BoxGeometry(width * 0.85, height * 0.55, 0.05), matGlass);
    shield.position.set(0, height * 0.55 + height * 0.4, length * 0.5 * 0.35 + 0.2);
    shield.rotation.x = -0.2;
    this.group.add(shield);

    // Side windows
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.03, height * 0.5, length * 0.45), matGlass);
    sideL.position.set(-width/2 + 0.02, height * 0.55 + height * 0.4, 0.2);
    this.group.add(sideL);
    const sideR = sideL.clone();
    sideR.position.x = width/2 - 0.02;
    this.group.add(sideR);

    // Headlights
    const headL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.05), matLightF);
    headL.position.set(-width/2 + 0.25, height * 0.6, -length/2);
    this.group.add(headL);
    const headR = headL.clone();
    headR.position.x = width/2 - 0.25;
    this.group.add(headR);

    // Tail lights
    const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.05), matLightR);
    tailL.position.set(-width/2 + 0.25, height * 0.6, length/2);
    this.group.add(tailL);
    const tailR = tailL.clone();
    tailR.position.x = width/2 - 0.25;
    this.group.add(tailR);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
    const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.26, 8);
    const wheelPositions = [
      [-width/2 + 0.1, 0.35, -length/2 + 1.0],
      [width/2 - 0.1, 0.35, -length/2 + 1.0],
      [-width/2 + 0.1, 0.35, length/2 - 1.0],
      [width/2 - 0.1, 0.35, length/2 - 1.0]
    ];
    for (const pos of wheelPositions) {
      const w = new THREE.Mesh(wheelGeo, matWheel);
      w.rotation.z = Math.PI / 2;
      w.position.set(...pos);
      w.castShadow = true;
      this.group.add(w);
      this.wheels.push(w);
      const rim = new THREE.Mesh(rimGeo, matRim);
      rim.rotation.z = Math.PI / 2;
      rim.position.set(...pos);
      this.group.add(rim);
    }

    // Accent stripe
    if (accentColor) {
      const matAccent = new THREE.MeshStandardMaterial({ color: accentColor });
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(width + 0.02, 0.1, length * 0.8), matAccent);
      stripe.position.set(0, height * 0.7, 0);
      this.group.add(stripe);
    }

    this.addDriverSpot();
  }

  buildBus() {
    this.name = 'Bus';
    this.maxSpeed = 15;
    const matBody = new THREE.MeshStandardMaterial({ color: 0xffbb00, roughness: 0.6 });
    const matGlass = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5 });
    const matWheel = new THREE.MeshStandardMaterial({ color: 0x111111 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.2, 8), matBody);
    body.position.y = 1.6;
    body.castShadow = true;
    this.group.add(body);

    const winStrip = new THREE.Mesh(new THREE.BoxGeometry(2.52, 0.8, 7.5), matGlass);
    winStrip.position.y = 2.2;
    this.group.add(winStrip);

    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.3, 16);
    for (const pos of [[-1.2, 0.45, -2.8], [1.2, 0.45, -2.8], [-1.2, 0.45, 2.8], [1.2, 0.45, 2.8]]) {
      const w = new THREE.Mesh(wheelGeo, matWheel);
      w.rotation.z = Math.PI / 2;
      w.position.set(...pos);
      this.group.add(w);
      this.wheels.push(w);
    }
    this.addDriverSpot();
  }

  buildTruck(color, height, length, name) {
    this.name = name;
    this.maxSpeed = 18;
    const matBody = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
    const matCargo = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });
    const matWheel = new THREE.MeshStandardMaterial({ color: 0x111111 });

    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.8, 2.0), matBody);
    cab.position.set(0, 1.3, -length/2 + 1.2);
    cab.castShadow = true;
    this.group.add(cab);

    const cargo = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, length - 2.2), matCargo);
    cargo.position.set(0, 1.6, 0.8);
    cargo.castShadow = true;
    this.group.add(cargo);

    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    for (const pos of [[-1.0, 0.4, -length/2 + 1.2], [1.0, 0.4, -length/2 + 1.2], [-1.0, 0.4, length/2 - 1.2], [1.0, 0.4, length/2 - 1.2]]) {
      const w = new THREE.Mesh(wheelGeo, matWheel);
      w.rotation.z = Math.PI / 2;
      w.position.set(...pos);
      this.group.add(w);
      this.wheels.push(w);
    }
    this.addDriverSpot();
  }

  buildMotorcycle() {
    this.name = 'Motor';
    this.maxSpeed = 28;
    const matBody = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.7, roughness: 0.3 });
    const matWheel = new THREE.MeshStandardMaterial({ color: 0x111111 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 1.6), matBody);
    body.position.y = 0.8;
    this.group.add(body);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.6), matBody);
    seat.position.set(0, 1.05, -0.1);
    this.group.add(seat);

    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.15, 16);
    for (const z of [-0.8, 0.8]) {
      const w = new THREE.Mesh(wheelGeo, matWheel);
      w.rotation.z = Math.PI / 2;
      w.position.set(0, 0.28, z);
      this.group.add(w);
      this.wheels.push(w);
    }
    this.addDriverSpot();
  }

  buildHelicopter() {
    this.name = 'Helikopter';
    this.maxSpeed = 40;
    const matBody = new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.5 });
    const matGlass = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6 });

    const body = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 12), matBody);
    body.scale.set(1.4, 1, 2);
    body.position.y = 2;
    this.group.add(body);

    const cockpit = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 12), matGlass);
    cockpit.position.set(0, 2, 1.4);
    this.group.add(cockpit);

    const rotor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.08, 0.3), matBody);
    rotor.position.y = 3.3;
    this.group.add(rotor);
    this.rotor = rotor;

    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 3.5), matBody);
    tail.position.set(0, 2, -3);
    this.group.add(tail);

    const tailRotor = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.2, 0.2), matBody);
    tailRotor.position.set(0.2, 2, -4.5);
    this.group.add(tailRotor);
    this.tailRotor = tailRotor;

    const skidGeo = new THREE.CylinderGeometry(0.08, 0.08, 3, 8);
    for (const x of [-1, 1]) {
      const skid = new THREE.Mesh(skidGeo, matBody);
      skid.rotation.x = Math.PI / 2;
      skid.position.set(x, 0.4, 0);
      this.group.add(skid);
    }
    this.isAir = true;
  }

  buildPlane() {
    this.name = 'Pesawat';
    this.maxSpeed = 60;
    const matBody = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, metalness: 0.5 });
    const matAccent = new THREE.MeshStandardMaterial({ color: 0xcc2222 });
    const matGlass = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.6, 12, 16), matBody);
    body.rotation.x = Math.PI / 2;
    body.position.y = 3;
    this.group.add(body);

    const wings = new THREE.Mesh(new THREE.BoxGeometry(14, 0.2, 2), matBody);
    wings.position.set(0, 3, 0);
    this.group.add(wings);

    const tail = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 1.5), matAccent);
    tail.position.set(0, 3.8, -5.5);
    this.group.add(tail);

    const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 10), matGlass);
    cockpit.position.set(0, 3, 5.5);
    this.group.add(cockpit);

    this.isAir = true;
  }

  buildShip() {
    this.name = 'Kapal';
    this.maxSpeed = 12;
    const matHull = new THREE.MeshStandardMaterial({ color: 0x2a3a5a, roughness: 0.7 });
    const matDeck = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.8 });

    const hull = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 12), matHull);
    hull.position.y = 1;
    this.group.add(hull);

    const bow = new THREE.Mesh(new THREE.ConeGeometry(2, 3, 4), matHull);
    bow.rotation.x = Math.PI / 2;
    bow.rotation.z = Math.PI / 4;
    bow.position.set(0, 1, 7);
    this.group.add(bow);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.2, 11.8), matDeck);
    deck.position.y = 2;
    this.group.add(deck);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 3), matDeck);
    cabin.position.set(0, 3, -2);
    this.group.add(cabin);

    this.isWater = true;
  }

  addDriverSpot() {
    // Invisible driver seat reference
    this.driverSeat = new THREE.Vector3(0, 1.5, 0);
  }

  update(delta, player) {
    // Wheel rotation if moving
    if (this.driver === 'player') {
      // Controlled by player input via main
    }
    // Wheels spin
    if (Math.abs(this.speed) > 0.1) {
      for (const w of this.wheels) {
        w.rotation.x += this.speed * delta * 2;
      }
    }
    // Rotor
    if (this.rotor) this.rotor.rotation.y += delta * 20;
    if (this.tailRotor) this.tailRotor.rotation.x += delta * 30;

    // Apply movement
    if (this.speed !== 0) {
      this.group.position.x += Math.sin(this.rotation) * this.speed * delta;
      this.group.position.z += Math.cos(this.rotation) * this.speed * delta;
      // friction
      this.speed *= 0.98;
    }

    this.group.rotation.y = this.rotation;
  }

  setControl(accel, turn, delta) {
    this.speed += accel * delta * 20;
    this.speed = Math.max(-this.maxSpeed * 0.5, Math.min(this.maxSpeed, this.speed));
    this.rotation += turn * delta * 2 * (this.speed > 0 ? 1 : -1);
    // auto slow if no accel
    if (accel === 0) this.speed *= 0.95;
  }
}

// ============================================================
// VEHICLE MANAGER
// ============================================================
export class VehicleManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.vehicles = [];
  }

  spawnAll() {
    const spawns = [
      ['presidential', new THREE.Vector3(-6, 0, 25), Math.PI / 2],
      ['presidential', new THREE.Vector3(-6, 0, 32), Math.PI / 2],
      ['sedan', new THREE.Vector3(6, 0, 25), -Math.PI / 2],
      ['suv', new THREE.Vector3(6, 0, 32), -Math.PI / 2],
      ['police', new THREE.Vector3(0, 0, 40), 0],
      ['police', new THREE.Vector3(0, 0, 46), 0],
      ['ambulance', new THREE.Vector3(30, 0, -20), Math.PI / 2],
      ['firetruck', new THREE.Vector3(-30, 0, -20), Math.PI / 2],
      ['taxi', new THREE.Vector3(15, 0, -40), 0],
      ['taxi', new THREE.Vector3(-15, 0, -40), Math.PI],
      ['bus', new THREE.Vector3(0, 0, -60), 0],
      ['motorcycle', new THREE.Vector3(20, 0, 20), Math.PI / 2],
      ['truck', new THREE.Vector3(-40, 0, -40), 0],
      ['helicopter', new THREE.Vector3(40, 0, 60), 0],
      ['plane', new THREE.Vector3(80, 0, 100), 0],
      ['ship', new THREE.Vector3(-120, 0, -60), 0]
    ];

    for (const [type, pos, rot] of spawns) {
      const v = new Vehicle(this.scene, type, pos);
      v.rotation = rot;
      v.group.rotation.y = rot;
      this.vehicles.push(v);
    }
  }

  update(delta, player) {
    for (const v of this.vehicles) {
      v.update(delta, player);
    }

    // Player controls current vehicle
    if (player.isDriving && player.currentVehicle) {
      const v = player.currentVehicle;
      const keys = window._keys || {};
      let accel = 0;
      let turn = 0;
      if (keys['KeyW'] || keys['ArrowUp']) accel = 1;
      if (keys['KeyS'] || keys['ArrowDown']) accel = -1;
      if (keys['KeyA'] || keys['ArrowLeft']) turn = 1;
      if (keys['KeyD'] || keys['ArrowRight']) turn = -1;
      v.setControl(accel, turn, delta);
    }
  }
    }
