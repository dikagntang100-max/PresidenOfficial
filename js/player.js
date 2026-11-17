// ============================================================
// PLAYER - Humanoid 3D Character with Skeletal Animation
// ============================================================
import * as THREE from 'three';

export class Player {
  constructor(scene, president) {
    this.scene = scene;
    this.president = president;
    this.root = new THREE.Group();
    this.group = this.root; // alias
    this.velocity = new THREE.Vector3();
    this.running = false;
    this.speed = 3.5;
    this.runSpeed = 7;
    this.isDriving = false;
    this.currentVehicle = null;
    this.isSitting = false;
    this.firstPerson = false;
    this.walkPhase = 0;
    this.characterParts = {};
    this.buildCharacter();
    scene.add(this.root);
  }

  buildCharacter() {
    const skinColor = 0xE0B080;
    const outfit = this.president.outfit || 'suit_black';
    const isFemale = this.president.character === 'female_suit';

    const outfitColors = {
      suit_black: { jacket: 0x1a1a1a, pants: 0x0a0a0a, shirt: 0xffffff, tie: 0x8b0000 },
      suit_blue: { jacket: 0x1a2a5a, pants: 0x0a1a3a, shirt: 0xffffff, tie: 0x000080 },
      casual: { jacket: 0x4a6a8a, pants: 0x2a3a4a, shirt: 0xffffff, tie: null },
      kunjungan: { jacket: 0x8b4513, pants: 0x3a3a2a, shirt: 0xf0f0e0, tie: null }
    };
    const colors = outfitColors[outfit] || outfitColors.suit_black;

    const matSkin = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 });
    const matJacket = new THREE.MeshStandardMaterial({ color: colors.jacket, roughness: 0.6, metalness: 0.05 });
    const matPants = new THREE.MeshStandardMaterial({ color: colors.pants, roughness: 0.7 });
    const matShirt = new THREE.MeshStandardMaterial({ color: colors.shirt, roughness: 0.5 });
    const matTie = colors.tie ? new THREE.MeshStandardMaterial({ color: colors.tie, roughness: 0.4 }) : null;
    const matHair = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
    const matShoe = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.4, metalness: 0.3 });

    // === TORSO ===
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.65, 0.32),
      matJacket
    );
    torso.position.y = 1.25;
    torso.castShadow = true;
    this.root.add(torso);
    this.characterParts.torso = torso;

    // Shirt (visible front V)
    const shirt = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.5, 0.02),
      matShirt
    );
    shirt.position.set(0, 1.3, 0.17);
    this.root.add(shirt);

    if (matTie) {
      const tie = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.02), matTie);
      tie.position.set(0, 1.28, 0.19);
      this.root.add(tie);
    }

    // === NECK ===
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.09, 0.12, 8),
      matSkin
    );
    neck.position.y = 1.63;
    neck.castShadow = true;
    this.root.add(neck);

    // === HEAD ===
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.82;
    this.root.add(headGroup);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 16),
      matSkin
    );
    head.scale.set(1, 1.15, 1);
    head.castShadow = true;
    headGroup.add(head);

    // Hair
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      matHair
    );
    hair.scale.set(1, 1.1, 1);
    hair.position.y = 0.02;
    headGroup.add(hair);

    if (isFemale) {
      // Longer hair
      const longHair = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.35, 0.15),
        matHair
      );
      longHair.position.set(0, -0.12, -0.06);
      headGroup.add(longHair);
    }

    // Eyes
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), eyeMat);
    eyeL.position.set(-0.055, 0.03, 0.15);
    headGroup.add(eyeL);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.055;
    headGroup.add(eyeR);

    // Nose
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 8), matSkin);
    nose.position.set(0, -0.01, 0.16);
    nose.rotation.x = Math.PI / 2;
    headGroup.add(nose);

    this.characterParts.head = headGroup;

    // === ARMS ===
    this.characterParts.arms = {};

    // Upper arm + lower arm (single mesh for simplicity)
    const armL = new THREE.Group();
    armL.position.set(-0.33, 1.55, 0);
    const upperArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.075, 0.42, 8), matJacket);
    upperArmL.position.y = -0.21;
    upperArmL.castShadow = true;
    armL.add(upperArmL);
    const lowerArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 0.35, 8), matJacket);
    lowerArmL.position.y = -0.58;
    lowerArmL.castShadow = true;
    armL.add(lowerArmL);
    // hand
    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), matSkin);
    handL.scale.set(1, 1.1, 0.7);
    handL.position.y = -0.82;
    armL.add(handL);
    // fingers hint
    for (let i = 0; i < 4; i++) {
      const f = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.07, 0.02), matSkin);
      f.position.set(-0.03 + i * 0.02, -0.9, 0);
      armL.add(f);
    }

    this.root.add(armL);
    this.characterParts.arms.left = armL;

    const armR = armL.clone();
    armR.position.x = 0.33;
    this.root.add(armR);
    this.characterParts.arms.right = armR;

    // === LEGS ===
    this.characterParts.legs = {};

    const legL = new THREE.Group();
    legL.position.set(-0.14, 0.92, 0);
    const thighL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.45, 8), matPants);
    thighL.position.y = -0.22;
    thighL.castShadow = true;
    legL.add(thighL);
    const shinL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.42, 8), matPants);
    shinL.position.y = -0.65;
    shinL.castShadow = true;
    legL.add(shinL);
    // shoe
    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.28), matShoe);
    shoeL.position.set(0, -0.9, 0.05);
    legL.add(shoeL);

    this.root.add(legL);
    this.characterParts.legs.left = legL;

    const legR = legL.clone();
    legR.position.x = 0.14;
    this.root.add(legR);
    this.characterParts.legs.right = legR;
  }

  spawn(x, y, z) {
    this.root.position.set(x, y, z);
  }

  getPosition() {
    return this.root.position;
  }

  getHeadPosition() {
    const p = this.root.position.clone();
    p.y += 1.82;
    return p;
  }

  setFirstPerson(v) {
    this.firstPerson = v;
    // hide head in FP
    this.root.traverse(o => {
      if (o === this.characterParts.head) o.visible = !v;
    });
  }

  update(delta, input, keys, cameraAngle) {
    if (this.isDriving && this.currentVehicle) {
      // vehicle handles movement
      this.root.position.copy(this.currentVehicle.group.position);
      return;
    }
    if (this.isSitting) {
      // idle
      this.animateIdle(delta);
      return;
    }

    const len = Math.sqrt(input.x ** 2 + input.y ** 2);
    if (len > 0.05) {
      // Movement direction relative to camera
      const forward = new THREE.Vector3(
        -Math.sin(cameraAngle),
        0,
        -Math.cos(cameraAngle)
      );
      const right = new THREE.Vector3(
        Math.cos(cameraAngle),
        0,
        -Math.sin(cameraAngle)
      );

      const moveDir = new THREE.Vector3();
      moveDir.addScaledVector(forward, -input.y);
      moveDir.addScaledVector(right, input.x);
      moveDir.normalize();

      const spd = (this.running || keys['ShiftLeft']) ? this.runSpeed : this.speed;
      this.root.position.x += moveDir.x * spd * delta;
      this.root.position.z += moveDir.z * spd * delta;

      // Rotate to face movement
      const targetRot = Math.atan2(moveDir.x, moveDir.z);
      let diff = targetRot - this.root.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.root.rotation.y += diff * 10 * delta;

      // Animate walk/run
      this.animateWalk(delta, spd / 3.5);
    } else {
      this.animateIdle(delta);
    }

    // Keep on ground
    this.root.position.y = 0;

    // Bounds
    const limit = 480;
    this.root.position.x = Math.max(-limit, Math.min(limit, this.root.position.x));
    this.root.position.z = Math.max(-limit, Math.min(limit, this.root.position.z));
  }

  animateWalk(delta, speedMul) {
    this.walkPhase += delta * 8 * speedMul;
    const swing = Math.sin(this.walkPhase) * 0.6 * speedMul;

    // Arms
    if (this.characterParts.arms) {
      this.characterParts.arms.left.rotation.x = swing;
      this.characterParts.arms.right.rotation.x = -swing;
    }
    // Legs
    if (this.characterParts.legs) {
      this.characterParts.legs.left.rotation.x = -swing;
      this.characterParts.legs.right.rotation.x = swing;
    }
    // Head bob
    if (this.characterParts.head) {
      this.characterParts.head.position.y = 1.82 + Math.sin(this.walkPhase * 2) * 0.02;
    }
  }

  animateIdle(delta) {
    // gentle breathing
    this.walkPhase += delta * 1.5;
    if (this.characterParts.head) {
      this.characterParts.head.position.y = 1.82 + Math.sin(this.walkPhase) * 0.005;
    }
    if (this.characterParts.arms) {
      this.characterParts.arms.left.rotation.x *= 0.9;
      this.characterParts.arms.right.rotation.x *= 0.9;
    }
    if (this.characterParts.legs) {
      this.characterParts.legs.left.rotation.x *= 0.9;
      this.characterParts.legs.right.rotation.x *= 0.9;
    }
  }

  sit(seat) {
    this.isSitting = true;
    if (this.characterParts.legs) {
      this.characterParts.legs.left.rotation.x = -Math.PI / 2;
      this.characterParts.legs.right.rotation.x = -Math.PI / 2;
    }
  }

  stand() {
    this.isSitting = false;
    if (this.characterParts.legs) {
      this.characterParts.legs.left.rotation.x = 0;
      this.characterParts.legs.right.rotation.x = 0;
    }
  }

  toggleVehicle(vehicleManager) {
    if (this.isDriving) {
      this.exitVehicle();
    } else {
      // Find nearest vehicle
      let closest = null, minDist = 6;
      for (const v of vehicleManager.vehicles) {
        const d = this.root.position.distanceTo(v.group.position);
        if (d < minDist) { minDist = d; closest = v; }
      }
      if (closest) this.enterVehicle(closest);
      else {
        import('./main.js').then(m => m.showToast('❌ Tidak ada kendaraan dekat'));
      }
    }
  }

  enterVehicle(v) {
    this.isDriving = true;
    this.currentVehicle = v;
    this.root.visible = false;
    v.driver = 'player';
    import('./main.js').then(m => m.showToast(`🚗 Masuk ${v.name}. Gunakan WASD untuk mengemudi`));
  }

  exitVehicle() {
    if (!this.currentVehicle) return;
    const v = this.currentVehicle;
    v.driver = null;
    // place player to the left of vehicle
    this.root.position.copy(v.group.position);
    this.root.position.x += 2;
    this.root.position.y = 0;
    this.isDriving = false;
    this.currentVehicle = null;
    this.root.visible = true;
    import('./main.js').then(m => m.showToast('🚶 Keluar kendaraan'));
  }
}
