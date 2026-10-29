/* 3D work samples. They replace the 2D versions in window.DEMOS. */
(function () {
  if (!window.THREE || !window.KIT) return;
  const T = THREE, K = KIT, D = window.DEMOS;
  const slider = (id, label, min, max, step, val, unit = "") =>
    `<label class="ctl" for="${id}"><span>${label} <output id="${id}-o">${val}${unit}</output></span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
  const bindOut = (root, id, unit = "", fmt = v => v) => { const i = root.querySelector("#" + id), o = root.querySelector("#" + id + "-o"); const u = () => o.textContent = fmt(+i.value) + unit; i.addEventListener("input", u); u(); return i; };
  const lerp = (a, b, k) => a + (b - a) * k;

  /* ---------- shared motor mount model (used by assembly and BOM) ---------- */
  function buildMount(scene, opts = {}) {
    const parts = {}, root = new T.Group(); scene.add(root);
    const add = (id, obj) => { (parts[id] = parts[id] || new T.Group()).add(obj); return obj; };
    const steel = K.mat.steel(), dark = K.mat.dark();
    add("base", K.mesh(new T.BoxGeometry(16, 0.5, 8), K.mat.paint(0x5d6b7c)));
    parts.base.children[0].position.y = 0.25;
    [[-5.5, -2.8], [-5.5, 2.8], [5.5, -2.8], [5.5, 2.8]].forEach(([x, z]) => { const s = add("spacer", K.mesh(new T.CylinderGeometry(0.35, 0.35, 0.4, 24), K.mat.glow(0x3f7f74))); s.position.set(x, 0.7, z); s.material.emissiveIntensity = 0.25; });
    [-5.5, 5.5].forEach(x => {
      const g = new T.Group();
      const plate = K.mesh(new T.BoxGeometry(0.4, 3, 6.6), steel.clone()); plate.position.y = 1.5; g.add(plate);
      const foot = K.mesh(new T.BoxGeometry(2, 0.4, 6.6), steel.clone()); foot.position.set(x < 0 ? 0.8 : -0.8, 0.2, 0); g.add(foot);
      [-1.8, 1.8].forEach(z => { const slot = K.mesh(new T.BoxGeometry(0.44, 0.5, 1.8), new T.MeshStandardMaterial({ color: 0x222428 }), false); slot.position.set(0, 2.2, z); g.add(slot); });
      g.position.set(x, 0.9, 0); add("bracket", g);
    });
    const motor = new T.Group();
    const body = K.mesh(new T.CylinderGeometry(1.5, 1.5, 7, 48), K.mat.paint(0x4f6b8a)); body.rotation.z = Math.PI / 2; motor.add(body);
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const fin = K.mesh(new T.BoxGeometry(6.4, 0.08, 0.28), dark); fin.position.set(0, Math.cos(a) * 1.55, Math.sin(a) * 1.55); fin.rotation.x = -a; motor.add(fin); }
    const tbox = K.mesh(new T.BoxGeometry(1.4, 0.6, 1.2), dark); tbox.position.set(-1, 1.7, 0); motor.add(tbox);
    [-3.6, 3.6].forEach(x => { const cap = K.mesh(new T.CylinderGeometry(1.35, 1.5, 0.3, 48), dark); cap.rotation.z = Math.PI / 2; cap.position.x = x; motor.add(cap); });
    const shaft = K.mesh(new T.CylinderGeometry(0.22, 0.22, 2.2, 24), steel); shaft.rotation.z = Math.PI / 2; shaft.position.x = 4.8; motor.add(shaft);
    const pulley = K.mesh(new T.CylinderGeometry(0.9, 0.9, 0.6, 40), K.mat.paint(0xd2601a)); pulley.rotation.z = Math.PI / 2; pulley.position.x = 5.6; motor.add(pulley);
    motor.position.set(0, 5.1, 0); add("motor", motor);
    [-5.5, 5.5].forEach(x => [-1.8, 1.8].forEach(z => { const sc = new T.Group(); const shank = K.mesh(new T.CylinderGeometry(0.16, 0.16, 1.2, 12), dark); const head = K.mesh(new T.CylinderGeometry(0.3, 0.3, 0.25, 6), K.mat.paint(0xd7dceb)); head.position.y = 0.7; sc.add(shank, head); sc.rotation.z = x < 0 ? Math.PI / 2 : -Math.PI / 2; sc.position.set(x + (x < 0 ? -0.6 : 0.6), 3.1, z); add("screw", sc); }));
    const driven = K.mesh(new T.CylinderGeometry(1.4, 1.4, 0.6, 48), K.mat.paint(0xd7dceb)); driven.rotation.z = Math.PI / 2;
    const dGroup = new T.Group(); dGroup.add(driven); const stand = K.mesh(new T.BoxGeometry(0.6, 5.1, 1.2), K.mat.paint(0x5d6b7c)); stand.position.set(-0.9, -2.55, 0); const bearing = K.mesh(new T.CylinderGeometry(0.5, 0.5, 0.9, 24), steel); bearing.rotation.z = Math.PI / 2; bearing.position.x = -0.75; dGroup.add(stand, bearing); scene.add(dGroup);
    // drive pulley lives at motor x + 5.6, driven pulley sits further out along z (belt runs across)
    dGroup.position.set(5.6, 5.1, -7);
    const coverGeo = new T.BoxGeometry(9, 4.2, 4.2);
    const cover = new T.Group(); cover.add(new T.Mesh(coverGeo, K.mat.glass(0x8a93a6)), K.edges(coverGeo, 0x7d8597, 0.9)); cover.position.set(0, 5.1, 0); add("cover", cover);
    if (opts.guard) { const gg = new T.BoxGeometry(1.4, 3.6, 8.4); const guard = new T.Group(); guard.add(K.mesh(gg, K.mat.paint(0xf2c14e)), K.edges(gg, 0xffffff, 0.3)); guard.position.set(7.1, 5.1, -3.5); add("guard", guard); }
    Object.entries(parts).forEach(([id, g]) => { g.userData.id = id; g.userData.base = g.position.clone(); g.traverse(o => o.userData.part = id); root.add(g); });
    let belt;
    function setBelt(s) {
      if (belt) { root.remove(belt); belt.geometry.dispose(); }
      const mx = parts.motor.position.x + 5.6, my = parts.motor.position.y, mz = parts.motor.position.z;
      const a = new T.Vector3(mx, my, mz), b = dGroup.position.clone(); b.y = my + (dGroup.position.y - 5.1);
      const pts = []; const r1 = 0.9, r2 = 1.4, sag = Math.max(0, (30 - s)) * 0.03;
      for (let i = 0; i <= 16; i++) { const t = i / 16 * Math.PI; pts.push(new T.Vector3(a.x, a.y + Math.cos(t) * r1, a.z + Math.sin(t) * r1)); }
      pts.push(new T.Vector3(a.x, a.y - r1 - sag, (a.z + b.z) / 2));
      for (let i = 0; i <= 16; i++) { const t = Math.PI + i / 16 * Math.PI; pts.push(new T.Vector3(b.x, b.y + Math.cos(t) * r2, b.z + Math.sin(t) * r2)); }
      pts.push(new T.Vector3(a.x, a.y + r1 + 0.2, (a.z + b.z) / 2));
      const curve = new T.CatmullRomCurve3(pts, true);
      belt = K.mesh(new T.TubeGeometry(curve, 160, 0.12, 8, true), new T.MeshStandardMaterial({ color: 0x26282c, roughness: 0.8 }));
      root.add(belt);
    }
    return { parts, root, dGroup, setBelt, pulley };
  }
  function setGlow(group, color, amt) { group.traverse(o => { if (o.material && o.material.emissive) { if (o.userData.e0 === undefined) { o.userData.e0 = o.material.emissive.getHex(); o.userData.ei0 = o.material.emissiveIntensity; o.material = o.material.clone(); } if (amt > 0) { o.material.emissive.setHex(color); o.material.emissiveIntensity = amt; } else { o.material.emissive.setHex(o.userData.e0); o.material.emissiveIntensity = o.userData.ei0; } } }); }

  window.KIT3D = { buildMount, setGlow };

  /* ================= Motor mount 3D ================= */
  D["motor-mount"] = host => {
    const rows = [["base", "1", "Base plate", "MM-100 · A36, 10 mm", "1"], ["bracket", "2", "Bracket, slotted", "MM-110 · A36, 8 mm", "2"], ["spacer", "3", "Spacer", "MM-120 · Al 6061", "4"], ["cover", "4", "Cover", "MM-130 · Polycarbonate", "1"], ["screw", "5", "Socket cap screw M8×30", "ISO 4762 · 8.8", "8"], ["motor", "6", "Drive motor", "Supplier STEP", "1"]];
    host.innerHTML = `<div class="demo-bar"><strong class="demo-title">3D assembly viewer</strong><span class="pill" id="mm-part">Hover a part</span><span class="spacer"></span>
      <button class="btn small" type="button" id="mm-cover" aria-pressed="true">Hide cover</button><button class="btn small" type="button" id="mm-spin" aria-pressed="false">Turntable</button><button class="btn small primary" type="button" id="mm-anim">Play assembly</button></div>
      <div class="split3d"><div id="mm-3d"></div><div class="mm-side"><div class="ctl-row col">${slider("mm-ex", "Explode", 0, 100, 1, 0, " %")}${slider("mm-slot", "Slot position", 0, 30, 0.5, 9, " mm")}</div>
      <div class="mm-read" id="mm-read"></div>
      <table class="mini" id="mm-bom"><thead><tr><th>Item</th><th>Description</th><th>Qty</th></tr></thead><tbody>${rows.map(r => `<tr data-p="${r[0]}" tabindex="0"><td>${r[1]}</td><td>${r[2]}<small>${r[3]}</small></td><td>${r[4]}</td></tr>`).join("")}</tbody></table></div></div>
      <p class="demo-note">Drag to orbit the assembly. Hover a part or a BOM row to highlight it in both places. Sliding the motor along the 30 mm slots changes belt centre distance and tension.</p>`;
    const S = K.stage(host.querySelector("#mm-3d"), { height: 460, cam: [14, 11, 14], target: [0, 3, -2], label: "3D motor mount assembly", autoRotate: false, shadowSize: 14 });
    const M = buildMount(S.scene);
    const ex = bindOut(host, "mm-ex", " %"), slot = bindOut(host, "mm-slot", " mm");
    const lift = { base: 0, spacer: 1, bracket: 2.2, screw: 6, motor: 4.2, cover: 8.5 };
    let hl = null, cover = true, animT = -1;
    function layout() {
      const e = +ex.value / 100, s = +slot.value;
      Object.entries(M.parts).forEach(([id, g]) => { g.position.copy(g.userData.base); g.position.y += e * (lift[id] || 0); });
      const dz = (s - 9) * 0.07; M.parts.motor.position.z += dz; M.parts.cover.position.z += dz; M.parts.screw.position.z += 0;
      M.parts.cover.visible = cover; M.setBelt(s);
      host.querySelector("#mm-read").innerHTML = `<div><span>Belt centre distance</span><strong>${(180 + s).toFixed(1)} mm</strong></div><div><span>Static belt tension</span><strong>${Math.round(120 + s * 9)} N</strong></div><div><span>Slot travel used</span><strong>${Math.round(s / 30 * 100)} %</strong></div>`;
    }
    function highlight(id) {
      if (hl === id) return; hl = id;
      Object.entries(M.parts).forEach(([pid, g]) => setGlow(g, 0x3f7f74, pid === id ? 0.55 : 0));
      host.querySelectorAll("#mm-bom tr[data-p]").forEach(r => r.classList.toggle("hl", r.dataset.p === id));
      const row = rows.find(r => r[0] === id); host.querySelector("#mm-part").textContent = row ? row[2] : "Hover a part";
    }
    S.renderer.domElement.addEventListener("pointermove", e => { const h = S.pick(e, Object.values(M.parts).filter(g => g.visible)); highlight(h.length ? h[0].object.userData.part : null); });
    S.renderer.domElement.addEventListener("pointerleave", () => highlight(null));
    host.querySelectorAll("#mm-bom tr[data-p]").forEach(r => { ["pointerenter", "focus"].forEach(ev => r.addEventListener(ev, () => highlight(r.dataset.p))); ["pointerleave", "blur"].forEach(ev => r.addEventListener(ev, () => highlight(null))); });
    ex.addEventListener("input", layout); slot.addEventListener("input", layout);
    host.querySelector("#mm-cover").addEventListener("click", e => { cover = !cover; e.currentTarget.setAttribute("aria-pressed", String(cover)); e.currentTarget.textContent = cover ? "Hide cover" : "Show cover"; layout(); });
    host.querySelector("#mm-spin").addEventListener("click", e => { S.controls.autoRotate = !S.controls.autoRotate; e.currentTarget.setAttribute("aria-pressed", String(S.controls.autoRotate)); });
    host.querySelector("#mm-anim").addEventListener("click", () => { animT = 0; });
    S.onFrame((dt, t) => {
      M.pulley.rotation.x += dt * 6; M.dGroup.children[0].rotation.x += dt * 3.9;
      if (animT >= 0) { animT += dt; const k = animT < 1.2 ? animT / 1.2 : animT < 2 ? 1 : Math.max(0, 1 - (animT - 2) / 1.6); ex.value = Math.round(k * 100); ex.dispatchEvent(new Event("input")); if (animT > 3.6) animT = -1; }
    });
    layout();
    return S.dispose;
  };

  /* ================= Bracket FEA 3D ================= */
  D["bracket-fea"] = host => {
    host.innerHTML = `<div class="demo-bar"><strong class="demo-title">3D bracket stress check</strong><span class="spacer"></span>
      <div class="seg" role="group" aria-label="View"><button type="button" class="chip" data-v="stress" aria-pressed="true">Stress</button><button type="button" class="chip" data-v="mode" aria-pressed="false">Mode 1</button></div>
      <button class="btn small" type="button" id="fe-wire" aria-pressed="false">Show mesh</button></div>
      <div id="fe-3d"></div>
      <div class="ctl-row">${slider("fe-f", "Load F", 100, 2000, 50, 500, " N")}${slider("fe-t", "Flange thickness", 4, 14, 0.5, 8, " mm")}${slider("fe-l", "Arm length", 60, 180, 5, 80, " mm")}</div>
      <div class="mm-read wide" id="fe-read"></div>
      <p class="demo-note">A 3D cantilever hand check that sits alongside my full model. Colours show bending stress σ = 6FL / (b t²) varying along the arm and through the thickness. Deflection uses δ = FL³ / (3EI) and the first mode uses Euler Bernoulli theory. ASTM A36, E = 200 GPa, yield 250 MPa, 40 mm flange, 8 kg motor at the tip, 25 Hz excitation.</p>`;
    const S = K.stage(host.querySelector("#fe-3d"), { height: 440, cam: [7, 4.5, 9], target: [2.5, 0.8, 0], label: "3D stress plot of bracket" });
    const F = bindOut(host, "fe-f", " N"), Tt = bindOut(host, "fe-t", " mm"), Lr = bindOut(host, "fe-l", " mm");
    let view = "stress";
    const wall = K.mesh(new T.BoxGeometry(0.8, 5, 4), K.mat.dark()); wall.position.set(-0.4, 1.5, 0); S.scene.add(wall);
    const hatch = K.edges(new T.BoxGeometry(0.8, 5, 4), 0x8a93a6, 0.8); hatch.position.copy(wall.position); S.scene.add(hatch);
    const SEG = [60, 6, 10]; let geo, beam, wire, base;
    const arrow = new T.ArrowHelper(new T.Vector3(0, -1, 0), new T.Vector3(0, 3, 0), 1.6, 0xd2601a, 0.45, 0.3); S.scene.add(arrow);
    const motorBlock = K.mesh(new T.BoxGeometry(1.2, 1.2, 1.6), K.mat.paint(0x4f6b8a)); S.scene.add(motorBlock);
    const tag = K.label(S, "", "big");
    function build() {
      const L = +Lr.value / 1000, t = +Tt.value / 1000, Lw = L * 60, tw = Math.max(0.15, t * 60), bw = 2.4;
      if (beam) { S.scene.remove(beam, wire); geo.dispose(); }
      geo = new T.BoxGeometry(Lw, tw, bw, ...SEG); geo.translate(Lw / 2, 1.5, 0);
      base = geo.attributes.position.array.slice();
      geo.setAttribute("color", new T.BufferAttribute(new Float32Array(geo.attributes.position.count * 3), 3));
      beam = K.mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.1 }));
      wire = new T.LineSegments(new T.WireframeGeometry(geo), new T.LineBasicMaterial({ color: 0x1c1e22, transparent: true, opacity: 0.18 })); wire.visible = host.querySelector("#fe-wire").getAttribute("aria-pressed") === "true";
      S.scene.add(beam, wire); beam.userData = { Lw, tw };
    }
    [F, Tt, Lr].forEach(i => i.addEventListener("input", () => { if (i !== F) build(); }));
    host.querySelectorAll(".seg .chip").forEach(b => b.addEventListener("click", () => { view = b.dataset.v; host.querySelectorAll(".seg .chip").forEach(x => x.setAttribute("aria-pressed", String(x === b))); }));
    host.querySelector("#fe-wire").addEventListener("click", e => { const on = e.currentTarget.getAttribute("aria-pressed") !== "true"; e.currentTarget.setAttribute("aria-pressed", String(on)); wire.visible = on; });
    build();
    let frame = 0;
    S.onFrame((dt, time) => {
      const f = +F.value, t = +Tt.value / 1000, L = +Lr.value / 1000, b = 0.04, E = 200e9, I = b * t ** 3 / 12, A = b * t;
      const sig = 6 * f * L / (b * t * t) / 1e6, delta = f * L ** 3 / (3 * E * I) * 1000, fos = 250 / sig;
      const k = 3 * E * I / L ** 3, fn = Math.sqrt(k / (8 + 0.2357 * 7850 * A * L)) / (2 * Math.PI);
      const { Lw, tw } = beam.userData, pos = geo.attributes.position, col = geo.attributes.color;
      const amp = view === "mode" ? (K.reduced() ? 0.6 : Math.sin(time * 5) * 0.9) : -Math.min(1.8, delta * 2.4);
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3], y = base[i * 3 + 1], s = x / Lw, fy = Math.abs((y - 1.5) / (tw / 2));
        pos.array[i * 3 + 1] = y + amp * (s * s * (3 - s) / 2) * (view === "mode" ? 1 : 1);
        const v = view === "stress" ? Math.min(1, sig / 250) * (1 - s) * fy : 0.3 + 0.7 * Math.abs(Math.sin(time * 5)) * s * s;
        const c = K.heatLin(v); col.array.set(c, i * 3);
      }
      pos.needsUpdate = true; col.needsUpdate = true; geo.computeVertexNormals();
      if (wire.visible && ++frame % 4 === 0) { wire.geometry.dispose(); wire.geometry = new T.WireframeGeometry(geo); }
      const tipY = 1.5 + amp + tw / 2;
      motorBlock.position.set(Lw - 0.7, tipY + 0.6, 0); arrow.position.set(Lw - 0.7, tipY + 3, 0); arrow.visible = view === "stress";
      tag.textContent = view === "stress" ? `σ max ${sig.toFixed(0)} MPa at the root` : `Mode 1 · ${fn.toFixed(0)} Hz`; K.placeLabel(S, tag, new T.Vector3(0.4, 1.5 + tw / 2 + 0.5, 1.3));
      if (frame % 6 === 0) host.querySelector("#fe-read").innerHTML = `<div><span>Max bending stress</span><strong>${sig.toFixed(0)} MPa</strong></div><div><span>Factor of safety</span><strong class="${fos < 1.5 ? "bad" : "good"}">${fos.toFixed(2)}</strong></div><div><span>Tip deflection</span><strong>${delta.toFixed(2)} mm</strong></div><div><span>First natural frequency</span><strong>${fn.toFixed(0)} Hz</strong></div><div><span>Clear of 25 Hz excitation</span><strong class="${fn > 50 ? "good" : "bad"}">${fn > 50 ? "Yes" : "No"}</strong></div>`;
      frame++;
    });
    return S.dispose;
  };

  /* ================= Enclosure CFD 3D ================= */
  D["enclosure-cfd"] = host => {
    const NX = 72, NY = 40, W = 10, H = 5.6, DEP = 4;
    const layouts = { baseline: { name: "Baseline vents", out: [[NX - 1, 4, 8]] }, top: { name: "Relocated vents", out: [[-1, 30, 40]] }, rec: { name: "Relocated + guide", out: [[NX - 1, 16, 28], [NX - 1, 4, 8]] } };
    host.innerHTML = `<div class="demo-bar"><strong class="demo-title">3D cooling explorer</strong><span class="spacer"></span>
      <div class="seg" role="group" aria-label="Vent layout">${Object.entries(layouts).map(([k, v]) => `<button type="button" class="chip" data-k="${k}" aria-pressed="${k === "rec"}">${v.name}</button>`).join("")}</div></div>
      <div id="cf-3d"></div>
      <div class="ctl-row">${slider("cf-fan", "Fan speed", 20, 100, 5, 70, " %")}${slider("cf-q", "Processor load", 5, 40, 1, 30, " W")}
      <label class="ctl check"><input type="checkbox" id="cf-p" checked> <span>Air particles</span></label><label class="ctl check"><input type="checkbox" id="cf-s" checked> <span>Section plane</span></label></div>
      <div class="mm-read wide" id="cf-read"></div>
      <p class="demo-note">A small solver runs live in your browser. It computes a potential flow field from the inlet fan to the vents, then convects and diffuses heat from the processor and power supply. The section plane shows temperature, and particles follow the airflow, coloured by local temperature.</p>`;
    const S = K.stage(host.querySelector("#cf-3d"), { height: 460, cam: [9, 6.5, 10], target: [0, 2.8, 0], label: "3D enclosure airflow", shadowSize: 10 });
    const fan = bindOut(host, "cf-fan", " %"), q = bindOut(host, "cf-q", " W"), pOn = host.querySelector("#cf-p"), sOn = host.querySelector("#cf-s");
    const id = (x, y) => y * NX + x, solid = new Uint8Array(NX * NY), src = new Float32Array(NX * NY);
    const rect = (x0, y0, x1, y1, arr, v) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) arr[id(x, y)] = v; };
    rect(14, 30, 48, 34, solid, 1); rect(54, 24, 64, 36, solid, 1);
    let phi = new Float32Array(NX * NY), u = new Float32Array(NX * NY), v = new Float32Array(NX * NY), Tm = new Float32Array(NX * NY), lay = "rec", isOut;
    const gx = i => -W / 2 + (i + 0.5) / NX * W, gy = j => H - (j + 0.5) / NY * H;
    // enclosure
    const boxGeo = new T.BoxGeometry(W, H, DEP); const shell = new T.Mesh(boxGeo, K.mat.glass(0xc9d3da)); shell.position.y = H / 2; S.scene.add(shell);
    const shellE = K.edges(boxGeo, 0x8a9aa8, 0.8); shellE.position.y = H / 2; S.scene.add(shellE);
    const comp = (x0, y0, x1, y1, color, name) => { const w = (x1 - x0) / NX * W, h = (y1 - y0) / NY * H; const m = K.mesh(new T.BoxGeometry(w, h, DEP * 0.8), K.mat.paint(color)); m.position.set(gx(x0) + w / 2 - W / NX / 2, gy(y1 - 1) + h / 2 - H / NY / 2, 0); S.scene.add(m); return m; };
    comp(14, 30, 48, 34, 0x1f6f4a, "Board"); comp(54, 24, 64, 36, 0x5a6684, "PSU"); const proc = comp(26, 26, 36, 30, 0x3a3d43, "Processor");
    for (let i = 0; i < 7; i++) { const fin = K.mesh(new T.BoxGeometry(0.06, 0.5, DEP * 0.7), K.mat.steel()); fin.position.set(proc.position.x - 0.6 + i * 0.2, proc.position.y + 0.45, 0); S.scene.add(fin); }
    const fanG = new T.Group(); for (let i = 0; i < 5; i++) { const bl = K.mesh(new T.BoxGeometry(0.05, 0.9, 0.3), K.mat.glow(0x3f7f74)); bl.position.y = 0.45; const piv = new T.Group(); piv.rotation.x = i / 5 * Math.PI * 2; piv.add(bl); fanG.add(piv); }
    fanG.position.set(-W / 2 + 0.1, gy(17), 0); S.scene.add(fanG);
    const ring = K.mesh(new T.TorusGeometry(0.95, 0.06, 8, 32), K.mat.steel()); ring.rotation.y = Math.PI / 2; ring.position.copy(fanG.position); S.scene.add(ring);
    const ventGroup = new T.Group(); S.scene.add(ventGroup);
    const labels = { fan: K.label(S, "Inlet fan, 12 L/s"), proc: K.label(S, "Processor"), psu: K.label(S, "PSU 20 W") };
    // section plane texture
    const cvs = document.createElement("canvas"); cvs.width = NX; cvs.height = NY; const cctx = cvs.getContext("2d"), img = cctx.createImageData(NX, NY);
    const tex = new T.CanvasTexture(cvs); tex.encoding = T.sRGBEncoding; tex.magFilter = T.LinearFilter;
    const plane = new T.Mesh(new T.PlaneGeometry(W, H), new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.88, side: T.DoubleSide, depthWrite: false })); plane.position.set(0, H / 2, -0.01); S.scene.add(plane);
    // particles
    const NP = 900, pgeo = new T.BufferGeometry(), pp = new Float32Array(NP * 3), pc = new Float32Array(NP * 3), pij = new Float32Array(NP * 2);
    pgeo.setAttribute("position", new T.BufferAttribute(pp, 3)); pgeo.setAttribute("color", new T.BufferAttribute(pc, 3));
    const pts = new T.Points(pgeo, new T.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 1, depthWrite: false, blending: T.NormalBlending })); S.scene.add(pts);
    const spawn = k => { pij[k * 2] = Math.random() * 2; pij[k * 2 + 1] = 12 + Math.random() * 10; pp[k * 3 + 2] = (Math.random() - 0.5) * DEP * 0.85; };
    for (let k = 0; k < NP; k++) { spawn(k); pij[k * 2] = Math.random() * NX; pij[k * 2 + 1] = Math.random() * NY; }
    function flow() {
      const outs = layouts[lay].out; isOut = new Uint8Array(NX * NY); const isIn = new Uint8Array(NX * NY);
      for (let y = 12; y < 22; y++) isIn[id(0, y)] = 1;
      outs.forEach(([x, a, b]) => { for (let k = a; k < b; k++) { if (x === -1) isOut[id(k, 0)] = 1; else isOut[id(x, k)] = 1; } });
      phi.fill(0.5);
      for (let it = 0; it < 900; it++) for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
        const i = id(x, y); if (solid[i]) continue; if (isIn[i]) { phi[i] = 1; continue; } if (isOut[i]) { phi[i] = 0; continue; }
        let s = 0, n = 0; if (x < NX - 1 && !solid[i + 1]) { s += phi[i + 1]; n++; } if (x > 0 && !solid[i - 1]) { s += phi[i - 1]; n++; } if (y < NY - 1 && !solid[i + NX]) { s += phi[i + NX]; n++; } if (y > 0 && !solid[i - NX]) { s += phi[i - NX]; n++; }
        if (n) phi[i] = s / n;
      }
      let m = 0;
      for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) { const i = id(x, y); if (solid[i]) { u[i] = v[i] = 0; continue; }
        const p = k => (k < 0 || k >= NX * NY || solid[k]) ? phi[i] : phi[k];
        u[i] = -(p(x < NX - 1 ? i + 1 : -1) - p(x > 0 ? i - 1 : -1)); v[i] = -(p(y < NY - 1 ? i + NX : -1) - p(y > 0 ? i - NX : -1)); m = Math.max(m, Math.hypot(u[i], v[i])); }
      for (let i = 0; i < u.length; i++) { u[i] /= m; v[i] /= m; }
      Tm.fill(0);
      while (ventGroup.children.length) ventGroup.remove(ventGroup.children[0]);
      outs.forEach(([x, a, b]) => { for (let k = a; k < b; k += 2) { const g = new T.BoxGeometry(x === -1 ? W / NX * 1.4 : 0.08, x === -1 ? 0.08 : H / NY * 1.4, DEP * 0.7); const s = new T.Mesh(g, K.mat.glow(0x3f7f74)); if (x === -1) s.position.set(gx(k), H, 0); else s.position.set(W / 2, gy(k), 0); ventGroup.add(s); } });
    }
    function step() {
      src.fill(0); rect(26, 26, 36, 30, src, +q.value * 0.012); rect(54, 24, 64, 36, src, 0.06);
      const sp = +fan.value / 100 * 0.45, k = 0.08, Tn = new Float32Array(Tm.length);
      for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
        const i = id(x, y), c = Tm[i];
        if (x === 0 && y >= 12 && y < 22) { Tn[i] = 0; continue; }
        const r = x < NX - 1 ? Tm[i + 1] : c, l = x > 0 ? Tm[i - 1] : c, dn = y < NY - 1 ? Tm[i + NX] : c, up = y > 0 ? Tm[i - NX] : c;
        const ux = u[i] * sp, vy = v[i] * sp;
        const adv = (ux > 0 ? c - l : r - c) * ux + (vy > 0 ? c - up : dn - c) * vy;
        Tn[i] = Math.max(0, c + k * (r + l + dn + up - 4 * c) - adv + src[i] - (isOut[i] ? c * 0.3 : 0));
      }
      Tm = Tn;
    }
    host.querySelectorAll(".seg .chip").forEach(b => b.addEventListener("click", () => { lay = b.dataset.k; host.querySelectorAll(".seg .chip").forEach(x => x.setAttribute("aria-pressed", String(x === b))); flow(); }));
    flow();
    let frame = 0;
    S.onFrame(dt => {
      for (let s = 0; s < 5; s++) step();
      let peak = 0, peakI = 0; for (let i = 0; i < Tm.length; i++) if (Tm[i] > peak) { peak = Tm[i]; peakI = i; }
      if (sOn.checked) { for (let i = 0; i < Tm.length; i++) { const c = K.heat(Tm[i] / 40); img.data[i * 4] = c[0] * 255; img.data[i * 4 + 1] = c[1] * 255; img.data[i * 4 + 2] = c[2] * 255; img.data[i * 4 + 3] = solid[i] ? 0 : 235; } cctx.putImageData(img, 0, 0); tex.needsUpdate = true; }
      plane.visible = sOn.checked; pts.visible = pOn.checked;
      fanG.rotation.x += dt * (+fan.value / 100) * 30;
      if (pOn.checked) {
        const sp = +fan.value / 100 * 22;
        for (let kk = 0; kk < NP; kk++) {
          let x = pij[kk * 2], y = pij[kk * 2 + 1]; const i = id(Math.min(NX - 1, Math.max(0, x | 0)), Math.min(NY - 1, Math.max(0, y | 0)));
          x += u[i] * sp * dt + (Math.random() - 0.5) * 0.05; y += v[i] * sp * dt + (Math.random() - 0.5) * 0.05;
          if (x < 0 || x >= NX || y < 0 || y >= NY || solid[i] || (Math.abs(u[i]) + Math.abs(v[i]) < 0.002 && Math.random() < 0.02)) { spawn(kk); x = pij[kk * 2]; y = pij[kk * 2 + 1]; }
          pij[kk * 2] = x; pij[kk * 2 + 1] = y; pp[kk * 3] = -W / 2 + x / NX * W; pp[kk * 3 + 1] = H - y / NY * H;
          const c = K.heatLin(Tm[i] / 40); pc[kk * 3] = c[0]; pc[kk * 3 + 1] = c[1]; pc[kk * 3 + 2] = c[2];
        }
        pgeo.attributes.position.needsUpdate = true; pgeo.attributes.color.needsUpdate = true;
      }
      K.placeLabel(S, labels.fan, new T.Vector3(-W / 2, gy(10), DEP / 2)); K.placeLabel(S, labels.proc, new T.Vector3(proc.position.x, proc.position.y + 1, DEP / 2)); K.placeLabel(S, labels.psu, new T.Vector3(gx(59), gy(22), DEP / 2));
      if (++frame % 12 === 0) host.querySelector("#cf-read").innerHTML = `<div><span>Layout</span><strong>${layouts[lay].name}</strong></div><div><span>Peak temperature, live</span><strong>${(25 + peak * 1.2).toFixed(0)} °C</strong></div><div><span>Inlet air</span><strong>25 °C</strong></div><div><span>Hot spot</span><strong>${(peakI % NX) > 50 ? "Power supply" : "Processor"}</strong></div>`;
    });
    return S.dispose;
  };

  /* ================= TurtleBot 3D ================= */
  D["turtlebot"] = host => {
    host.innerHTML = `<div class="demo-bar"><strong class="demo-title">3D obstacle avoidance sim</strong><span class="pill" id="tb-state">Forward</span><span class="spacer"></span>
      <div class="seg" role="group" aria-label="Camera"><button type="button" class="chip" data-c="orbit" aria-pressed="true">Orbit</button><button type="button" class="chip" data-c="follow" aria-pressed="false">Follow robot</button></div>
      <button class="btn small" type="button" id="tb-pause">Pause</button><button class="btn small" type="button" id="tb-reset">Reset world</button></div>
      <div class="split3d tb"><div id="tb-3d"></div><div class="mm-read col" id="tb-read"></div></div>
      <div class="ctl-row">${slider("tb-th", "Safety distance", 0.2, 0.6, 0.01, 0.30, " m")}${slider("tb-v", "Forward speed", 0.05, 0.22, 0.01, 0.15, " m/s")}
      <label class="ctl check"><input type="checkbox" id="tb-rays" checked> <span>LiDAR rays</span></label></div>
      <p class="demo-note">Click the floor to drop a box, click a box to remove it. The same front, left, and right sector logic as my ROS 2 node runs on a simulated 360 degree scan at the LDS-01 range.</p>`;
    const S = K.stage(host.querySelector("#tb-3d"), { height: 460, cam: [0, 3.4, 3.6], target: [0, 0, 0], label: "3D robot world", floorR: 12, gridSize: 4, gridDiv: 16, shadowSize: 4, fogNear: 6, fogFar: 18 });
    const th = bindOut(host, "tb-th", " m", v => v.toFixed(2)), vs = bindOut(host, "tb-v", " m/s", v => v.toFixed(2)), rays = host.querySelector("#tb-rays");
    const PX = 120, to3 = (x, y) => [(x - 240) / PX, (y - 160) / PX];
    const walls = new T.Group(); S.scene.add(walls);
    [[0, -1.333, 4, 0.04], [0, 1.333, 4, 0.04], [-2, 0, 0.04, 2.667], [2, 0, 0.04, 2.667]].forEach(([x, z, w, d]) => { const m = K.mesh(new T.BoxGeometry(w, 0.25, d), K.mat.paint(0x8f939a)); m.position.set(x, 0.125, z); walls.add(m); });
    const boxG = new T.Group(); S.scene.add(boxG);
    const robot = new T.Group();
    [0.02, 0.09, 0.16].forEach((y, i) => { const d = K.mesh(new T.CylinderGeometry(0.1, 0.1, 0.012, 32), K.mat.paint(i === 2 ? 0x3a3d43 : 0x2f3237)); d.position.y = y + 0.03; robot.add(d); });
    [[-0.07, 0.07], [0.07, 0.07], [-0.07, -0.07], [0.07, -0.07]].forEach(([x, z]) => { const p = K.mesh(new T.CylinderGeometry(0.006, 0.006, 0.16, 6), K.mat.steel()); p.position.set(x, 0.12, z); robot.add(p); });
    [-1, 1].forEach(s => { const w = K.mesh(new T.CylinderGeometry(0.033, 0.033, 0.018, 24), K.mat.dark()); w.rotation.x = Math.PI / 2; w.position.set(0, 0.033, s * 0.09); robot.add(w); });
    const lidar = K.mesh(new T.CylinderGeometry(0.035, 0.035, 0.04, 24), K.mat.glow(0x3f7f74)); lidar.position.y = 0.21; robot.add(lidar);
    S.scene.add(robot);
    const mover = K.mesh(new T.CylinderGeometry(0.117, 0.117, 0.3, 32), K.mat.paint(0xd2601a)); mover.position.y = 0.15; S.scene.add(mover);
    const rayGeo = new T.BufferGeometry(); const rayPos = new Float32Array(120 * 6); rayGeo.setAttribute("position", new T.BufferAttribute(rayPos, 3));
    const rayLines = new T.LineSegments(rayGeo, new T.LineBasicMaterial({ color: 0x3f7f74, transparent: true, opacity: 0.28 })); S.scene.add(rayLines);
    const hitGeo = new T.BufferGeometry(); const hitPos = new Float32Array(120 * 3); hitGeo.setAttribute("position", new T.BufferAttribute(hitPos, 3));
    S.scene.add(new T.Points(hitGeo, new T.PointsMaterial({ color: 0x3f7f74, size: 0.035 })));
    const trailGeo = new T.BufferGeometry(); const trailPos = new Float32Array(400 * 3); trailGeo.setAttribute("position", new T.BufferAttribute(trailPos, 3)); trailGeo.setDrawRange(0, 0);
    S.scene.add(new T.Line(trailGeo, new T.LineBasicMaterial({ color: 0x7d8597 })));
    const ring = new T.Mesh(new T.RingGeometry(0.29, 0.3, 64), new T.MeshBasicMaterial({ color: 0xd2601a, transparent: true, opacity: 0.7, side: T.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.01; S.scene.add(ring);
    let R, boxes, mv, paused = false, trail = [], scan = [], cam = "orbit";
    function rebuildBoxes() { while (boxG.children.length) { const c = boxG.children.pop(); c.geometry.dispose(); }
      boxes.forEach(([x, y, w, h], i) => { const [cx, cz] = to3(x + w / 2, y + h / 2); const m = K.mesh(new T.BoxGeometry(w / PX, 0.3, h / PX), K.mat.paint(i % 2 ? 0x5d6b7c : 0x6e7a88)); m.position.set(cx, 0.15, cz); m.userData.i = i; boxG.add(m); }); }
    function reset() { R = { x: 60, y: 260, a: -0.6 }; trail = []; boxes = [[140, 70, 36, 36], [230, 170, 36, 36], [340, 50, 30, 90], [110, 200, 36, 36], [380, 220, 36, 36]]; mv = { x: 300, y: 280, vx: -12 }; rebuildBoxes(); }
    reset();
    function cast(x, y, a) {
      let best = 3.5 * PX; const dx = Math.cos(a), dy = Math.sin(a), seg = t => { if (t > 0 && t < best) best = t; };
      if (dx > 0) seg((480 - x) / dx); if (dx < 0) seg(-x / dx); if (dy > 0) seg((320 - y) / dy); if (dy < 0) seg(-y / dy);
      boxes.forEach(([bx, by, bw, bh]) => { let t0 = -1e9, t1 = 1e9;
        for (const [p, d, lo, hi] of [[x, dx, bx, bx + bw], [y, dy, by, by + bh]]) { if (Math.abs(d) < 1e-9) { if (p < lo || p > hi) t0 = 1e9; continue; } let a1 = (lo - p) / d, a2 = (hi - p) / d; if (a1 > a2) [a1, a2] = [a2, a1]; t0 = Math.max(t0, a1); t1 = Math.min(t1, a2); }
        if (t0 <= t1 && t0 > 0) seg(t0); });
      const ox = mv.x - x, oy = mv.y - y, b = ox * dx + oy * dy, disc = b * b - (ox * ox + oy * oy - 196); if (disc > 0) seg(b - Math.sqrt(disc));
      return best / PX;
    }
    const floorPlane = new T.Plane(new T.Vector3(0, 1, 0), 0), hitV = new T.Vector3(); let downAt = null;
    S.renderer.domElement.addEventListener("pointerdown", e => { downAt = [e.clientX, e.clientY]; });
    S.renderer.domElement.addEventListener("pointerup", e => {
      if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 5) return;
      const hb = S.pick(e, boxG.children, false);
      if (hb.length) { boxes.splice(hb[0].object.userData.i, 1); rebuildBoxes(); return; }
      S.pick(e, []); const r = S.renderer.domElement.getBoundingClientRect(), ndc = new T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), rc = new T.Raycaster(); rc.setFromCamera(ndc, S.camera);
      if (rc.ray.intersectPlane(floorPlane, hitV)) { const x = hitV.x * PX + 240, y = hitV.z * PX + 160; if (x > 10 && x < 470 && y > 10 && y < 310 && Math.hypot(x - R.x, y - R.y) > 40) { boxes.push([x - 18, y - 18, 36, 36]); rebuildBoxes(); } }
    });
    host.querySelector("#tb-pause").addEventListener("click", e => { paused = !paused; e.currentTarget.textContent = paused ? "Resume" : "Pause"; });
    host.querySelector("#tb-reset").addEventListener("click", reset);
    host.querySelectorAll(".seg .chip").forEach(b => b.addEventListener("click", () => { cam = b.dataset.c; host.querySelectorAll(".seg .chip").forEach(x => x.setAttribute("aria-pressed", String(x === b))); if (cam === "orbit") { S.camera.position.set(0, 3.4, 3.6); S.controls.target.set(0, 0, 0); } }));
    let state = "Forward", turnDir = 1, n = 0;
    S.onFrame(dt => {
      if (!paused) {
        mv.x += mv.vx * dt; if (mv.x < 200 || mv.x > 450) mv.vx *= -1;
        scan = []; for (let k = 0; k < 120; k++) scan.push(cast(R.x, R.y, R.a + k / 120 * Math.PI * 2));
        const sector = (lo, hi) => { let m = 9; for (let k = 0; k < 120; k++) { let d = k * 3; if (d > 180) d -= 360; if (d >= lo && d <= hi) m = Math.min(m, scan[k]); } return m; };
        const front = sector(-20, 20), left = sector(-90, -21), right = sector(21, 90), T0 = +th.value;
        let vv = +vs.value, w = 0;
        if (front < T0) { vv = 0; if (state !== "Turning") turnDir = left > right ? -1 : 1; w = turnDir * 1.6; state = "Turning"; }
        else if (left < T0 * 0.9) { w = 0.8; state = "Veer right"; } else if (right < T0 * 0.9) { w = -0.8; state = "Veer left"; } else { state = "Forward"; w = Math.sin(performance.now() / 1500) * 0.15; }
        R.a += w * dt; R.x = Math.max(14, Math.min(466, R.x + Math.cos(R.a) * vv * PX * dt)); R.y = Math.max(14, Math.min(306, R.y + Math.sin(R.a) * vv * PX * dt));
        if (++n % 3 === 0) { trail.push(to3(R.x, R.y)); if (trail.length > 400) trail.shift(); trail.forEach(([x, z], i) => trailPos.set([x, 0.01, z], i * 3)); trailGeo.setDrawRange(0, trail.length); trailGeo.attributes.position.needsUpdate = true; }
        host.querySelector("#tb-state").textContent = state;
        if (n % 4 === 0) host.querySelector("#tb-read").innerHTML = [["Front", front], ["Left", left], ["Right", right]].map(([nm, d]) => `<div><span>${nm} sector</span><strong class="${d < T0 ? "bad" : ""}">${d > 3.4 ? "clear" : d.toFixed(2) + " m"}</strong></div>`).join("") + `<div><span>Command</span><strong>v ${vv.toFixed(2)} · ω ${w.toFixed(2)}</strong></div><div><span>Scan</span><strong>5 Hz · 360°</strong></div>`;
      }
      const [rx, rz] = to3(R.x, R.y); robot.position.set(rx, 0, rz); robot.rotation.y = -R.a; lidar.rotation.y += dt * 12;
      ring.position.set(rx, 0.01, rz); ring.scale.setScalar(+th.value / 0.3);
      const [mx, mz] = to3(mv.x, mv.y); mover.position.x = mx; mover.position.z = mz;
      rayLines.visible = rays.checked;
      scan.forEach((d, k) => { const a = R.a + k / 120 * Math.PI * 2, ex = rx + Math.cos(a) * d, ez = rz + Math.sin(a) * d; rayPos.set([rx, 0.21, rz, ex, 0.21, ez], k * 6); hitPos.set(d < 3.4 ? [ex, 0.21, ez] : [rx, -1, rz], k * 3); });
      rayGeo.attributes.position.needsUpdate = true; hitGeo.attributes.position.needsUpdate = true;
      if (cam === "follow") { const back = new T.Vector3(rx - Math.cos(R.a) * 0.9, 0.7, rz - Math.sin(R.a) * 0.9); S.camera.position.lerp(back, 0.08); S.controls.target.lerp(new T.Vector3(rx + Math.cos(R.a) * 0.6, 0.1, rz + Math.sin(R.a) * 0.6), 0.1); }
    });
    return S.dispose;
  };

  /* ================= Puzzle game 3D (playable) ================= */
  D["puzzle-game"] = host => {
    const LEVELS = [
      ["#########", "#P..C..S#", "#.......#", "#######D#", "#E......#", "#########"],
      ["##########", "#P.......#", "#..C...S.#", "#........#", "#..C...S.#", "#........#", "#####D####", "#E.......#", "##########"],
      ["#########", "#...P...#", "#.#.C.#.#", "#.......#", "#.#...#.#", "#...S...#", "###D#####", "#E......#", "#########"],
      ["#########", "#P......#", "#.C...C.#", "#.......#", "#.......#", "#.S...S.#", "####D####", "#E......#", "#########"]
    ];
    host.innerHTML = `<div class="demo-bar"><strong class="demo-title">Crate Switch 3D</strong><span class="pill" id="pg-lv"></span><span class="pill" id="pg-mv"></span>
      <span class="spacer"></span><button class="btn small" id="pg-undo" type="button">Undo (Z)</button><button class="btn small" id="pg-rs" type="button">Restart (R)</button></div>
      <div id="pg-3d"></div>
      <div class="pg-pad" aria-label="Touch controls"><button type="button" data-d="0,-1" aria-label="Up">▲</button><button type="button" data-d="-1,0" aria-label="Left">◀</button><button type="button" data-d="1,0" aria-label="Right">▶</button><button type="button" data-d="0,1" aria-label="Down">▼</button></div>
      <p class="demo-note" id="pg-msg" aria-live="polite">Click the board, then use arrow keys or WASD. Push every crate onto a glowing switch to lower the door, then reach the exit. This web version has 4 of the 6 levels.</p>
      <div class="pg-levels">${LEVELS.map((_, i) => `<button type="button" class="chip" data-l="${i}">Level ${i + 1}</button>`).join("")}</div>`;
    const S = K.stage(host.querySelector("#pg-3d"), { height: 460, cam: [0, 9, 8], target: [0, 0, 0], label: "3D puzzle board. Use arrow keys or WASD.", focusable: true, hint: "Click the board, then use arrow keys · drag to orbit", maxPolar: 1.25, shadowSize: 8 });
    const board = new T.Group(); S.scene.add(board);
    let lv = 0, grid, player, crates, switches, door, exit, moves, hist, won, meshes = {};
    try { lv = Math.min(3, +sessionStorage.getItem("pg-lv") || 0); } catch (e) {}
    const msg = t => host.querySelector("#pg-msg").textContent = t;
    let cols, rows; const P = (x, y) => [x - cols / 2 + 0.5, y - rows / 2 + 0.5];
    function clearBoard() { while (board.children.length) { const c = board.children.pop(); c.traverse(o => { if (o.geometry) o.geometry.dispose(); }); } }
    function load(i) {
      lv = i; try { sessionStorage.setItem("pg-lv", i); } catch (e) {}
      grid = LEVELS[i].map(r => [...r]); crates = []; switches = []; moves = 0; hist = []; won = false; rows = grid.length; cols = grid[0].length;
      grid.forEach((r, y) => r.forEach((ch, x) => { if (ch === "P") player = [x, y]; if (ch === "C") crates.push([x, y]); if (ch === "S") switches.push([x, y]); if (ch === "D") door = [x, y]; if (ch === "E") exit = [x, y]; if ("PCSE".includes(ch)) grid[y][x] = "."; }));
      clearBoard();
      const floorM = K.mat.paint(0xd7d7d0), floorM2 = K.mat.paint(0xcfd0c8), wallM = K.mat.paint(0x8a8e95);
      grid.forEach((r, y) => r.forEach((ch, x) => { const [px, pz] = P(x, y);
        if (ch === "#") { const w = K.mesh(new T.BoxGeometry(1, 0.9, 1), wallM); w.position.set(px, 0.45, pz); board.add(w); const top = K.edges(new T.BoxGeometry(1, 0.9, 1), 0x56677f, 0.35); top.position.copy(w.position); board.add(top); }
        else { const f = K.mesh(new T.BoxGeometry(0.98, 0.1, 0.98), (x + y) % 2 ? floorM : floorM2, false); f.position.set(px, 0.05, pz); board.add(f); } }));
      switches.forEach(([x, y]) => { const [px, pz] = P(x, y); const s = new T.Mesh(new T.TorusGeometry(0.3, 0.06, 12, 40), K.mat.glow(0x3f7f74)); s.rotation.x = -Math.PI / 2; s.position.set(px, 0.13, pz); board.add(s); });
      { const [px, pz] = P(...exit); const e = new T.Mesh(new T.TorusGeometry(0.34, 0.05, 8, 4), K.mat.glow(0x7d8597)); e.rotation.x = -Math.PI / 2; e.rotation.z = Math.PI / 4; e.position.set(px, 0.15, pz); board.add(e); meshes.exit = e; const beam = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 2, 24, 1, true), new T.MeshBasicMaterial({ color: 0x7d8597, transparent: true, opacity: 0.12, side: T.DoubleSide, depthWrite: false })); beam.position.set(px, 1.1, pz); board.add(beam); }
      { const [px, pz] = P(...door); const d = K.mesh(new T.BoxGeometry(0.9, 0.9, 0.2), K.mat.glow(0xd2601a)); d.material.emissiveIntensity = 0.35; d.position.set(px, 0.45, pz); if (grid[door[1]][door[0] - 1] === "#" && grid[door[1]][door[0] + 1] === "#") {} else d.rotation.y = Math.PI / 2; board.add(d); meshes.door = d; }
      meshes.crates = crates.map(([x, y]) => { const g = new T.Group(); const b = K.mesh(new T.BoxGeometry(0.8, 0.8, 0.8), K.mat.paint(0xb07a3c)); g.add(b); const e = K.edges(new T.BoxGeometry(0.8, 0.8, 0.8), 0x4a2c10, 1); g.add(e); const [px, pz] = P(x, y); g.position.set(px, 0.5, pz); board.add(g); return g; });
      const pl = new T.Group(); const body = K.mesh(new T.CylinderGeometry(0.26, 0.3, 0.5, 24), K.mat.paint(0xf2f2ef)); body.position.y = 0.35; const head = K.mesh(new T.SphereGeometry(0.24, 24, 16), K.mat.paint(0xf2f2ef)); head.position.y = 0.8;
      const visor = K.mesh(new T.BoxGeometry(0.3, 0.1, 0.1), K.mat.glow(0x3f7f74)); visor.position.set(0, 0.82, 0.2); pl.add(body, head, visor);
      const [ppx, ppz] = P(...player); pl.position.set(ppx, 0.1, ppz); board.add(pl); meshes.player = pl;
      S.camera.position.set(0, rows * 1.1 + 2, rows * 0.95 + 2); S.controls.target.set(0, 0, 0);
      host.querySelectorAll(".pg-levels .chip").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.l === lv)));
      msg("Push every crate onto a glowing switch to lower the door, then reach the exit."); hud();
    }
    const hud = () => { host.querySelector("#pg-lv").textContent = `Level ${lv + 1} of ${LEVELS.length}`; host.querySelector("#pg-mv").textContent = `${moves} moves`; };
    const crateAt = (x, y) => crates.findIndex(c => c[0] === x && c[1] === y);
    const open = () => switches.every(s => crateAt(s[0], s[1]) >= 0);
    const solid = (x, y) => grid[y][x] === "#" || (grid[y][x] === "D" && !open());
    let facing = 0;
    function move(dx, dy) {
      if (won) return; facing = Math.atan2(dx, dy);
      const nx = player[0] + dx, ny = player[1] + dy; if (solid(nx, ny)) return;
      const ci = crateAt(nx, ny);
      if (ci >= 0) { const bx = nx + dx, by = ny + dy; if (solid(bx, by) || crateAt(bx, by) >= 0 || grid[by][bx] === "D") return; hist.push([player.slice(), crates.map(c => c.slice())]); crates[ci] = [bx, by]; }
      else hist.push([player.slice(), crates.map(c => c.slice())]);
      player = [nx, ny]; moves++; hud();
      if (player[0] === exit[0] && player[1] === exit[1]) { won = true; msg(lv < LEVELS.length - 1 ? `Level ${lv + 1} cleared in ${moves} moves. Next level loads in a moment.` : `All levels cleared. Final level took ${moves} moves.`); if (lv < LEVELS.length - 1) setTimeout(() => load(lv + 1), 1500); }
      else if (open()) msg("Door open. Head for the exit.");
    }
    function undo() { const h = hist.pop(); if (!h) return; player = h[0]; crates = h[1]; moves = Math.max(0, moves - 1); won = false; hud(); }
    const keys = { arrowup: [0, -1], arrowdown: [0, 1], arrowleft: [-1, 0], arrowright: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
    S.wrap.addEventListener("keydown", e => { const k = keys[e.key.toLowerCase()]; if (k) { e.preventDefault(); move(...k); } else if (e.key.toLowerCase() === "z") undo(); else if (e.key.toLowerCase() === "r") load(lv); });
    S.renderer.domElement.addEventListener("pointerdown", () => S.wrap.focus());
    host.querySelectorAll(".pg-pad button").forEach(b => b.addEventListener("click", () => move(...b.dataset.d.split(",").map(Number))));
    host.querySelector("#pg-undo").addEventListener("click", undo); host.querySelector("#pg-rs").addEventListener("click", () => load(lv));
    host.querySelectorAll(".pg-levels .chip").forEach(b => b.addEventListener("click", () => load(+b.dataset.l)));
    S.onFrame((dt, t) => {
      const pl = meshes.player, [tx, tz] = P(...player);
      pl.position.x = lerp(pl.position.x, tx, 0.25); pl.position.z = lerp(pl.position.z, tz, 0.25); pl.position.y = 0.1 + Math.abs(Math.sin(t * 6)) * 0.05 + (won ? Math.abs(Math.sin(t * 10)) * 0.3 : 0);
      pl.rotation.y = lerp(pl.rotation.y, facing, 0.3);
      meshes.crates.forEach((m, i) => { const [cx, cz] = P(...crates[i]); m.position.x = lerp(m.position.x, cx, 0.3); m.position.z = lerp(m.position.z, cz, 0.3);
        const on = switches.some(s => s[0] === crates[i][0] && s[1] === crates[i][1]); m.children[0].material.color.setHex(on ? 0x3f7f74 : 0xb07a3c); });
      meshes.door.position.y = lerp(meshes.door.position.y, open() ? -0.45 : 0.45, 0.08);
      meshes.exit.rotation.z += dt;
    });
    load(lv);
    return S.dispose;
  };

  /* ================= Game assets 3D: voxel Gem Run ================= */
  D["game-assets"] = host => {
    host.innerHTML = `<div class="demo-bar"><strong class="demo-title">Gem Run 3D</strong><span class="pill" id="ga-score">Gems 0 of 8</span><span class="spacer"></span>
      <button class="btn small" type="button" id="ga-tod">Switch to night</button></div>
      <div id="ga-3d"></div>
      <div class="pg-pad" aria-label="Touch controls"><button type="button" data-d="0,-1" aria-label="Forward">▲</button><button type="button" data-d="-1,0" aria-label="Left">◀</button><button type="button" data-d="1,0" aria-label="Right">▶</button><button type="button" data-d="0,1" aria-label="Back">▼</button></div>
      <div class="ctl-row">${slider("ga-fps", "Walk cycle speed", 4, 24, 1, 12, " fps")}</div>
      <p class="demo-note">Click the scene, then use arrow keys or WASD to run and space to jump. The voxel character uses an 8 frame walk cycle at 12 fps, with colours from the project palette.</p>`;
    const S = K.stage(host.querySelector("#ga-3d"), { height: 460, cam: [0, 7, 10], target: [0, 0, 0], label: "Voxel world with a character collecting gems", focusable: true, hint: "Click, then arrow keys to run · space to jump", floor: false, bg: 0xbcd3e6, fogNear: 18, fogFar: 40, shadowSize: 14 });
    const fpsIn = bindOut(host, "ga-fps", " fps");
    const pal = { grass: 0x38b764, dirt: 0x7a5230, stone: 0x566c86, skin: 0xffcd75, shirt: 0x3b5dc9, pants: 0x1d2b53, gem: 0xc0304f, leaf: 0x257179, trunk: 0x5d3a22 };
    const hAt = (x, z) => Math.round(Math.sin(x * 0.35) * 0.8 + Math.cos(z * 0.3) * 0.8);
    const R0 = 12, cube = new T.BoxGeometry(1, 1, 1); let count = 0; const cells = [];
    for (let x = -R0; x <= R0; x++) for (let z = -R0; z <= R0; z++) if (x * x + z * z < R0 * R0) cells.push([x, z]);
    const grass = new T.InstancedMesh(cube, new T.MeshStandardMaterial({ color: pal.grass, roughness: 0.9 }), cells.length);
    const dirt = new T.InstancedMesh(cube, new T.MeshStandardMaterial({ color: pal.dirt, roughness: 1 }), cells.length);
    const m4 = new T.Matrix4();
    cells.forEach(([x, z], i) => { const h = hAt(x, z); m4.makeTranslation(x, h, z); grass.setMatrixAt(i, m4); m4.makeTranslation(x, h - 1, z); dirt.setMatrixAt(i, m4); });
    grass.receiveShadow = dirt.receiveShadow = true; grass.castShadow = true; S.scene.add(grass, dirt);
    [[5, -4], [-6, 3], [-3, -7], [7, 5], [0, 8]].forEach(([x, z]) => { const h = hAt(x, z); for (let k = 1; k <= 3; k++) { const t = K.mesh(cube, K.mat.paint(pal.trunk)); t.position.set(x, h + k, z); S.scene.add(t); } for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (let dy = 0; dy < 2; dy++) if (!(dy && (dx || dz) && Math.abs(dx) + Math.abs(dz) > 1)) { const l = K.mesh(cube, K.mat.paint(pal.leaf)); l.position.set(x + dx, h + 4 + dy, z + dz); S.scene.add(l); } });
    // character
    const hero = new T.Group(); const part = (w, h, d, c, y) => { const m = K.mesh(new T.BoxGeometry(w, h, d), K.mat.paint(c)); m.position.y = y; return m; };
    const head = part(0.5, 0.5, 0.5, pal.skin, 1.55); const torso = part(0.55, 0.65, 0.3, pal.shirt, 1.0);
    const eyeL = part(0.08, 0.08, 0.02, 0x1d2b53, 1.6); eyeL.position.set(-0.11, 1.6, 0.26); const eyeR = eyeL.clone(); eyeR.position.x = 0.11;
    const limb = (x, y, c, h) => { const pv = new T.Group(); pv.position.set(x, y, 0); const m = part(0.2, h, 0.22, c, -h / 2); pv.add(m); return pv; };
    const armL = limb(-0.38, 1.3, pal.skin, 0.6), armR = limb(0.38, 1.3, pal.skin, 0.6), legL = limb(-0.14, 0.68, pal.pants, 0.68), legR = limb(0.14, 0.68, pal.pants, 0.68);
    hero.add(head, torso, eyeL, eyeR, armL, armR, legL, legR); S.scene.add(hero);
    // gems
    const gems = []; const gemSpots = [[3, 2], [-4, -2], [6, -6], [-8, -4], [2, -9], [-2, 6], [8, 1], [-7, 7]];
    gemSpots.forEach(([x, z]) => { const g = new T.Mesh(new T.OctahedronGeometry(0.35), K.mat.glow(pal.gem)); g.position.set(x, hAt(x, z) + 1.2, z); g.castShadow = true; S.scene.add(g); const pl = new T.PointLight(pal.gem, 0, 4); g.add(pl); gems.push({ m: g, pl, got: false }); });
    const pos = new T.Vector3(0, hAt(0, 0) + 0.5, 0); let vy = 0, yaw = 0, phase = 0, score = 0, night = false;
    const keys = {};
    const kmap = { arrowup: "f", w: "f", arrowdown: "b", s: "b", arrowleft: "l", a: "l", arrowright: "r", d: "r" };
    S.wrap.addEventListener("keydown", e => { const k = kmap[e.key.toLowerCase()]; if (k) { keys[k] = true; e.preventDefault(); } if (e.key === " ") { e.preventDefault(); if (vy === 0) vy = 6.5; } });
    S.wrap.addEventListener("keyup", e => { const k = kmap[e.key.toLowerCase()]; if (k) keys[k] = false; });
    S.renderer.domElement.addEventListener("pointerdown", () => S.wrap.focus());
    host.querySelectorAll(".pg-pad button").forEach(b => { const [dx, dz] = b.dataset.d.split(",").map(Number), k = dz < 0 ? "f" : dz > 0 ? "b" : dx < 0 ? "l" : "r";
      b.addEventListener("pointerdown", e => { e.preventDefault(); keys[k] = true; }); ["pointerup", "pointerleave"].forEach(ev => b.addEventListener(ev, () => keys[k] = false)); });
    host.querySelector("#ga-tod").addEventListener("click", e => { night = !night; e.currentTarget.textContent = night ? "Switch to day" : "Switch to night"; S.scene.background.setHex(night ? 0x0b0f2e : 0xbcd3e6); S.scene.fog.color.setHex(night ? 0x0b0f2e : 0xbcd3e6); S.sun.intensity = night ? 0.15 : 1.25; gems.forEach(g => g.pl.intensity = night ? 2 : 0); });
    S.controls.enableRotate = true;
    S.onFrame((dt, t) => {
      let mx = 0, mz = 0; if (keys.f) mz -= 1; if (keys.b) mz += 1; if (keys.l) mx -= 1; if (keys.r) mx += 1;
      const moving = mx || mz;
      if (moving) { const len = Math.hypot(mx, mz); pos.x += mx / len * 4 * dt; pos.z += mz / len * 4 * dt; yaw = Math.atan2(mx, mz); const r = Math.hypot(pos.x, pos.z); if (r > R0 - 1.5) { pos.x *= (R0 - 1.5) / r; pos.z *= (R0 - 1.5) / r; } }
      const ground = hAt(Math.round(pos.x), Math.round(pos.z)) + 0.5;
      vy -= 18 * dt; pos.y += vy * dt; if (pos.y <= ground) { pos.y = ground; vy = 0; }
      hero.position.copy(pos); hero.rotation.y = lerp(hero.rotation.y, yaw, 0.2);
      phase += moving ? dt * +fpsIn.value / 8 * Math.PI * 2 : 0; const frame8 = Math.floor((phase / (Math.PI * 2)) * 8) % 8, sw = moving ? Math.sin(frame8 / 8 * Math.PI * 2) * 0.7 : 0;
      armL.rotation.x = sw; armR.rotation.x = -sw; legL.rotation.x = -sw; legR.rotation.x = sw;
      gems.forEach(g => { if (g.got) return; g.m.rotation.y += dt * 2; g.m.position.y += Math.sin(t * 3 + g.m.position.x) * 0.005;
        if (g.m.position.distanceTo(new T.Vector3(pos.x, pos.y + 0.8, pos.z)) < 1) { g.got = true; g.m.visible = false; score++; host.querySelector("#ga-score").textContent = score === 8 ? "All 8 gems collected" : `Gems ${score} of 8`; } });
      const camGoal = new T.Vector3(pos.x, pos.y + 5, pos.z + 8); S.camera.position.lerp(camGoal, 0.04); S.controls.target.lerp(new T.Vector3(pos.x, pos.y + 1, pos.z), 0.1);
    });
    return S.dispose;
  };

  /* ================= Rock CT 3D ================= */
  D["rock-imaging"] = host => {
    const N = 64, cores = [{ id: "RC-01", seed: 3, n: 350, por: 10.8 }, { id: "RC-02", seed: 11, n: 490, por: 14.2 }, { id: "RC-03", seed: 29, n: 630, por: 17.6 }];
    host.innerHTML = `<div class="demo-bar"><strong class="demo-title">3D CT volume viewer</strong><span class="spacer"></span>
      <div class="seg" role="group" aria-label="Sample">${cores.map((c, i) => `<button type="button" class="chip" data-i="${i}" aria-pressed="${i === 1}">${c.id}</button>`).join("")}</div></div>
      <div class="split3d"><div id="ri-3d"></div><div class="ri-side"><canvas id="ri-slice" width="256" height="256" class="demo-canvas sq" aria-label="Current CT slice"></canvas><div class="mm-read col" id="ri-read"></div></div></div>
      <div class="ctl-row">${slider("ri-z", "Cut plane", 1, N, 1, 32)}${slider("ri-th", "Pore threshold", 40, 140, 1, 92)}
      <label class="ctl check"><input type="checkbox" id="ri-shell" checked> <span>Solid shell</span></label></div>
      <p class="demo-note">The 3D view shows the segmented pore network inside a 10 mm cube, cut open at the plane you choose. The flat slice beside it is what 3D Slicer shows at that depth. Porosity is measured live at 20 µm voxels.</p>`;
    const S = K.stage(host.querySelector("#ri-3d"), { height: 440, cam: [7, 6, 8], target: [0, 2.5, 0], label: "3D pore network", clipping: true, autoRotate: true, shadowSize: 6 });
    const z = bindOut(host, "ri-z"), thr = bindOut(host, "ri-th"), shellOn = host.querySelector("#ri-shell");
    const SZ = 5, clip = new T.Plane(new T.Vector3(0, -1, 0), 2.5);
    const shellGeo = new T.BoxGeometry(SZ, SZ, SZ); const shell = new T.Mesh(shellGeo, new T.MeshStandardMaterial({ color: 0x8d929a, roughness: 0.9, transparent: true, opacity: 0.35, clippingPlanes: [clip], side: T.DoubleSide, depthWrite: false })); shell.position.y = SZ / 2; S.scene.add(shell);
    const shellE = K.edges(shellGeo, 0x9fb0cc, 0.6); shellE.position.y = SZ / 2; S.scene.add(shellE);
    const sliceCvs = host.querySelector("#ri-slice"), sctx = sliceCvs.getContext("2d");
    const texCvs = document.createElement("canvas"); texCvs.width = N; texCvs.height = N; const tctx = texCvs.getContext("2d");
    const tex = new T.CanvasTexture(texCvs); tex.magFilter = T.NearestFilter; tex.encoding = T.sRGBEncoding;
    const cut = new T.Mesh(new T.PlaneGeometry(SZ, SZ), new T.MeshBasicMaterial({ map: tex, side: T.DoubleSide })); cut.rotation.x = -Math.PI / 2; S.scene.add(cut);
    const cutE = K.edges(new T.PlaneGeometry(SZ, SZ), 0xd2601a, 1); cutE.rotation.x = -Math.PI / 2; S.scene.add(cutE);
    let vol, spheres = [], inst, cur = 1;
    function build(core) {
      let s = core.seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      vol = new Uint8Array(N * N * N); for (let i = 0; i < vol.length; i++) vol[i] = 150 + r() * 60;
      spheres = [];
      for (let k = 0; k < core.n; k++) { const cx = r() * N, cy = r() * N, cz = r() * N, rad = 1.2 + r() * 3.5; spheres.push([cx, cy, cz, rad]);
        for (let zz = Math.max(0, cz - rad | 0); zz < Math.min(N, cz + rad + 1); zz++) for (let y = Math.max(0, cy - rad | 0); y < Math.min(N, cy + rad + 1); y++) for (let x = Math.max(0, cx - rad | 0); x < Math.min(N, cx + rad + 1); x++) {
          const d = Math.hypot(x - cx, y - cy, zz - cz); if (d < rad) vol[(zz * N + y) * N + x] = 30 + r() * 50 + (d / rad) * 40; } }
      if (inst) { S.scene.remove(inst); inst.geometry.dispose(); }
      inst = new T.InstancedMesh(new T.SphereGeometry(1, 14, 10), new T.MeshStandardMaterial({ color: 0x3f7f74, emissive: 0x1f3f39, emissiveIntensity: 0.6, roughness: 0.3, clippingPlanes: [clip] }), spheres.length);
      const m = new T.Matrix4(), sc = SZ / N;
      spheres.forEach(([x, y, zz, rad], i) => { m.makeScale(rad * sc, rad * sc, rad * sc); m.setPosition(x * sc - SZ / 2, zz * sc, y * sc - SZ / 2); inst.setMatrixAt(i, m); });
      inst.castShadow = true; S.scene.add(inst);
    }
    function draw() {
      const zz = +z.value - 1, Th = +thr.value, img = tctx.createImageData(N, N); let pore = 0;
      for (let i = 0; i < N * N; i++) { const v = vol[zz * N * N + i]; if (v < Th) { pore++; img.data.set([46, 230, 197, 255], i * 4); } else img.data.set([v * 0.9, v * 0.9, v, 255], i * 4); }
      tctx.putImageData(img, 0, 0); tex.needsUpdate = true;
      sctx.imageSmoothingEnabled = false; sctx.drawImage(texCvs, 0, 0, 256, 256); sctx.strokeStyle = "#ff8a3d"; sctx.lineWidth = 3; sctx.strokeRect(1.5, 1.5, 253, 253);
      sctx.fillStyle = "#fff"; sctx.fillRect(12, 238, 54, 4); sctx.font = "11px sans-serif"; sctx.fillText("2 mm", 14, 232);
      const h = (zz + 0.5) / N * SZ; clip.constant = h; cut.position.y = h; cutE.position.y = h;
      let vp = 0, vt = 0; for (let i = 0; i < vol.length; i += 7) { vt++; if (vol[i] < Th) vp++; }
      host.querySelector("#ri-read").innerHTML = `<div><span>Sample</span><strong>${cores[cur].id}</strong></div><div><span>Cut depth</span><strong>${(h / SZ * 10).toFixed(2)} mm</strong></div><div><span>Slice porosity</span><strong>${(pore / (N * N) * 100).toFixed(1)} %</strong></div><div><span>Live stack porosity</span><strong>${(vp / vt * 100).toFixed(1)} %</strong></div><div><span>Reported porosity</span><strong>${cores[cur].por} %</strong></div><div><span>Voxel</span><strong>20 µm</strong></div>`;
    }
    host.querySelectorAll(".seg .chip").forEach(b => b.addEventListener("click", () => { cur = +b.dataset.i; host.querySelectorAll(".seg .chip").forEach(x => x.setAttribute("aria-pressed", String(x === b))); build(cores[cur]); draw(); }));
    [z, thr].forEach(i => i.addEventListener("input", draw)); shellOn.addEventListener("change", () => { shell.visible = shellOn.checked; });
    build(cores[cur]); draw();
    return S.dispose;
  };

  /* ================= Product video 3D ================= */
  D["product-video"] = host => {
    const DUR = 36, chapters = [[0, "Intro"], [6, "Step 1 Mount"], [14, "Step 2 Connect"], [22, "Step 3 Run"], [30, "Wrap"]];
    const titles = [["Setup and operation", "in under three minutes"], ["Mount", "Step 1 of 3"], ["Connect", "Step 2 of 3"], ["Run", "Step 3 of 3"], ["Ready to work", "See the full manual online"]];
    const caps = ["Here is how to set up the unit in three steps.", "Fix the base to the frame with four M8 screws.", "Connect the supply and the control cable.", "Press start and check the status light.", "That is it. Full manual on our website."];
    const shots = [[[9, 5, 9], [0, 1.5, 0]], [[6, 7, 6], [0, 1, 0]], [[-7, 3, 5], [1, 1.2, 0]], [[3.5, 2.4, 4], [0, 1.8, 0]], [[12, 6, -4], [0, 1.4, 0]]];
    host.innerHTML = `<div class="vp"><div id="vp-3d" class="vp-screen3"></div>
      <div class="vp-ctl"><button class="btn small" type="button" id="vp-play" aria-label="Play">▶ Play</button>
      <input type="range" id="vp-seek" min="0" max="${DUR}" step="0.1" value="0" aria-label="Seek"><span class="mono" id="vp-time">0:00 / 3:00</span>
      <label class="ctl check"><input type="checkbox" id="vp-cc" checked> <span>Captions</span></label></div>
      <div class="vp-ch">${chapters.map(([t, n]) => `<button type="button" class="chip" data-t="${t}">${n}</button>`).join("")}</div></div>
      <p class="demo-note">A condensed, playable 3D version of the cut with the same chapters, title cards, and captions. The timecode shows the position in the full three minute, 1080p H.264 edit. You can grab the camera at any time.</p>`;
    const S = K.stage(host.querySelector("#vp-3d"), { height: 420, cam: shots[0][0], target: shots[0][1], label: "3D product video", hint: "Press play · drag to look around", shadowSize: 8, bg: 0xe7e8e3 });
    const over = document.createElement("div"); over.className = "vp-over"; over.innerHTML = `<div class="vp-title"><strong></strong><span></span></div><div class="vp-cap"></div><div class="vp-badge">1080p · H.264</div>`; S.wrap.appendChild(over);
    const frame = K.mesh(new T.BoxGeometry(6, 0.3, 3.4), K.mat.paint(0x5d6b7c)); frame.position.y = 0.6; S.scene.add(frame);
    [[-2.7, -1.5], [2.7, -1.5], [-2.7, 1.5], [2.7, 1.5]].forEach(([x, z]) => { const l = K.mesh(new T.BoxGeometry(0.25, 0.6, 0.25), K.mat.dark()); l.position.set(x, 0.3, z); S.scene.add(l); });
    const unit = new T.Group(); const shellM = K.mesh(new T.BoxGeometry(4, 2.2, 2.6), K.mat.paint(0xe6e9ef)); shellM.position.y = 1.1; unit.add(shellM);
    const bezel = K.mesh(new T.CylinderGeometry(0.85, 0.85, 0.1, 48), K.mat.paint(0x0e7470)); bezel.rotation.x = Math.PI / 2; bezel.position.set(-0.5, 1.15, 1.31); unit.add(bezel);
    const fanG = new T.Group(); for (let i = 0; i < 6; i++) { const b = K.mesh(new T.BoxGeometry(0.16, 0.7, 0.04), K.mat.glow(0x3f7f74)); b.position.y = 0.35; const p = new T.Group(); p.rotation.z = i / 6 * Math.PI * 2; p.add(b); fanG.add(p); }
    fanG.position.set(-0.5, 1.15, 1.38); unit.add(fanG);
    const led = K.mesh(new T.SphereGeometry(0.12, 16, 12), K.mat.glow(0x55607a)); led.position.set(1.4, 1.7, 1.32); unit.add(led);
    const btn = K.mesh(new T.CylinderGeometry(0.2, 0.2, 0.12, 24), K.mat.paint(0xd2601a)); btn.rotation.x = Math.PI / 2; btn.position.set(1.4, 0.8, 1.33); unit.add(btn);
    S.scene.add(unit);
    const screws = [[-1.7, -1], [1.7, -1], [-1.7, 1], [1.7, 1]].map(([x, z]) => { const s = K.mesh(new T.CylinderGeometry(0.1, 0.1, 0.5, 12), K.mat.steel()); s.position.set(x, 3, z); S.scene.add(s); return s; });
    const cablePts = [new T.Vector3(2, 1, 0), new T.Vector3(3.2, 1, 0.2), new T.Vector3(3.8, 0.5, 1.2), new T.Vector3(4.2, 0.1, 2.6), new T.Vector3(5.5, 0.05, 3.2)];
    const cableCurve = new T.CatmullRomCurve3(cablePts); const cable = K.mesh(new T.TubeGeometry(cableCurve, 80, 0.08, 8), K.mat.paint(0xe8a33d)); S.scene.add(cable); const cableTotal = cable.geometry.index.count;
    const seek = host.querySelector("#vp-seek"), cc = host.querySelector("#vp-cc"), playB = host.querySelector("#vp-play");
    let t = 0, playing = false, userCam = false;
    const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    const setPlay = p => { playing = p; playB.textContent = p ? "❚❚ Pause" : "▶ Play"; playB.setAttribute("aria-label", p ? "Pause" : "Play"); if (p) userCam = false; };
    playB.addEventListener("click", () => { if (t >= DUR) t = 0; setPlay(!playing); });
    seek.addEventListener("input", () => { t = +seek.value; userCam = false; });
    host.querySelectorAll(".vp-ch .chip").forEach(b => b.addEventListener("click", () => { t = +b.dataset.t; setPlay(true); }));
    S.renderer.domElement.addEventListener("pointerdown", () => { userCam = true; });
    S.onFrame(dt => {
      if (playing) { t += dt; if (t >= DUR) { t = DUR; setPlay(false); } seek.value = t; }
      host.querySelector("#vp-time").textContent = `${fmt(t * 5)} / 3:00`;
      const ch = chapters.filter(c => c[0] <= t).length - 1, lt = t - chapters[ch][0];
      const drop = ch === 0 ? 1.6 : ch === 1 ? Math.max(0, 1.6 - lt * 0.8) : 0; unit.position.y = 0.75 + drop;
      screws.forEach((s, i) => { const k = ch === 1 ? Math.min(1, Math.max(0, (lt - 3 - i * 0.6) / 0.8)) : ch > 1 ? 1 : 0; s.position.y = 3 - k * 2.15; s.rotation.y += k < 1 && k > 0 ? dt * 20 : 0; s.visible = ch >= 1; });
      const ck = ch === 2 ? Math.min(1, lt / 5) : ch > 2 ? 1 : 0; cable.geometry.setDrawRange(0, Math.floor(cableTotal * ck / 3) * 3); cable.visible = ck > 0;
      const run = ch >= 3; fanG.rotation.z += run ? dt * 18 : 0; led.material.emissive.setHex(run ? (Math.floor(t * 2) % 2 ? 0x38d39f : 0x1f8f6a) : 0x55607a);
      btn.position.z = 1.33 - (ch === 3 && lt < 0.6 ? 0.06 : 0);
      if (!userCam) { const [cp, tg] = shots[ch], k = Math.min(1, lt / 2.5) * 0.05 + 0.01; S.camera.position.lerp(new T.Vector3(...cp), playing ? k : 0.2); S.controls.target.lerp(new T.Vector3(...tg), playing ? k : 0.2); }
      const ti = over.querySelector(".vp-title"); ti.querySelector("strong").textContent = titles[ch][0]; ti.querySelector("span").textContent = titles[ch][1]; ti.style.opacity = Math.min(1, lt * 2);
      const cap = over.querySelector(".vp-cap"); cap.textContent = caps[ch]; cap.hidden = !cc.checked;
      host.querySelectorAll(".vp-ch .chip").forEach((b, i) => b.setAttribute("aria-pressed", String(i === ch)));
    });
    return S.dispose;
  };

  /* ================= BOM records: table plus 3D model check ================= */
  const bom2d = D["bom-records"];
  D["bom-records"] = host => {
    const top = document.createElement("div"); top.className = "bom3d"; host.appendChild(top);
    const bottom = document.createElement("div"); bottom.className = "demo-sub"; host.appendChild(bottom);
    top.innerHTML = `<div class="demo-bar"><strong class="demo-title">CAD model tree</strong><span class="pill" id="bm-sel">Click a part or a BOM row</span><span class="spacer"></span><span class="legend-dot ok">In BOM</span><span class="legend-dot bad">Issue</span></div><div id="bm-3d"></div>`;
    const S = K.stage(top.querySelector("#bm-3d"), { height: 380, cam: [15, 12, 13], target: [0, 3, -2], label: "3D model used for the BOM cross check", autoRotate: true, shadowSize: 14 });
    const M = buildMount(S.scene, { guard: true });
    const lift = { base: 0, spacer: 1, bracket: 2.2, screw: 6, motor: 4.2, cover: 8.5, guard: 3 };
    Object.entries(M.parts).forEach(([id, g]) => { g.position.y += (lift[id] || 0) * 0.6; }); M.setBelt(9);
    const map = { "MM-100": "base", "MM-110": "bracket", "MM-120": "spacer", "MM-130": "cover", "ISO 4762-M8x30": "screw", "ISO 7089-M8": "screw", "MM-140": "guard", "MOTOR-A": "motor" };
    const names = { base: "Base plate MM-100", bracket: "Bracket MM-110", spacer: "Spacer MM-120", cover: "Cover MM-130", screw: "Fasteners ISO 4762 and 7089", guard: "Belt guard MM-140", motor: "Drive motor MOTOR-A" };
    const cleanup2d = bom2d(bottom);
    let sel = null, bad = new Set();
    function refreshBad() { bad = new Set(); bottom.querySelectorAll("#bm-issues li span").forEach(s => { const pn = Object.keys(map).find(k => s.textContent.startsWith(k + " ")); if (pn) bad.add(map[pn]); }); }
    new MutationObserver(refreshBad).observe(bottom, { childList: true, subtree: true });
    function select(id) { sel = id; top.querySelector("#bm-sel").textContent = id ? names[id] : "Click a part or a BOM row"; S.controls.autoRotate = !id; bottom.querySelectorAll("#bm-t tbody tr").forEach(tr => tr.classList.toggle("hl", !!id && map[tr.children[0].textContent] === id)); }
    S.renderer.domElement.addEventListener("click", e => { const h = S.pick(e, Object.values(M.parts)); select(h.length ? h[0].object.userData.part : null); });
    bottom.addEventListener("click", e => { const tr = e.target.closest("#bm-t tbody tr"); if (tr && e.target.tagName !== "INPUT") select(map[tr.children[0].textContent] || null); });
    S.onFrame((dt, t) => { M.pulley.rotation.x += dt * 4; Object.entries(M.parts).forEach(([id, g]) => setGlow(g, bad.has(id) ? 0xff3b3b : 0x3f7f74, bad.has(id) ? 0.35 + Math.sin(t * 5) * 0.25 : id === sel ? 0.6 : 0)); });
    return () => { S.dispose(); cleanup2d && cleanup2d(); };
  };
})();
