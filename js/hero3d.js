/* Hero scene: a meshing gear train with a blueprint wireframe, parallax on pointer move */
window.mountHero3D = function (host) {
  if (!window.THREE || !window.KIT) return () => {};
  const T = THREE, K = KIT;
  const S = K.stage(host, { height: 380, cam: [0, 1.5, 12], target: [0, 0, 0], label: "Rotating 3D gear train", floor: false, bg: 0xf3f3f0, fogNear: 14, fogFar: 30, shadows: false, hint: " " });
  S.scene.background = null; S.renderer.setClearColor(0x000000, 0); S.renderer.domElement.style.background = "transparent";
  const rig = new T.Group(); rig.position.set(-0.9, 0.7, 0); S.scene.add(rig);
  if (host.clientWidth < 600) { S.camera.position.set(0, 1.5, 16); rig.position.set(0, 0.6, 0); }
  const specs = [[18, 2.2, 0xb8bcc2, [-2.3, 0.4, 0]], [12, 1.5, 0xb08a4a, [1.55, 1.25, 0.3]], [9, 1.1, 0x8f949b, [2.05, -1.65, -0.2]], [24, 2.9, 0x6f757d, [-1.4, -3.8, -1.4]]];
  const gears = specs.map(([teeth, r, col, p], i) => {
    const geo = new T.ExtrudeGeometry(K.gearShape(teeth, r, 0.2), { depth: 0.5, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 2, curveSegments: 4 });
    geo.center();
    const m = new T.Mesh(geo, new T.MeshStandardMaterial({ color: col, metalness: 0.85, roughness: 0.32 }));
    const e = new T.LineSegments(new T.EdgesGeometry(geo, 30), new T.LineBasicMaterial({ color: 0x1c1e22, transparent: true, opacity: 0.18 }));
    const g = new T.Group(); g.add(m, e); g.position.set(...p); g.userData = { teeth, dir: i % 2 ? -1 : 1 }; rig.add(g);
    const shaft = new T.Mesh(new T.CylinderGeometry(r * 0.22, r * 0.22, 2.2, 24), K.mat.steel()); shaft.rotation.x = Math.PI / 2; g.add(shaft);
    return g;
  });
  // blueprint ring and dimension arcs
  const ringGeo = new T.RingGeometry(4.6, 4.62, 128); const ring = new T.Mesh(ringGeo, new T.MeshBasicMaterial({ color: 0x1c1e22, transparent: true, opacity: 0.35, side: T.DoubleSide })); ring.position.z = -1.5; rig.add(ring);
  const ticks = new T.BufferGeometry(); const tp = []; for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2, r1 = 4.62, r2 = i % 6 ? 4.75 : 4.95; tp.push(Math.cos(a) * r1, Math.sin(a) * r1, -1.5, Math.cos(a) * r2, Math.sin(a) * r2, -1.5); }
  ticks.setAttribute("position", new T.Float32BufferAttribute(tp, 3)); rig.add(new T.LineSegments(ticks, new T.LineBasicMaterial({ color: 0x1c1e22, transparent: true, opacity: 0.45 })));
  // particles
  const n = 500, pg = new T.BufferGeometry(), pp = new Float32Array(n * 3); for (let i = 0; i < n; i++) pp.set([(Math.random() - 0.5) * 24, (Math.random() - 0.5) * 14, -4 - Math.random() * 8], i * 3);
  pg.setAttribute("position", new T.BufferAttribute(pp, 3)); const stars = new T.Points(pg, new T.PointsMaterial({ color: 0x9fa3a8, size: 0.03, transparent: true, opacity: 0 })); S.scene.add(stars);
  const mouse = { x: 0, y: 0 }; const onMove = e => { const r = host.getBoundingClientRect(); mouse.x = (e.clientX - r.left) / r.width - 0.5; mouse.y = (e.clientY - r.top) / r.height - 0.5; };
  window.addEventListener("pointermove", onMove);
  let spin = 0;
  S.onFrame((dt, t) => {
    if (!K.reduced()) spin += dt * 0.6;
    const base = spin; gears.forEach(g => { g.rotation.z = g.userData.dir * base * (18 / g.userData.teeth); });
    rig.rotation.y = lerpA(rig.rotation.y, mouse.x * 0.6 + Math.sin(t * 0.3) * 0.15, 0.05); rig.rotation.x = lerpA(rig.rotation.x, mouse.y * 0.4 - 0.1, 0.05);
    ring.rotation.z = -t * 0.05; stars.rotation.y = t * 0.01;
  });
  function lerpA(a, b, k) { return a + (b - a) * k; }
  return () => { window.removeEventListener("pointermove", onMove); S.dispose(); };
};
