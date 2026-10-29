/* Shared Three.js helpers for the 3D work samples */
(function () {
  const T = window.THREE;
  if (T.ColorManagement) T.ColorManagement.legacyMode = false;
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ramp = [[43, 76, 154], [47, 134, 192], [51, 176, 168], [140, 196, 106], [230, 200, 74], [236, 138, 58], [214, 69, 58]];
  function heat(v) { v = Math.max(0, Math.min(1, v)) * (ramp.length - 1); const i = Math.floor(v), f = v - i, a = ramp[i], b = ramp[Math.min(i + 1, ramp.length - 1)]; return [0, 1, 2].map(k => (a[k] + (b[k] - a[k]) * f) / 255); }

  function stage(host, o = {}) {
    const wrap = document.createElement("div");
    wrap.className = "three-wrap"; wrap.style.setProperty("--h", (o.height || 440) + "px"); wrap.tabIndex = o.focusable ? 0 : -1;
    if (o.label) { wrap.setAttribute("role", "img"); wrap.setAttribute("aria-label", o.label); }
    host.appendChild(wrap);
    const hud = document.createElement("div"); hud.className = "three-hud"; wrap.appendChild(hud);
    const hint = document.createElement("div"); hint.className = "three-hint"; hint.textContent = o.hint || "Drag to orbit · click then scroll to zoom"; wrap.appendChild(hint);
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.shadowMap.enabled = o.shadows !== false; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    if (o.clipping) renderer.localClippingEnabled = true;
    wrap.prepend(renderer.domElement);
    const scene = new T.Scene(); const bg = new T.Color(o.bg ?? 0xe7e8e3); scene.background = bg;
    if (o.fog !== false) scene.fog = new T.Fog(bg, o.fogNear || 22, o.fogFar || 60);
    const camera = new T.PerspectiveCamera(o.fov || 42, 1, 0.05, 300); camera.position.set(...(o.cam || [8, 6, 10]));
    const controls = new T.OrbitControls(camera, renderer.domElement);
    controls.target.set(...(o.target || [0, 0, 0])); controls.enableDamping = true; controls.dampingFactor = 0.08; controls.enableZoom = false; controls.enablePan = !!o.pan;
    if (o.minDist) controls.minDistance = o.minDist; if (o.maxDist) controls.maxDistance = o.maxDist;
    if (o.maxPolar) controls.maxPolarAngle = o.maxPolar;
    controls.autoRotate = !!o.autoRotate && !reduced(); controls.autoRotateSpeed = 0.8;
    renderer.domElement.addEventListener("pointerdown", () => { controls.enableZoom = true; controls.autoRotate = false; hint.classList.add("gone"); });
    wrap.addEventListener("pointerleave", () => { controls.enableZoom = false; });
    controls.update();
    // lights
    scene.add(new T.HemisphereLight(0xffffff, 0xb9b6ad, 0.85));
    const sun = new T.DirectionalLight(0xffffff, 1.25); sun.position.set(6, 12, 8); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); const sc = o.shadowSize || 12; Object.assign(sun.shadow.camera, { left: -sc, right: sc, top: sc, bottom: -sc, near: 1, far: 50 }); sun.shadow.bias = -0.0005;
    scene.add(sun);
    const rim = new T.PointLight(0xffffff, 0.35, 40); rim.position.set(-8, 5, -6); scene.add(rim);
    const warm = new T.PointLight(0xfff1e0, 0.3, 40); warm.position.set(8, 3, -8); scene.add(warm);
    if (o.floor !== false) {
      const g = new T.Mesh(new T.CircleGeometry(o.floorR || 30, 64), new T.MeshStandardMaterial({ color: 0xdcdcd5, roughness: 0.95, metalness: 0 }));
      g.rotation.x = -Math.PI / 2; g.position.y = o.floorY || 0; g.receiveShadow = true; scene.add(g);
      const grid = new T.GridHelper(o.gridSize || 40, o.gridDiv || 40, 0xb4b5ad, 0xc9cac3); grid.position.y = (o.floorY || 0) + 0.002; scene.add(grid);
      grid.material.transparent = true; grid.material.opacity = 0.6;
    }
    const frames = [];
    let running = true, visible = true, id, last = performance.now();
    function resize() { const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    const ro = new ResizeObserver(resize); ro.observe(wrap); resize();
    const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; }); io.observe(wrap);
    function tick(t) {
      if (!running) return; id = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (!visible || document.hidden) return;
      frames.forEach(f => f(dt, t / 1000)); controls.update(); renderer.render(scene, camera);
    }
    id = requestAnimationFrame(tick);
    const ray = new T.Raycaster(), ndc = new T.Vector2();
    function pick(ev, objects, recursive = true) {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera); return ray.intersectObjects(objects, recursive);
    }
    function dispose() {
      running = false; cancelAnimationFrame(id); ro.disconnect(); io.disconnect(); controls.dispose();
      scene.traverse(ob => { if (ob.geometry) ob.geometry.dispose(); if (ob.material) [].concat(ob.material).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); });
      renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss();
    }
    return { T, scene, camera, renderer, controls, wrap, hud, onFrame: f => frames.push(f), pick, dispose, sun };
  }

  const mat = {
    steel: () => new T.MeshStandardMaterial({ color: 0xb8bcc2, metalness: 0.8, roughness: 0.35 }),
    dark: () => new T.MeshStandardMaterial({ color: 0x3a3d43, metalness: 0.5, roughness: 0.5 }),
    paint: c => new T.MeshStandardMaterial({ color: c, metalness: 0.25, roughness: 0.5 }),
    glow: c => new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.25, roughness: 0.45 }),
    glass: c => new T.MeshPhysicalMaterial({ color: c || 0xc9d3da, transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0, side: T.DoubleSide, depthWrite: false })
  };
  function mesh(geo, m, cast = true) { const x = new T.Mesh(geo, m); x.castShadow = cast; x.receiveShadow = true; return x; }
  function edges(geo, color = 0x3f7f74, op = 0.6) { return new T.LineSegments(new T.EdgesGeometry(geo), new T.LineBasicMaterial({ color, transparent: true, opacity: op })); }
  function label(stageObj, text, cls = "") { const d = document.createElement("div"); d.className = "tag3d " + cls; d.textContent = text; stageObj.hud.appendChild(d); return d; }
  function placeLabel(stageObj, d, v) {
    const p = v.clone().project(stageObj.camera), w = stageObj.wrap.clientWidth, h = stageObj.wrap.clientHeight;
    d.style.transform = `translate(${(p.x * 0.5 + 0.5) * w}px, ${(-p.y * 0.5 + 0.5) * h}px)`; d.style.opacity = p.z < 1 ? 1 : 0;
  }
  function gearShape(teeth, r, depth = 0.18) {
    const s = new T.Shape(), n = teeth * 4;
    for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, rr = (i % 4 < 2) ? r + depth : r - depth * 0.4; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? s.lineTo(x, y) : s.moveTo(x, y); }
    const hole = new T.Path(); hole.absarc(0, 0, r * 0.25, 0, Math.PI * 2, true); s.holes.push(hole); return s;
  }
  const heatLin = v => heat(v).map(c => Math.pow(c, 2.2));
  window.KIT = { stage, mat, mesh, edges, label, placeLabel, heat, heatLin, gearShape, reduced };
})();
