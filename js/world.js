// ============================================================
// WORLD.JS — Scene, lighting, ground, roads, day/night cycle
// ============================================================

const World = {
  scene: null,
  camera: null,
  renderer: null,
  sun: null,
  hemi: null,
  ambient: null,
  clock: null,
  sunLight: null,

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 150, 450);

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 2000);
    this.camera.position.set(0, 10, 20);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game').appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    // Lights
    this.ambient = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(this.ambient);

    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444466, 0.5);
    this.scene.add(this.hemi);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 0.9);
    this.sunLight.position.set(50, 80, 30);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.camera.left = -120;
    this.sunLight.shadow.camera.right = 120;
    this.sunLight.shadow.camera.top = 120;
    this.sunLight.shadow.camera.bottom = -120;
    this.sunLight.shadow.camera.far = 300;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // Sun mesh (visual)
    const sunGeo = new THREE.SphereGeometry(8, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.sun = new THREE.Mesh(sunGeo, sunMat);
    this.scene.add(this.sun);

    // Moon
