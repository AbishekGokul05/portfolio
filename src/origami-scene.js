import * as THREE from 'three';

/* Original procedural paper sculpture. No third-party model, HDRI or texture downloads. */
export function mountOrigami(study) {
  const viewport = study.querySelector('[data-scene-viewport]');
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  let pixelRatio = Math.min(devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.25 : 1.5);
  renderer.setPixelRatio(pixelRatio);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  viewport.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1.5, .1, 30);
  camera.position.set(4.9, 2.35, 3.6);
  camera.lookAt(0, .48, 0);
  scene.add(new THREE.HemisphereLight(0xfff9ed, 0x777068, 2.6));
  const key = new THREE.DirectionalLight(0xfff1d6, 3.6);
  key.position.set(-3, 5, 4);
  scene.add(key);
  const rimLight = new THREE.DirectionalLight(0xffffff, 2);
  rimLight.position.set(2, 3, -4);
  scene.add(rimLight);

  // Deterministic, tiny washi texture: shared by every facet.
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = textureCanvas.height = 256;
  const context = textureCanvas.getContext('2d');
  context.fillStyle = '#ede6d8';
  context.fillRect(0, 0, 256, 256);
  let seed = 19;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let i = 0; i < 2400; i++) {
    const x = random() * 256;
    const y = random() * 256;
    context.strokeStyle = random() > .5 ? '#ffffff24' : '#6f594118';
    context.beginPath(); context.moveTo(x, y); context.lineTo(x + random() * 5, y + random() * 2); context.stroke();
  }
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const paper = new THREE.MeshStandardMaterial({ color: 0xfffaf0, map: texture, roughness: .94, metalness: 0, side: THREE.DoubleSide, flatShading: true });
  const fold = paper.clone();
  fold.color.set(0xcabca8);
  const accent = new THREE.MeshStandardMaterial({ color: 0xb6372f, roughness: .8, side: THREE.DoubleSide, flatShading: true });
  const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x574a3e, transparent: true, opacity: .32 });
  const sculpture = new THREE.Group();
  sculpture.position.y = .8;
  sculpture.scale.setScalar(1.08);
  sculpture.rotation.y = -.28;
  scene.add(sculpture);

  function facet(parent, points, material = paper) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, .5, 1], 2));
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, material);
    parent.add(mesh);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edgesMaterial);
    parent.add(edges);
    return mesh;
  }
  // A faceted body with a raised central mountain fold.
  const nose = [.52, .03, 0], tail = [-.56, .02, 0], ridge = [-.02, .42, 0];
  const near = [-.08, -.12, .27], far = [-.08, -.12, -.27], bottom = [-.08, -.22, 0];
  facet(sculpture, [nose, ridge, near]);
  facet(sculpture, [tail, near, ridge], fold);
  facet(sculpture, [nose, far, ridge], fold);
  facet(sculpture, [tail, ridge, far]);
  facet(sculpture, [nose, near, bottom], accent);
  facet(sculpture, [nose, bottom, far], fold);
  facet(sculpture, [tail, bottom, near], fold);
  facet(sculpture, [tail, far, bottom], paper);

  const wings = [];
  for (const side of [-1, 1]) {
    const wing = new THREE.Group();
    sculpture.add(wing);
    const root = [-.1, .12, side * .15];
    const tip = [-.68, 1.05, side * 1.65];
    const front = [.52, .18, side * .4];
    const back = [-.62, .03, side * .38];
    const crease = [-.2, .4, side * .9];
    facet(wing, [root, front, crease]);
    facet(wing, [front, tip, crease]);
    facet(wing, [root, crease, back], fold);
    facet(wing, [back, crease, tip], fold);
    wings.push({ wing, side });
  }
  // Narrow doubled paper strips form a reverse-folded neck, head and tail.
  for (const side of [-1, 1]) {
    const z = side * .055;
    facet(sculpture, [[.35, .0, z], [.75, .82, z * .6], [.88, .89, 0]], side === 1 ? paper : fold);
    facet(sculpture, [[.35, .0, z], [.88, .89, 0], [.58, .14, z]], paper);
    facet(sculpture, [[.75, .82, z * .6], [.88, .89, 0], [1.18, .67, 0]], accent);
    facet(sculpture, [[-.4, .0, z], [-1.24, .72, 0], [-.61, .24, z]], paper);
  }

  const pedestalMaterial = new THREE.MeshStandardMaterial({ color: 0xe3d6bd, roughness: 1 });
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.52, 1.54, .045, 64), pedestalMaterial);
  pedestal.position.y = -.075;
  scene.add(pedestal);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.38, .008, 6, 80), accent);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -.045;
  scene.add(ring);
  // A pre-painted soft contact shadow costs no shadow maps or postprocessing.
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const shadowContext = shadowCanvas.getContext('2d');
  const gradient = shadowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, '#201b1655'); gradient.addColorStop(1, '#201b1600');
  shadowContext.fillStyle = gradient; shadowContext.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -.042;
  scene.add(shadow);

  const petalMaterial = new THREE.MeshStandardMaterial({ color: 0xe8a59c, roughness: .9, side: THREE.DoubleSide });
  const petalShape = new THREE.Shape();
  petalShape.moveTo(0, -.055);
  petalShape.bezierCurveTo(-.065, .015, -.055, .1, 0, .065);
  petalShape.bezierCurveTo(.055, .1, .065, .015, 0, -.055);
  const petalGeometry = new THREE.ShapeGeometry(petalShape, 5);
  const petals = [];
  for (let i = 0; i < 7; i++) {
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    scene.add(petal);
    petals.push({ mesh: petal, phase: i / 7, x: (random() - .5) * 3.8, z: (random() - .5) * 2 });
  }

  let alive = true;
  let inView = true;
  let contextLost = false;
  let frame = 0;
  let last = 0;
  let elapsed = 0;
  let frameSamples = 0;
  let sampleDuration = 0;
  let targetRotation = -.28;
  let pointerX = 0;
  let pointerY = 0;
  let drag = null;
  let themeTime = 1;
  let isColor = document.documentElement.dataset.theme === 'color';
  const targetPaper = new THREE.Color();
  const targetFold = new THREE.Color();
  const targetAccent = new THREE.Color();
  const targetPetal = new THREE.Color();
  function theme() {
    isColor = document.documentElement.dataset.theme === 'color';
    targetPaper.set(isColor ? 0xfffaf0 : 0xeee9df);
    targetFold.set(isColor ? 0xcabca8 : 0xa09c94);
    targetAccent.set(isColor ? 0xb6372f : 0x4c4946);
    targetPetal.set(isColor ? 0xe8a59c : 0xd4cec4);
    pedestalMaterial.color.set(isColor ? 0xe3d6bd : 0x66615a);
    themeTime = 0;
    if (!active()) {
      paper.color.copy(targetPaper); fold.color.copy(targetFold); accent.color.copy(targetAccent); petalMaterial.color.copy(targetPetal);
      drawStill();
    }
    resume();
  }
  function enabled() { return window.portfolioMotion?.enabled ?? true; }
  function active() { return alive && !contextLost && inView && !document.hidden && enabled() && !document.querySelector('dialog[open]'); }
  function drawStill() { if (alive && !contextLost && inView && !document.hidden) renderer.render(scene, camera); }
  function tick(now) {
    frame = 0;
    if (!active()) { last = 0; return; }
    const rawDelta = last ? (now - last) / 1000 : 1 / 60;
    const delta = Math.min(rawDelta, .05);
    last = now;
    elapsed += delta;
    themeTime += delta;
    const blend = 1 - Math.exp(-delta * 7);
    if (themeTime < 1.5) {
      paper.color.lerp(targetPaper, blend); fold.color.lerp(targetFold, blend); accent.color.lerp(targetAccent, blend); petalMaterial.color.lerp(targetPetal, blend);
    }
    sculpture.rotation.y += (targetRotation + pointerX * .12 - sculpture.rotation.y) * blend;
    sculpture.rotation.z += (-pointerY * .025 - sculpture.rotation.z) * blend;
    sculpture.position.y = .8 + Math.sin(elapsed * .65) * .035;
    const unfold = Math.max(0, 1 - elapsed / 1.6) ** 3;
    for (const { wing, side } of wings) wing.rotation.x = side * (unfold * .85 + Math.sin(elapsed * .7) * .028);
    for (const item of petals) {
      const cycle = (elapsed * .045 + item.phase) % 1;
      item.mesh.position.set(item.x + Math.sin(elapsed * .4 + item.phase * 6) * .22 + pointerX * .07, 2.05 - cycle * 2.25, item.z);
      item.mesh.rotation.set(elapsed * .4 + item.phase * 4, elapsed * .5, cycle * 8);
    }
    renderer.render(scene, camera);
    // Adapt resolution once after a sustained slow sample, rather than UA guesses.
    if (elapsed > 2 && pixelRatio > 1) {
      frameSamples++; sampleDuration += rawDelta;
      if (frameSamples >= 90) {
        if (sampleDuration / frameSamples > .026) { pixelRatio = 1; renderer.setPixelRatio(1); resize(); }
        frameSamples = 0; sampleDuration = 0;
      }
    }
    frame = requestAnimationFrame(tick);
  }
  function resume() {
    if (!active()) {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      if (!enabled()) {
        for (const { wing } of wings) wing.rotation.x = 0;
        sculpture.rotation.y = targetRotation;
        drawStill();
      }
      return;
    }
    if (!frame) { last = 0; frame = requestAnimationFrame(tick); }
  }
  function resize() {
    const { width, height } = viewport.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    drawStill();
  }
  const abort = new AbortController();
  const options = { signal: abort.signal };
  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !enabled()) return;
    drag = { id: event.pointerId, x: event.clientX, rotation: targetRotation };
    viewport.setPointerCapture(event.pointerId);
  }, options);
  viewport.addEventListener('pointermove', event => {
    if (!enabled()) return;
    if (drag && event.pointerId === drag.id) {
      targetRotation = drag.rotation + (event.clientX - drag.x) * .009;
    } else if (event.pointerType === 'mouse') {
      const rect = viewport.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width * 2 - 1;
      pointerY = (event.clientY - rect.top) / rect.height * 2 - 1;
    }
  }, options);
  const release = () => { drag = null; pointerX = pointerY = 0; };
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture', 'pointerleave']) viewport.addEventListener(name, release, options);
  function rotate(amount) {
    targetRotation += amount;
    if (!enabled()) { sculpture.rotation.y = targetRotation; drawStill(); }
  }
  study.querySelector('[data-scene-left]').addEventListener('click', () => rotate(-Math.PI / 6), options);
  study.querySelector('[data-scene-right]').addEventListener('click', () => rotate(Math.PI / 6), options);
  study.querySelector('[data-scene-reset]').addEventListener('click', () => { targetRotation = -.28; pointerX = pointerY = 0; rotate(0); }, options);
  for (const name of ['portfolio-motionchange', 'portfolio-overlaychange']) window.addEventListener(name, resume, options);
  window.addEventListener('portfolio-themechange', theme, options);
  document.addEventListener('visibilitychange', resume, options);
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault(); contextLost = true; resume();
    study.dataset.sceneState = 'unavailable';
    study.querySelector('.origami-controls').hidden = true;
  }, options);
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    study.dataset.sceneState = 'ready';
    study.querySelector('.origami-controls').hidden = false;
    resize(); resume();
  }, options);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport);
  const visibility = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; resume(); });
  visibility.observe(viewport);
  window.addEventListener('pagehide', event => {
    if (event.persisted) { inView = false; resume(); return; }
    alive = false;
    cancelAnimationFrame(frame);
    abort.abort();
    resizeObserver.disconnect(); visibility.disconnect();
    const geometries = new Set(), materials = new Set();
    scene.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material); });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    texture.dispose(); shadowTexture.dispose(); renderer.dispose();
  }, options);
  window.addEventListener('pageshow', () => { inView = viewport.getBoundingClientRect().bottom > 0 && viewport.getBoundingClientRect().top < innerHeight; resume(); }, options);
  study.dataset.sceneState = 'ready';
  study.querySelector('.origami-controls').hidden = false;
  theme(); resize(); resume();
}
