/* Live 3D thumbnails for the project cards. One shared WebGL renderer draws every card into its own 2D canvas. */
window.mountCards3D = function (root) {
  if (!window.THREE || !window.KIT) return () => {};
  const T = THREE, K = KIT, W = 560, H = 350;
  let renderer;
  try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch (e) { return () => {}; }
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.localClippingEnabled = true; renderer.setClearColor(0xe6e7e2, 1);

  function base(cam, target, opts = {}) {
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(opts.fov || 38, W / H, 0.05, 200);
    camera.position.set(...cam); camera.lookAt(...target);
    scene.add(new T.HemisphereLight(0xffffff, 0xb9b6ad, 0.85));
    const sun = new T.DirectionalLight(0xffffff, 1.2); sun.position.set(6, 12, 8); sun.castShadow = true; sun.shadow.mapSize.set(512, 512);
    const sc = opts.shadow || 10; Object.assign(sun.shadow.camera, { left: -sc, right: sc, top: sc, bottom: -sc }); scene.add(sun);
    const rim = new T.PointLight(0xffffff, 0.35, 40); rim.position.set(-8, 5, -6); scene.add(rim);
    const warm = new T.PointLight(0xfff1e0, 0.3, 40); warm.position.set(8, 4, -6); scene.add(warm);
    if (opts.floor !== false) {
      const f = new T.Mesh(new T.CircleGeometry(opts.floorR || 12, 48), new T.MeshStandardMaterial({ color: 0xdcdcd5, roughness: 0.95 }));
      f.rotation.x = -Math.PI / 2; f.position.y = opts.floorY || 0; f.receiveShadow = true; scene.add(f);
      const g = new T.PolarGridHelper(opts.floorR || 12, 16, 6, 64, 0x8f939a, 0x16214a); g.position.y = (opts.floorY || 0) + 0.003; scene.add(g);
    }
    const spin = new T.Group(); scene.add(spin);
    return { scene, camera, spin, tick: () => {} };
  }

  const B = {};
  B["motor-mount"] = () => { const s = base([15, 11, 15], [0, 3.2, -2], { shadow: 14, floorR: 16 }); const M = KIT3D.buildMount(s.spin); s.spin.position.z = 2; M.setBelt(9); s.tick = dt => { M.pulley.rotation.x += dt * 5; M.dGroup.children[0].rotation.x += dt * 3.2; }; return s; };
  B["bom-records"] = () => { const s = base([19, 15, 19], [0, 4.5, -2], { shadow: 14, floorR: 16 }); const M = KIT3D.buildMount(s.spin, { guard: true }); s.spin.position.z = 2;
    const lift = { spacer: 0.8, bracket: 1.6, screw: 4.5, motor: 3, cover: 6, guard: 2 }; Object.entries(M.parts).forEach(([id, g]) => g.position.y += lift[id] || 0); M.setBelt(9);
    s.tick = (dt, t) => { KIT3D.setGlow(M.parts.guard, 0xff3b3b, 0.4 + Math.sin(t * 5) * 0.3); KIT3D.setGlow(M.parts.screw, 0xff3b3b, 0.4 + Math.sin(t * 5 + 1) * 0.3); }; return s; };
  B["bracket-fea"] = () => {
    const s = base([8.5, 5.2, 10], [2, 1.6, 0], { shadow: 6 });
    const wall = K.mesh(new T.BoxGeometry(0.8, 4.5, 3.6), K.mat.dark()); wall.position.set(-0.4, 1.8, 0); s.spin.add(wall);
    const geo = new T.BoxGeometry(4.8, 0.5, 2.4, 48, 6, 8); geo.translate(2.4, 2, 0); const p = geo.attributes.position, col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), sN = x / 4.8; p.setY(i, y - 0.55 * sN * sN * (3 - sN) / 2); col.set(K.heatLin((1 - sN) * Math.abs((y - 2) / 0.25) * 0.95 + 0.05), i * 3); }
    geo.setAttribute("color", new T.BufferAttribute(col, 3)); geo.computeVertexNormals();
    s.spin.add(K.mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.45 })));
    const wire = new T.LineSegments(new T.WireframeGeometry(geo), new T.LineBasicMaterial({ color: 0x1c1e22, transparent: true, opacity: 0.15 })); s.spin.add(wire);
    const motor = K.mesh(new T.BoxGeometry(1.1, 1.1, 1.5), K.mat.paint(0x4f6b8a)); motor.position.set(4.1, 2.25, 0); s.spin.add(motor);
    const arrow = new T.ArrowHelper(new T.Vector3(0, -1, 0), new T.Vector3(4.1, 4.6, 0), 1.6, 0xd2601a, 0.45, 0.3); s.spin.add(arrow);
    s.spin.position.x = -0.6; s.tick = (dt, t) => { arrow.position.y = 4.6 + Math.sin(t * 3) * 0.15; }; return s;
  };
  B["enclosure-cfd"] = () => {
    const s = base([8.5, 6, 9.5], [0, 2.6, 0], { shadow: 8 }); const Wd = 10, Hd = 5.6, Dd = 4;
    const g = new T.BoxGeometry(Wd, Hd, Dd); const shell = new T.Mesh(g, K.mat.glass(0xc9d3da)); shell.position.y = Hd / 2; s.spin.add(shell); const e = K.edges(g, 0x8a9aa8, 0.8); e.position.y = Hd / 2; s.spin.add(e);
    const comp = (w, h, x, y, c) => { const m = K.mesh(new T.BoxGeometry(w, h, Dd * 0.8), K.mat.paint(c)); m.position.set(x, y, 0); s.spin.add(m); return m; };
    comp(4.7, 0.55, -1.4, 0.9, 0x1f6f4a); comp(1.4, 1.7, 3.5, 1.2, 0x5a6684); const proc = comp(1.4, 0.55, -0.6, 1.45, 0x3a3d43);
    for (let i = 0; i < 7; i++) { const f = K.mesh(new T.BoxGeometry(0.06, 0.5, Dd * 0.7), K.mat.steel()); f.position.set(-1.2 + i * 0.2, 1.95, 0); s.spin.add(f); }
    const heatPlane = new T.Mesh(new T.PlaneGeometry(Wd, Hd), new T.MeshBasicMaterial({ transparent: true, opacity: 0.55, depthWrite: false, side: T.DoubleSide }));
    const c = document.createElement("canvas"); c.width = 64; c.height = 36; const x = c.getContext("2d"); const img = x.createImageData(64, 36);
    for (let j = 0; j < 36; j++) for (let i = 0; i < 64; i++) { const v = Math.max(0, 1 - Math.hypot(i - 26, j - 26) / 22) * 0.8 + Math.max(0, 1 - Math.hypot(i - 55, j - 26) / 14) * 0.6 + i / 64 * 0.15; const col = K.heat(v); img.data.set([col[0] * 255, col[1] * 255, col[2] * 255, 230], (j * 64 + i) * 4); }
    x.putImageData(img, 0, 0); const tx = new T.CanvasTexture(c); tx.encoding = T.sRGBEncoding; heatPlane.material.map = tx; heatPlane.position.set(0, Hd / 2, -0.02); s.spin.add(heatPlane);
    const N = 260, pg = new T.BufferGeometry(), pp = new Float32Array(N * 3), seeds = []; for (let i = 0; i < N; i++) seeds.push([Math.random(), Math.random() * 0.6 + 0.2, (Math.random() - 0.5) * Dd * 0.8, Math.random()]);
    pg.setAttribute("position", new T.BufferAttribute(pp, 3)); s.spin.add(new T.Points(pg, new T.PointsMaterial({ color: 0x3f7f74, size: 0.1, transparent: true, depthWrite: false })));
    const fan = new T.Group(); for (let i = 0; i < 5; i++) { const b = K.mesh(new T.BoxGeometry(0.05, 0.9, 0.3), K.mat.glow(0x3f7f74)); b.position.y = 0.45; const pv = new T.Group(); pv.rotation.x = i / 5 * Math.PI * 2; pv.add(b); fan.add(pv); } fan.position.set(-Wd / 2 + 0.1, 3.3, 0); s.spin.add(fan);
    s.tick = dt => { fan.rotation.x += dt * 18; seeds.forEach((sd, i) => { sd[3] = (sd[3] + dt * 0.12) % 1; const u = sd[3]; pp.set([-Wd / 2 + u * Wd, 3.3 + (sd[1] - 0.5) * 3 * u - Math.sin(u * 3) * 0.4, sd[2]], i * 3); }); pg.attributes.position.needsUpdate = true; };
    return s;
  };
  B["turtlebot"] = () => {
    const s = base([0, 3.2, 3.4], [0, 0, 0], { shadow: 3, floorR: 4 });
    [[0, -1.33, 4, 0.04], [0, 1.33, 4, 0.04], [-2, 0, 0.04, 2.67], [2, 0, 0.04, 2.67]].forEach(([x, z, w, d]) => { const m = K.mesh(new T.BoxGeometry(w, 0.22, d), K.mat.paint(0x8f939a)); m.position.set(x, 0.11, z); s.spin.add(m); });
    const boxes = [[-0.7, -0.6], [0.2, 0.3], [1.0, -0.7, 0.25, 0.75], [-0.9, 0.5], [1.3, 0.7]]; boxes.forEach(([x, z, w = 0.3, d = 0.3], i) => { const m = K.mesh(new T.BoxGeometry(w, 0.3, d), K.mat.paint(i % 2 ? 0x5d6b7c : 0x6e7a88)); m.position.set(x, 0.15, z); s.spin.add(m); });
    const robot = new T.Group(); [0.05, 0.12, 0.19].forEach(y => { const d = K.mesh(new T.CylinderGeometry(0.1, 0.1, 0.014, 32), K.mat.paint(0x2f3237)); d.position.y = y; robot.add(d); });
    const lid = K.mesh(new T.CylinderGeometry(0.035, 0.035, 0.04, 24), K.mat.glow(0x3f7f74)); lid.position.y = 0.23; robot.add(lid); s.spin.add(robot);
    const rg = new T.BufferGeometry(), rp = new Float32Array(60 * 6); rg.setAttribute("position", new T.BufferAttribute(rp, 3)); s.spin.add(new T.LineSegments(rg, new T.LineBasicMaterial({ color: 0x3f7f74, transparent: true, opacity: 0.35 })));
    const mover = K.mesh(new T.CylinderGeometry(0.11, 0.11, 0.3, 24), K.mat.paint(0xd2601a)); mover.position.y = 0.15; s.spin.add(mover);
    s.tick = (dt, t) => { const a = t * 0.5, x = Math.cos(a) * 1.3, z = Math.sin(a * 2) * 0.55; robot.position.set(x, 0, z); lid.rotation.y += dt * 10; mover.position.set(Math.sin(t * 0.7) * 1.2, 0.15, 0.95);
      for (let k = 0; k < 60; k++) { const an = k / 60 * Math.PI * 2, L = 0.5 + 0.5 * Math.abs(Math.sin(an * 3 + t)); rp.set([x, 0.23, z, x + Math.cos(an) * L, 0.23, z + Math.sin(an) * L], k * 6); } rg.attributes.position.needsUpdate = true; };
    return s;
  };
  B["puzzle-game"] = () => {
    const s = base([0, 9.5, 8.2], [0, 0, 0.3], { shadow: 7, floor: false });
    const L = ["#########", "#P..C..S#", "#.......#", "#######D#", "#E......#", "#########"], rows = L.length, cols = L[0].length, P = (x, y) => [x - cols / 2 + 0.5, y - rows / 2 + 0.5];
    const wallM = K.mat.paint(0x8a8e95), fl = K.mat.paint(0xd7d7d0), fl2 = K.mat.paint(0xcfd0c8);
    L.forEach((r, y) => [...r].forEach((ch, x) => { const [px, pz] = P(x, y); if (ch === "#") { const w = K.mesh(new T.BoxGeometry(1, 0.8, 1), wallM); w.position.set(px, 0.4, pz); s.spin.add(w); } else { const f = K.mesh(new T.BoxGeometry(0.98, 0.1, 0.98), (x + y) % 2 ? fl : fl2, false); f.position.set(px, 0.05, pz); s.spin.add(f); }
      if (ch === "S") { const r2 = new T.Mesh(new T.TorusGeometry(0.3, 0.06, 10, 32), K.mat.glow(0x3f7f74)); r2.rotation.x = -Math.PI / 2; r2.position.set(px, 0.14, pz); s.spin.add(r2); }
      if (ch === "E") { const e = new T.Mesh(new T.TorusGeometry(0.33, 0.05, 8, 4), K.mat.glow(0x7d8597)); e.rotation.x = -Math.PI / 2; e.position.set(px, 0.15, pz); s.spin.add(e); }
      if (ch === "D") { const d = K.mesh(new T.BoxGeometry(0.9, 0.8, 0.2), K.mat.glow(0xd2601a)); d.material.emissiveIntensity = 0.4; d.position.set(px, 0.4, pz); d.rotation.y = Math.PI / 2; s.spin.add(d); } }));
    const crate = K.mesh(new T.BoxGeometry(0.8, 0.8, 0.8), K.mat.paint(0xb07a3c)); s.spin.add(crate);
    const pl = new T.Group(); const b = K.mesh(new T.CylinderGeometry(0.24, 0.28, 0.45, 20), K.mat.paint(0xf2f2ef)); b.position.y = 0.32; const hd = K.mesh(new T.SphereGeometry(0.22, 20, 14), K.mat.paint(0xf2f2ef)); hd.position.y = 0.75; const v = K.mesh(new T.BoxGeometry(0.28, 0.09, 0.1), K.mat.glow(0x3f7f74)); v.position.set(0.19, 0.77, 0); v.rotation.y = Math.PI / 2; pl.add(b, hd, v); s.spin.add(pl);
    s.tick = (dt, t) => { const k = (t * 0.35) % 1, cx = 1 + Math.min(1, k * 1.4) * 3; const [px, pz] = P(cx, 1), [crx] = P(cx + 1, 1); pl.position.set(px, 0.1 + Math.abs(Math.sin(t * 7)) * 0.05, pz); crate.position.set(crx, 0.5, pz); pl.rotation.y = Math.PI / 2; crate.material.color.setHex(cx + 1 >= 7 ? 0x3f7f74 : 0xb07a3c); };
    return s;
  };
  B["game-assets"] = () => {
    const s = base([0, 7, 12.5], [0, 1, 0], { shadow: 8, floor: false });
    const hAt = (x, z) => Math.round(Math.sin(x * 0.5) * 0.6 + Math.cos(z * 0.45) * 0.6), cube = new T.BoxGeometry(1, 1, 1), cells = [];
    for (let x = -5; x <= 5; x++) for (let z = -5; z <= 5; z++) if (x * x + z * z < 26) cells.push([x, z]);
    const grass = new T.InstancedMesh(cube, new T.MeshStandardMaterial({ color: 0x38b764 }), cells.length), dirt = new T.InstancedMesh(cube, new T.MeshStandardMaterial({ color: 0x7a5230 }), cells.length), m4 = new T.Matrix4();
    cells.forEach(([x, z], i) => { const h = hAt(x, z); m4.makeTranslation(x, h, z); grass.setMatrixAt(i, m4); m4.makeTranslation(x, h - 1, z); dirt.setMatrixAt(i, m4); }); grass.receiveShadow = grass.castShadow = true; s.spin.add(grass, dirt);
    [[3, -2], [-3, -3]].forEach(([x, z]) => { const h = hAt(x, z); for (let k = 1; k <= 2; k++) { const tr = K.mesh(cube, K.mat.paint(0x5d3a22)); tr.position.set(x, h + k, z); s.spin.add(tr); } const lf = K.mesh(new T.BoxGeometry(3, 2, 3), K.mat.paint(0x257179)); lf.position.set(x, h + 3.5, z); s.spin.add(lf); });
    const hero = new T.Group(), part = (w, h, d, c, y) => { const m = K.mesh(new T.BoxGeometry(w, h, d), K.mat.paint(c)); m.position.y = y; return m; };
    hero.add(part(0.5, 0.5, 0.5, 0xffcd75, 1.55), part(0.55, 0.65, 0.3, 0x3b5dc9, 1.0));
    const limb = (x, y, c, h) => { const pv = new T.Group(); pv.position.set(x, y, 0); pv.add(part(0.2, h, 0.22, c, -h / 2)); hero.add(pv); return pv; };
    const aL = limb(-0.38, 1.3, 0xffcd75, 0.6), aR = limb(0.38, 1.3, 0xffcd75, 0.6), lL = limb(-0.14, 0.68, 0x1d2b53, 0.68), lR = limb(0.14, 0.68, 0x1d2b53, 0.68);
    hero.position.set(0, hAt(0, 0) + 0.5, 0); hero.rotation.y = 0.5; s.spin.add(hero);
    const gems = [[1.8, 1], [-1.6, 1.5], [0.5, -2]].map(([x, z]) => { const g = new T.Mesh(new T.OctahedronGeometry(0.3), K.mat.glow(0xc0304f)); g.position.set(x, hAt(x, z) + 1.3, z); s.spin.add(g); return g; });
    s.tick = (dt, t) => { const sw = Math.sin(t * 8) * 0.7; aL.rotation.x = sw; aR.rotation.x = -sw; lL.rotation.x = -sw; lR.rotation.x = sw; gems.forEach((g, i) => { g.rotation.y += dt * 2; g.position.y += Math.sin(t * 3 + i) * 0.004; }); };
    return s;
  };
  B["rock-imaging"] = () => {
    const s = base([6.5, 5.5, 7.5], [0, 2.1, 0], { shadow: 5 }); const SZ = 4.6, clip = new T.Plane(new T.Vector3(0, -1, 0), 3);
    const g = new T.BoxGeometry(SZ, SZ, SZ); const shell = new T.Mesh(g, new T.MeshStandardMaterial({ color: 0x8d929a, transparent: true, opacity: 0.3, clippingPlanes: [clip], side: T.DoubleSide, depthWrite: false })); shell.position.y = SZ / 2; s.spin.add(shell); const e = K.edges(g, 0x9fb0cc, 0.6); e.position.y = SZ / 2; s.spin.add(e);
    let seed = 11; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647, n = 260;
    const inst = new T.InstancedMesh(new T.SphereGeometry(1, 12, 8), new T.MeshStandardMaterial({ color: 0x3f7f74, emissive: 0x1f3f39, emissiveIntensity: 0.6, roughness: 0.3, clippingPlanes: [clip] }), n), m = new T.Matrix4();
    for (let i = 0; i < n; i++) { const rr = 0.06 + r() * 0.22; m.makeScale(rr, rr, rr); m.setPosition((r() - 0.5) * SZ, r() * SZ, (r() - 0.5) * SZ); inst.setMatrixAt(i, m); } s.spin.add(inst);
    const cut = new T.Mesh(new T.PlaneGeometry(SZ, SZ), new T.MeshBasicMaterial({ color: 0x9aa0aa, side: T.DoubleSide, transparent: true, opacity: 0.85 })); cut.rotation.x = -Math.PI / 2; s.spin.add(cut);
    const ce = K.edges(new T.PlaneGeometry(SZ, SZ), 0xd2601a, 1); ce.rotation.x = -Math.PI / 2; s.spin.add(ce);
    s.tick = (dt, t) => { const h = SZ * (0.55 + Math.sin(t * 0.6) * 0.3); clip.constant = h; cut.position.y = h; ce.position.y = h; };
    return s;
  };
  B["product-video"] = () => {
    const s = base([8, 4.5, 8], [0, 1.6, 0], { shadow: 6 });
    const frame = K.mesh(new T.BoxGeometry(6, 0.3, 3.4), K.mat.paint(0x5d6b7c)); frame.position.y = 0.6; s.spin.add(frame);
    const unit = new T.Group(); const sh = K.mesh(new T.BoxGeometry(4, 2.2, 2.6), K.mat.paint(0xe6e9ef)); sh.position.y = 1.1; unit.add(sh);
    const bz = K.mesh(new T.CylinderGeometry(0.85, 0.85, 0.1, 40), K.mat.paint(0x0e7470)); bz.rotation.x = Math.PI / 2; bz.position.set(-0.5, 1.15, 1.31); unit.add(bz);
    const fan = new T.Group(); for (let i = 0; i < 6; i++) { const b = K.mesh(new T.BoxGeometry(0.16, 0.7, 0.04), K.mat.glow(0x3f7f74)); b.position.y = 0.35; const p = new T.Group(); p.rotation.z = i / 6 * Math.PI * 2; p.add(b); fan.add(p); } fan.position.set(-0.5, 1.15, 1.38); unit.add(fan);
    const led = K.mesh(new T.SphereGeometry(0.12, 14, 10), K.mat.glow(0x38d39f)); led.position.set(1.4, 1.7, 1.32); unit.add(led); unit.position.y = 0.75; s.spin.add(unit);
    const screen = new T.Mesh(new T.PlaneGeometry(4.8, 2.7), new T.MeshBasicMaterial({ color: 0x1c1e22, transparent: true, opacity: 0.06, side: T.DoubleSide })); screen.position.set(0, 3.2, -2.6); s.spin.add(screen); const se = K.edges(new T.PlaneGeometry(4.8, 2.7), 0x3f7f74, 0.7); se.position.copy(screen.position); s.spin.add(se);
    const play = new T.Mesh(new T.CircleGeometry(0.45, 3), K.mat.glow(0xd2601a)); play.position.set(0, 3.2, -2.55); s.spin.add(play);
    s.tick = (dt, t) => { fan.rotation.z += dt * 14; led.material.emissiveIntensity = 0.5 + Math.abs(Math.sin(t * 4)) * 0.8; play.scale.setScalar(1 + Math.sin(t * 3) * 0.08); };
    return s;
  };

  const cards = [], obs = new IntersectionObserver(es => es.forEach(en => { const c = cards.find(x => x.thumb === en.target); if (c) c.visible = en.isIntersecting; }), { rootMargin: "100px" });
  root.querySelectorAll(".thumb[data-thumb]").forEach(thumb => {
    const id = thumb.dataset.thumb; if (!B[id]) return;
    let s; try { s = B[id](); } catch (e) { console.error(e); return; }
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H; cv.className = "thumb3d"; cv.setAttribute("aria-hidden", "true");
    thumb.appendChild(cv); thumb.classList.add("has3d");
    const card = thumb.closest(".card"), c = { id, s, cv, ctx: cv.getContext("2d"), thumb, visible: true, hover: false, mx: 0, my: 0, rot: Math.random() * 6, last: 0 };
    card.addEventListener("pointerenter", () => c.hover = true); card.addEventListener("pointerleave", () => { c.hover = false; c.mx = c.my = 0; });
    card.addEventListener("pointermove", e => { const r = card.getBoundingClientRect(); c.mx = (e.clientX - r.left) / r.width - 0.5; c.my = (e.clientY - r.top) / r.height - 0.5; });
    obs.observe(thumb); cards.push(c);
  });
  const reduced = K.reduced();
  let id, running = true, prev = performance.now();
  function draw(c, dt, t) {
    c.rot += dt * (c.hover ? 0.9 : 0.25);
    const sp = c.s.spin; sp.rotation.y = (reduced ? 0.4 : Math.sin(c.rot) * 0.45) + c.mx * 0.9; sp.rotation.x = c.my * 0.25;
    c.s.tick(dt, t); renderer.render(c.s.scene, c.s.camera);
    c.ctx.clearRect(0, 0, W, H); c.ctx.drawImage(renderer.domElement, 0, 0);
  }
  cards.forEach(c => draw(c, 0, 0));
  function loop(now) {
    if (!running) return; id = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - prev) / 1000); prev = now; if (document.hidden || reduced) return;
    cards.forEach(c => { if (!c.visible) return; const gap = c.hover ? 0 : 1 / 24; if (now / 1000 - c.last < gap) return; const d = c.last ? Math.min(0.1, now / 1000 - c.last) : dt; c.last = now / 1000; draw(c, d, now / 1000); });
  }
  id = requestAnimationFrame(loop);
  return () => { running = false; cancelAnimationFrame(id); obs.disconnect(); cards.forEach(c => c.s.scene.traverse(o => { if (o.geometry) o.geometry.dispose(); })); renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss(); };
};
