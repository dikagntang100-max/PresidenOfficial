import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { World } from './world.js';
import { Player } from './player.js';
import { NPCManager } from './npc.js';
import { VehicleManager } from './vehicles.js';
import { Government } from './government.js';
import { Economy } from './economy.js';
import { SaveSystem } from './save.js';

export const GameState = {
  country: null,
  president: null,
  started: false,
  paused: false,
  time: {
    hour: 6,
    minute: 0,
    day: 1,
    totalMinutes: 6 * 60,
    speed: 1,
    isNight: false
  },
  weather: 'clear',
  money: 5000000000,
  approval: 75,
  population: 0,
  missions: [],
  properties: [],
  cars: []
};

let scene, camera, renderer, clock;
let world, player, npcManager, vehicleManager, government, economy, saveSystem;
let lastTime = 0;

window.addEventListener('DOMContentLoaded', () => {
  initUI();
  checkSaveData();
});

function initUI() {
  document.getElementById('btn-new-game').onclick = () => showScreen('country-creation');
  document.getElementById('btn-continue').onclick = () => {
    const save = SaveSystem.loadGame();
    if (save) {
      GameState.country = save.country;
      GameState.president = save.president;
      GameState.money = save.money;
      GameState.approval = save.approval;
      GameState.population = save.population;
      startGame(true);
    } else {
      alert('Tidak ada save data.');
    }
  };

  document.getElementById('btn-settings').onclick = () => document.getElementById('settings-modal').classList.add('active');
  document.getElementById('btn-close-settings').onclick = () => document.getElementById('settings-modal').classList.remove('active');
  document.getElementById('btn-back-menu').onclick = () => showScreen('main-menu');
  document.getElementById('btn-start-game').onclick = startNewGame;

  document.querySelectorAll('.char-option').forEach(opt => {
    opt.onclick = () => {
      document.querySelectorAll('.char-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
    };
  });

  const updateFlag = () => {
    const c1 = document.getElementById('in-flag1').value;
    const c2 = document.getElementById('in-flag2').value;
    document.getElementById('flag-preview').style.background = `linear-gradient(180deg, ${c1} 50%, ${c2} 50%)`;
  };
  document.getElementById('in-flag1').oninput = updateFlag;
  document.getElementById('in-flag2').oninput = updateFlag;

  document.getElementById('btn-dashboard').onclick = openDashboard;
  document.getElementById('btn-map').onclick = openMap;
  document.getElementById('btn-missions').onclick = openMissions;
  document.getElementById('btn-government').onclick = openGovernment;
  document.getElementById('btn-economy').onclick = openEconomy;
  document.getElementById('btn-save').onclick = () => {
    SaveSystem.saveGame(GameState);
    showToast('💾 Game disimpan!');
  };
  document.getElementById('btn-menu').onclick = () => {
    if (confirm('Kembali ke menu utama?')) {
      SaveSystem.saveGame(GameState);
      location.reload();
    }
  };

  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      GameState.time.speed = parseInt(btn.dataset.speed);
    };
  });

  document.getElementById('modal-overlay').onclick = (e) => {
    if (e.target.id === 'modal-overlay') document.getElementById('modal-overlay').classList.add('hidden');
  };
}

function checkSaveData() {
  document.getElementById('btn-continue').disabled = !SaveSystem.hasSave();
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function startNewGame() {
  const flag1 = document.getElementById('in-flag1').value;
  const flag2 = document.getElementById('in-flag2').value;

  GameState.country = {
    name: document.getElementById('in-country-name').value || 'Nusantara',
    capital: document.getElementById('in-capital').value || 'Kartika',
    currency: document.getElementById('in-currency').value,
    language: document.getElementById('in-language').value,
    system: document.getElementById('in-system').value,
    economyLevel: document.getElementById('in-economy').value,
    flagColors: [flag1, flag2]
  };

  const selectedChar = document.querySelector('.char-option.active').dataset.char;
  GameState.president = {
    name: document.getElementById('in-president-name').value || 'Presiden',
    character: selectedChar,
    outfit: document.getElementById('in-outfit').value
  };

  GameState.population = parseInt(document.getElementById('in-population').value) || 500000;
  const economyMap = { 'Berkembang': 5000000000, 'Menengah': 20000000000, 'Maju': 50000000000 };
  GameState.money = economyMap[GameState.country.economyLevel] || 5000000000;

  startGame(false);
}

function startGame(fromSave) {
  showScreen('loading-screen');
  GameState.started = true;

  setTimeout(() => {
    document.getElementById('progress-fill').style.width = '30%';
    document.getElementById('loading-text').textContent = 'Membangun dunia...';
  }, 200);

  setTimeout(() => initThreeJS(), 500);

  setTimeout(() => {
    document.getElementById('progress-fill').style.width = '100%';
    document.getElementById('loading-text').textContent = 'Siap!';
  }, 1500);

  setTimeout(() => {
    showScreen('game-screen');
    updateHUD();
    showToast(`Selamat datang, Presiden ${GameState.president.name}!`);
    if (!fromSave) {
      SaveSystem.saveGame(GameState);
      addInitialMissions();
    }
    animate();
  }, 1800);
}

function initThreeJS() {
  const canvas = document.getElementById('game-canvas');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 80, 400);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 8, 15);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  clock = new THREE.Clock();

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444466, 0.8);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff5e0, 2.2);
  sun.position.set(80, 120, 60);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -200;
  sun.shadow.camera.right = 200;
  sun.shadow.camera.top = 200;
  sun.shadow.camera.bottom = -200;
  sun.shadow.camera.far = 500;
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  scene.userData.sun = sun;
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  world = new World(scene);
  world.build();

  player = new Player(scene, GameState.president);
  player.spawn(0, 0, 0);

  npcManager = new NPCManager(scene, world, GameState.population);
  npcManager.spawnAll(120);

  vehicleManager = new VehicleManager(scene, world);
  vehicleManager.spawnAll();

  government = new Government(GameState);
  economy = new Economy(GameState);

  setupCamera();
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  setupInput();
  setupMobileControls();
}

let cameraAngle = 0;
let cameraPitch = 0.35;
let cameraDistance = 9;
let cameraMode = 'third';

function setupCamera() {
  const canvas = renderer.domElement;
  let isDragging = false;
  let lastX = 0, lastY = 0;

  canvas.addEventListener('mousedown', (e) => { if (e.button === 0 && !player.isDriving) { isDragging = true; lastX = e.clientX; lastY = e.clientY; } });
  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      cameraAngle -= (e.clientX - lastX) * 0.005;
      cameraPitch = Math.max(0.05, Math.min(1.2, cameraPitch + (e.clientY - lastY) * 0.003));
      lastX = e.clientX; lastY = e.clientY;
    }
  });
  window.addEventListener('mouseup', () => isDragging = false);

  let touchStartX = 0, touchStartY = 0, touchId = null;
  canvas.addEventListener('touchstart', (e) => {
    for (const touch of e.touches) {
      if (touch.clientX > window.innerWidth * 0.35) {
        touchId = touch.identifier;
        touchStartX = touch.clientX; touchStartY = touch.clientY;
        break;
      }
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    for (const touch of e.touches) {
      if (touch.identifier === touchId) {
        cameraAngle -= (touch.clientX - touchStartX) * 0.008;
        cameraPitch = Math.max(0.05, Math.min(1.2, cameraPitch + (touch.clientY - touchStartY) * 0.005));
        touchStartX = touch.clientX; touchStartY = touch.clientY;
        break;
      }
    }
  }, { passive: true });

  canvas.addEventListener('touchend', () => { touchId = null; });
  canvas.addEventListener('wheel', (e) => { cameraDistance = Math.max(4, Math.min(20, cameraDistance + e.deltaY * 0.01)); });
}

const keys = {};
window._keys = keys;

function setupInput() {
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'KeyE') tryInteract();
    if (e.code === 'KeyF') player.toggleVehicle(vehicleManager);
    if (e.code === 'KeyC') {
      cameraMode = cameraMode === 'third' ? 'first' : 'third';
      player.setFirstPerson(cameraMode === 'first');
    }
    if (e.code === 'Escape') document.getElementById('modal-overlay').classList.add('hidden');
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
}

let joystickActive = false;
let joystickVec = { x: 0, y: 0 };

function setupMobileControls() {
  const base = document.getElementById('joystick-base');
  const knob = document.getElementById('joystick-knob');
  const maxDist = 40;

  const onStart = (e) => { e.preventDefault(); joystickActive = true; };
  const onMove = (e) => {
    if (!joystickActive) return;
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = touch.clientX - cx;
    let dy = touch.clientY - cy;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > maxDist) { dx = (dx / dist) * maxDist; dy = (dy / dist) * maxDist; }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    joystickVec.x = dx / maxDist;
    joystickVec.y = dy / maxDist;
  };
  const onEnd = () => {
    joystickActive = false;
    knob.style.transform = 'translate(-50%, -50%)';
    joystickVec = { x: 0, y: 0 };
  };

  base.addEventListener('touchstart', onStart, { passive: false });
  base.addEventListener('touchmove', onMove, { passive: false });
  base.addEventListener('touchend', onEnd);
  base.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', (e) => { if (joystickActive) onMove(e); });
  window.addEventListener('mouseup', onEnd);

  document.getElementById('btn-run').ontouchstart = () => player.running = true;
  document.getElementById('btn-run').ontouchend = () => player.running = false;
  document.getElementById('btn-run').onmousedown = () => player.running = true;
  document.getElementById('btn-run').onmouseup = () => player.running = false;
  document.getElementById('btn-interact').onclick = tryInteract;
  document.getElementById('btn-enter-vehicle').onclick = () => player.toggleVehicle(vehicleManager);
}

let nearbyInteraction = null;

function tryInteract() {
  if (!nearbyInteraction) return;
  const { type, object, data } = nearbyInteraction;
  if (type === 'vehicle') player.enterVehicle(object);
  else if (type === 'npc') handleNPCDialog(data);
  else if (type === 'building') handleBuildingEnter(data);
}

function handleNPCDialog(npc) {
  const greetings = [
    `Selamat pagi, Pak Presiden! Kami bangga pada Anda.`,
    `Pak Presiden! Tolong perbaiki jalan di desa kami.`,
    `Terima kasih Pak Presiden atas bantuannya.`,
    `Pak Presiden, harga sembako naik terus...`,
    `Semoga Presiden sehat selalu!`,
    `Pak, tolong bangun sekolah di daerah kami.`
  ];
  const msg = greetings[Math.floor(Math.random() * greetings.length)];
  showToast(`👤 ${npc.name}: "${msg}"`);
  GameState.approval = Math.min(100, GameState.approval + 0.5);
  updateHUD();
}

function handleBuildingEnter(building) {
  if (building.type === 'palace') showToast('🏛 Anda memasuki Istana Presiden');
  else if (building.type === 'mosque') {
    showToast('🕌 Anda memasuki Masjid. Beribadah dengan khusyuk.');
    GameState.approval = Math.min(100, GameState.approval + 2);
  } else if (building.type === 'hospital') {
    showToast('🏥 Anda mengunjungi Rumah Sakit. Rakyat senang!');
    GameState.approval = Math.min(100, GameState.approval + 1.5);
  } else if (building.type === 'school') {
    showToast('🏫 Anda mengunjungi Sekolah.');
    GameState.approval = Math.min(100, GameState.approval + 1);
  } else showToast(`📍 Anda memasuki ${building.name || building.type}`);
  updateHUD();
}

let lastHUDTime = 0;

function animate() {
  if (!GameState.started) return;
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);
  const elapsed = clock.elapsedTime;

  updateGameTime(delta);
  const input = getInputVector();
  player.update(delta, input, keys, cameraAngle);
  npcManager.update(delta, GameState.time.isNight);
  vehicleManager.update(delta, player);
  updateCamera(delta);
  detectInteractions();

  if (elapsed - lastHUDTime > 0.2) {
    updateHUD();
    lastHUDTime = elapsed;
  }

  economy.tick(delta, GameState);
  updateWeather(delta);
  renderer.render(scene, camera);
  drawMinimap();
}

function updateGameTime(delta) {
  const minutesPerSecond = GameState.time.speed / 60;
  GameState.time.totalMinutes += delta * minutesPerSecond;
  const totalMin = GameState.time.totalMinutes;
  GameState.time.hour = Math.floor((totalMin / 60) % 24);
  GameState.time.minute = Math.floor(totalMin % 60);
  GameState.time.day = Math.floor(totalMin / (60 * 24)) + 1;

  const h = GameState.time.hour;
  GameState.time.isNight = h < 6 || h >= 18;

  const t = (totalMin / 60) % 24;
  let skyColor;
  if (t >= 6 && t < 12) skyColor = new THREE.Color().lerpColors(new THREE.Color(0x2a3a5a), new THREE.Color(0x87ceeb), (t-6)/6);
  else if (t >= 12 && t < 18) skyColor = new THREE.Color().lerpColors(new THREE.Color(0x87ceeb), new THREE.Color(0xff8844), (t-12)/6);
  else if (t >= 18 && t < 21) skyColor = new THREE.Color().lerpColors(new THREE.Color(0xff8844), new THREE.Color(0x0a0a2a), (t-18)/3);
  else skyColor = new THREE.Color(0x0a0a2a);
  scene.background = skyColor;
  if (scene.fog) scene.fog.color.copy(skyColor);

  const sun = scene.userData.sun;
  if (sun) {
    const angle = ((t - 6) / 12) * Math.PI;
    sun.position.set(Math.cos(angle) * 200, Math.sin(angle) * 200, 60);
    sun.intensity = Math.max(0.1, Math.sin(angle) * 2.2);
    sun.color.setHSL(0.12, 0.5, 0.5 + 0.4 * Math.sin(angle));
  }
  world.setStreetlightsOn(GameState.time.isNight);
}

let weatherTimer = 0;
function updateWeather(delta) {
  weatherTimer += delta;
  if (weatherTimer > 120) {
    weatherTimer = 0;
    if (Math.random() < 0.3) {
      const options = ['clear', 'cloudy', 'rain', 'fog'];
      GameState.weather = options[Math.floor(Math.random() * options.length)];
      applyWeather(GameState.weather);
    }
  }
}

function applyWeather(w) {
  const sun = scene.userData.sun;
  if (!sun) return;
  switch (w) {
    case 'clear': sun.intensity = 2.2; scene.fog.far = 400; break;
    case 'cloudy': sun.intensity = 1.2; scene.fog.far = 300; break;
    case 'rain': sun.intensity = 0.6; scene.fog.far = 150; scene.background = new THREE.Color(0x5a5a6a); scene.fog.color.set(0x5a5a6a); break;
    case 'fog': sun.intensity = 1.0; scene.fog.far = 80; break;
  }
}

function getInputVector() {
  let x = 0, y = 0;
  if (keys['KeyW'] || keys['ArrowUp']) y -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) y += 1;
  if (keys['KeyA'] || keys['ArrowLeft']) x -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) x += 1;
  if (joystickVec.x !== 0 || joystickVec.y !== 0) { x = joystickVec.x; y = joystickVec.y; }
  return { x, y };
}

function updateCamera(delta) {
  if (!player) return;
  if (player.isDriving) {
    const v = player.currentVehicle;
    const target = v.group.position.clone().add(new THREE.Vector3(0, 3, 0));
    const offset = new THREE.Vector3(-Math.sin(v.rotation) * 10, 6, -Math.cos(v.rotation) * 10);
    camera.position.lerp(target.clone().add(offset), 0.1);
    camera.lookAt(target);
    return;
  }
  const playerPos = player.getPosition();
  if (cameraMode === 'first') {
    const headPos = player.getHeadPosition();
    camera.position.copy(headPos);
    const dir = new THREE.Vector3(-Math.sin(cameraAngle), 0, -Math.cos(cameraAngle));
    camera.lookAt(headPos.clone().add(dir));
    return;
  }
  const offsetX = Math.sin(cameraAngle) * Math.cos(cameraPitch) * cameraDistance;
  const offsetZ = Math.cos(cameraAngle) * Math.cos(cameraPitch) * cameraDistance;
  const offsetY = Math.sin(cameraPitch) * cameraDistance + 3;
  const desired = new THREE.Vector3(playerPos.x + offsetX, playerPos.y + offsetY, playerPos.z + offsetZ);
  camera.position.lerp(desired, 0.15);
  camera.lookAt(playerPos.x, playerPos.y + 1.6, playerPos.z);
}

function detectInteractions() {
  if (!player) return;
  const pPos = player.getPosition();
  nearbyInteraction = null;
  let closest = Infinity;
  for (const v of vehicleManager.vehicles) {
    const d = pPos.distanceTo(v.group.position);
    if (d < 4 && d < closest) { closest = d; nearbyInteraction = { type: 'vehicle', object: v }; }
  }
  for (const n of npcManager.npcs) {
    const d = pPos.distanceTo(n.group.position);
    if (d < 3 && d < closest) { closest = d; nearbyInteraction = { type: 'npc', data: n }; }
  }
  for (const b of world.buildings) {
    const d = pPos.distanceTo(b.group.position);
    if (d < b.radius && d < closest) { closest = d; nearbyInteraction = { type: 'building', data: b }; }
  }
  const prompt = document.getElementById('interaction-prompt');
  if (nearbyInteraction) {
    let label = 'Interaksi';
    if (nearbyInteraction.type === 'vehicle') label = 'Masuk Kendaraan';
    else if (nearbyInteraction.type === 'npc') label = 'Bicara';
    else if (nearbyInteraction.type === 'building') label = 'Masuk';
    prompt.querySelector('.prompt-text').textContent = label;
    prompt.classList.remove('hidden');
  } else prompt.classList.add('hidden');
}

function updateHUD() {
  if (!GameState.country) return;
  document.getElementById('hud-country').textContent = GameState.country.name;
  document.getElementById('hud-money').textContent = formatMoney(GameState.money);
  document.getElementById('hud-pop').textContent = formatNumber(GameState.population);
  document.getElementById('hud-approval').textContent = Math.round(GameState.approval) + '%';
  const h = String(GameState.time.hour).padStart(2, '0');
  const m = String(GameState.time.minute).padStart(2, '0');
  document.getElementById('hud-time').textContent = `${h}:${m}`;
  document.getElementById('hud-day').textContent = `Hari ${GameState.time.day}`;
  const wIcon = { clear: '☀️', cloudy: '☁️', rain: '🌧', fog: '🌫' };
  document.getElementById('hud-weather').textContent = wIcon[GameState.weather] || '☀️';
}

function formatMoney(v) {
  const cur = GameState.country?.currency || 'IDR';
  const sym = { IDR: 'Rp', USD: '$', EUR: '€', MYR: 'RM' }[cur] || 'Rp';
  if (v >= 1e12) return sym + ' ' + (v / 1e12).toFixed(2) + 'T';
  if (v >= 1e9) return sym + ' ' + (v / 1e9).toFixed(2) + 'M';
  if (v >= 1e6) return sym + ' ' + (v / 1e6).toFixed(1) + 'Jt';
  return sym + ' ' + v.toLocaleString();
}

function formatNumber(v) {
  if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(0) + 'K';
  return v.toString();
}

const mmCanvas = document.getElementById('minimap-canvas');
const mmCtx = mmCanvas.getContext('2d');
let mmTicker = 0;

function drawMinimap() {
  mmTicker++;
  if (mmTicker % 3 !== 0) return;
  if (!player) return;
  const W = mmCanvas.width, H = mmCanvas.height;
  const cx = W / 2, cy = H / 2;
  const scale = 0.6;
  mmCtx.clearRect(0, 0, W, H);
  mmCtx.fillStyle = '#1a1a3a';
  mmCtx.fillRect(0, 0, W, H);
  const pPos = player.getPosition();
  mmCtx.save();
  mmCtx.translate(cx, cy);
  mmCtx.rotate(-cameraAngle);
  mmCtx.fillStyle = '#444';
  for (const r of world.minimapRoads) {
    mmCtx.fillRect((r.x - pPos.x) * scale - r.w * scale / 2, (r.z - pPos.z) * scale - r.h * scale / 2, r.w * scale, r.h * scale);
  }
  for (const b of world.buildings) {
    const dx = (b.group.position.x - pPos.x) * scale;
    const dz = (b.group.position.z - pPos.z) * scale;
    if (Math.abs(dx) < cx && Math.abs(dz) < cy) {
      mmCtx.fillStyle = b.minimapColor || '#ffd700';
      mmCtx.fillRect(dx - 3, dz - 3, 6, 6);
    }
  }
  mmCtx.fillStyle = '#4ecdc4';
  for (const n of npcManager.npcs) {
    const dx = (n.group.position.x - pPos.x) * scale;
    const dz = (n.group.position.z - pPos.z) * scale;
    if (Math.abs(dx) < cx && Math.abs(dz) < cy) mmCtx.fillRect(dx - 1, dz - 1, 2, 2);
  }
  mmCtx.restore();
  mmCtx.fillStyle = '#ff4444';
  mmCtx.beginPath();
  mmCtx.moveTo(cx, cy - 6);
  mmCtx.lineTo(cx - 4, cy + 4);
  mmCtx.lineTo(cx + 4, cy + 4);
  mmCtx.closePath();
  mmCtx.fill();
}

function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function openDashboard() {
  openModal(`
    <h2>📊 Dashboard Presiden</h2>
    <p style="color:#888;margin-bottom:16px">${GameState.president.name} · ${GameState.country.name}</p>
    <h3>Negara</h3>
    <div class="stat-row"><span>Ibu Kota</span><span class="val">${GameState.country.capital}</span></div>
    <div class="stat-row"><span>Sistem</span><span class="val">${GameState.country.system}</span></div>
    <div class="stat-row"><span>Populasi</span><span class="val">${GameState.population.toLocaleString()}</span></div>
    <h3>Ekonomi</h3>
    <div class="stat-row"><span>Kas Negara</span><span class="val">${formatMoney(GameState.money)}</span></div>
    <div class="stat-row"><span>Inflasi</span><span class="val">${economy.meta.inflation.toFixed(1)}%</span></div>
    <div class="stat-row"><span>Pengangguran</span><span class="val">${economy.meta.unemployment.toFixed(1)}%</span></div>
    <h3>Rakyat</h3>
    <div class="stat-row"><span>Kepuasan</span><span class="val">${GameState.approval.toFixed(0)}%</span></div>
    <button class="modal-close" onclick="document.getElementById('modal-overlay').classList.add('hidden')">Tutup</button>
  `);
}

function openMap() {
  openModal(`
    <h2>🗺 Peta Negara</h2>
    <div style="display:grid;gap:8px;margin-bottom:16px">
      <div class="stat-row"><span>🏛 Istana Presiden</span><span class="val">Pusat</span></div>
      <div class="stat-row"><span>🕌 Masjid Raya</span><span class="val">Utara</span></div>
      <div class="stat-row"><span>🏥 Rumah Sakit</span><span class="val">Timur</span></div>
      <div class="stat-row"><span>🏫 Sekolah</span><span class="val">Selatan</span></div>
      <div class="stat-row"><span>🏢 Pusat Kota</span><span class="val">Barat</span></div>
    </div>
    <button class="modal-close" onclick="document.getElementById('modal-overlay').classList.add('hidden')">Tutup</button>
  `);
}

function openMissions() {
  const listHtml = GameState.missions.map(m => `
    <div class="stat-row">
      <span>${m.done ? '✅' : '⏳'} ${m.title}</span>
      <span class="val">${m.done ? 'Selesai' : m.progress + '/' + m.target}</span>
    </div>
  `).join('');
  openModal(`<h2>🎯 Misi Presiden</h2><div style="margin-bottom:16px">${listHtml}</div>
    <button class="modal-close" onclick="document.getElementById('modal-overlay').classList.add('hidden')">Tutup</button>`);
}

function openGovernment() {
  openModal(`
    <h2>🏛 Pemerintahan</h2>
    <h3>Kabinet</h3>
    <div class="stat-row"><span>Menteri Ekonomi</span><span class="val">Dr. Rahmat</span></div>
    <div class="stat-row"><span>Menteri Pendidikan</span><span class="val">Prof. Sinta</span></div>
    <div class="stat-row"><span>Menteri Kesehatan</span><span class="val">Dr. Wijaya</span></div>
    <div class="stat-row"><span>Menteri Infrastruktur</span><span class="val">Ir. Budi</span></div>
    <div class="stat-row"><span>Menteri Pertahanan</span><span class="val">Jenderal Prakoso</span></div>
    <h3>Aksi Presiden</h3>
    <button class="modal-close" style="margin-top:8px" onclick="window.gameAction('cabinet')">📋 Rapat Kabinet (+ Kepuasan)</button>
    <button class="modal-close" style="margin-top:8px" onclick="window.gameAction('speech')">🎤 Pidato Kenegaraan (+ Kepuasan)</button>
    <button class="modal-close" style="margin-top:8px" onclick="window.gameAction('inspect')">👁 Inspeksi Daerah (+ Kepuasan)</button>
    <button class="modal-close" style="margin-top:16px;background:#333;color:#fff" onclick="document.getElementById('modal-overlay').classList.add('hidden')">Tutup</button>
  `);
}

function openEconomy() {
  openModal(`
    <h2>💹 Ekonomi Negara</h2>
    <div class="stat-row"><span>Kas Negara</span><span class="val">${formatMoney(GameState.money)}</span></div>
    <div class="stat-row"><span>Pendapatan Pajak/menit</span><span class="val">${formatMoney(economy.meta.taxIncome)}</span></div>
    <div class="stat-row"><span>Inflasi</span><span class="val">${economy.meta.inflation.toFixed(1)}%</span></div>
    <div class="stat-row"><span>Pengangguran</span><span class="val">${economy.meta.unemployment.toFixed(1)}%</span></div>
    <div class="stat-row"><span>Pertumbuhan</span><span class="val">${economy.meta.growth.toFixed(1)}%</span></div>
    <h3>Aksi</h3>
    <button class="modal-close" style="margin-top:8px" onclick="window.gameAction('infra')">🏗 Bangun Infrastruktur (-1T)</button>
    <button class="modal-close" style="margin-top:8px" onclick="window.gameAction('health')">🏥 Tingkatkan Kesehatan (-500M)</button>
    <button class="modal-close" style="margin-top:8px" onclick="window.gameAction('edu')">🏫 Tingkatkan Pendidikan (-800M)</button>
    <button class="modal-close" style="margin-top:16px;background:#333;color:#fff" onclick="document.getElementById('modal-overlay').classList.add('hidden')">Tutup</button>
  `);
}

window.gameAction = (action) => {
  document.getElementById('modal-overlay').classList.add('hidden');
  switch (action) {
    case 'cabinet': GameState.approval = Math.min(100, GameState.approval + 3); GameState.money -= 50000000; showToast('📋 Rapat kabinet selesai. Kepuasan +3%'); break;
    case 'speech': GameState.approval = Math.min(100, GameState.approval + 5); showToast('🎤 Pidato kenegaraan sukses! Kepuasan +5%'); break;
    case 'inspect': GameState.approval = Math.min(100, GameState.approval + 2); showToast('👁 Inspeksi daerah. Kepuasan +2%'); break;
    case 'infra':
      if (GameState.money >= 1000000000000) {
        GameState.money -= 1000000000000;
        economy.meta.growth += 0.5;
        GameState.approval = Math.min(100, GameState.approval + 4);
        showToast('🏗 Infrastruktur dibangun.');
      } else showToast('❌ Dana tidak cukup');
      break;
    case 'health':
      if (GameState.money >= 500000000) { GameState.money -= 500000000; GameState.approval = Math.min(100, GameState.approval + 3); showToast('🏥 Kesehatan ditingkatkan'); }
      else showToast('❌ Dana tidak cukup');
      break;
    case 'edu':
      if (GameState.money >= 800000000) { GameState.money -= 800000000; GameState.approval = Math.min(100, GameState.approval + 3); showToast('🏫 Pendidikan ditingkatkan'); }
      else showToast('❌ Dana tidak cukup');
      break;
  }
  updateHUD();
};

function addInitialMissions() {
  GameState.missions = [
    { title: 'Rapat Kabinet pertama', target: 1, progress: 0, done: false },
    { title: 'Bicara dengan 5 warga', target: 5, progress: 0, done: false },
    { title: 'Kunjungi Masjid', target: 1, progress: 0, done: false },
    { title: 'Keliling kota dengan mobil', target: 1, progress: 0, done: false }
  ];
}

export function progressMission(idx) {
  const m = GameState.missions[idx];
  if (m && !m.done) {
    m.progress++;
    if (m.progress >= m.target) {
      m.done = true;
      GameState.money += 100000000;
      GameState.approval = Math.min(100, GameState.approval + 5);
      showToast(`✅ Misi selesai: ${m.title} (+100jt)`);
    }
  }
}

let toastTimer = null;
export function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `position:fixed;top:90px;left:50%;transform:translateX(-50%);background:rgba(20,20,40,0.95);border:1px solid #ffd700;border-radius:10px;padding:12px 20px;color:#fff;font-size:13px;z-index:1000;max-width:90%;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,0.5);pointer-events:none;transition:all 0.3s;`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translate(-50%, 0)';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, -20px)';
  }, 2500);
    }
