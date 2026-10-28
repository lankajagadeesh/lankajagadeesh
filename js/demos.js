/* Interactive work samples. Each demo mounts into a container and returns a cleanup function. */
(function () {
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = (tag, attrs = {}, html = "") => { const e = document.createElement(tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); e.innerHTML = html; return e; };
  function canvas(host, w, h, label) {
    const c = el("canvas", { width: w * 2, height: h * 2, role: "img", "aria-label": label, class: "demo-canvas" });
    c.style.aspectRatio = `${w} / ${h}`;
    host.appendChild(c);
    const ctx = c.getContext("2d"); ctx.scale(2, 2);
    return { c, ctx, w, h };
  }
  function loop(fn) {
    let id, last = performance.now(), on = true;
    const tick = t => { if (!on) return; const dt = Math.min(0.05, (t - last) / 1000); last = t; fn(dt, t / 1000); id = requestAnimationFrame(tick); };
    id = requestAnimationFrame(tick);
    return () => { on = false; cancelAnimationFrame(id); };
  }
  const slider = (id, label, min, max, step, val, unit = "") =>
    `<label class="ctl" for="${id}"><span>${label} <output id="${id}-o">${val}${unit}</output></span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
  const bindOut = (root, id, unit = "", fmt = v => v) => { const i = root.querySelector("#" + id), o = root.querySelector("#" + id + "-o"); const u = () => o.textContent = fmt(+i.value) + unit; i.addEventListener("input", u); u(); return i; };
  const heatRamp = [[43,76,154],[47,134,192],[51,176,168],[140,196,106],[230,200,74],[236,138,58],[214,69,58]];
  function heat(v) { v = Math.max(0, Math.min(1, v)) * (heatRamp.length - 1); const i = Math.floor(v), f = v - i, a = heatRamp[i], b = heatRamp[Math.min(i + 1, heatRamp.length - 1)]; return [0,1,2].map(k => Math.round(a[k] + (b[k] - a[k]) * f)); }
  const rgb = a => `rgb(${a[0]},${a[1]},${a[2]})`;

  const D = {};

  /* ================= Puzzle game (playable) ================= */
  D["puzzle-game"] = host => {
    const LEVELS = [
      ["#########","#P..C..S#","#.......#","#######D#","#E......#","#########"],
      ["##########","#P.......#","#..C...S.#","#........#","#..C...S.#","#........#","#####D####","#E.......#","##########"],
      ["#########","#...P...#","#.#.C.#.#","#.......#","#.#...#.#","#...S...#","###D#####","#E......#","#########"],
      ["#########","#P......#","#.C...C.#","#.......#","#.......#","#.S...S.#","####D####","#E......#","#########"]
    ];
    host.innerHTML = `<div class="demo-bar"><strong class="demo-title">Crate Switch</strong><span class="pill" id="pg-lv"></span><span class="pill" id="pg-mv"></span>
      <span class="spacer"></span><button class="btn small" id="pg-undo" type="button">Undo (Z)</button><button class="btn small" id="pg-rs" type="button">Restart (R)</button></div>
      <div class="pg-stage" tabindex="0" id="pg-stage" aria-label="Puzzle game. Use arrow keys or WASD to move."></div>
      <div class="pg-pad" aria-label="Touch controls"><button type="button" data-d="0,-1" aria-label="Up">▲</button><button type="button" data-d="-1,0" aria-label="Left">◀</button><button type="button" data-d="1,0" aria-label="Right">▶</button><button type="button" data-d="0,1" aria-label="Down">▼</button></div>
      <p class="demo-note" id="pg-msg" aria-live="polite">Click the board, then use arrow keys or WASD. Push every crate onto a switch to open the door, then reach the exit. This web version has 4 of the 6 levels.</p>
      <div class="pg-levels">${LEVELS.map((_, i) => `<button type="button" class="chip" data-l="${i}">Level ${i + 1}</button>`).join("")}</div>`;
    const stage = host.querySelector("#pg-stage");
    const { c, ctx } = canvas(stage, 480, 320, "Puzzle board");
    let lv = 0, grid, player, crates, switches, door, exit, moves, hist, won;
    try { lv = +sessionStorage.getItem("pg-lv") || 0; } catch (e) {}
    function load(i) {
      lv = i; try { sessionStorage.setItem("pg-lv", i); } catch (e) {}
      const L = LEVELS[i]; grid = L.map(r => [...r]); crates = []; switches = []; moves = 0; hist = []; won = false;
      grid.forEach((r, y) => r.forEach((ch, x) => {
        if (ch === "P") player = [x, y]; if (ch === "C") crates.push([x, y]); if (ch === "S") switches.push([x, y]);
        if (ch === "D") door = [x, y]; if (ch === "E") exit = [x, y]; if ("PCSE".includes(ch)) grid[y][x] = ".";
      }));
      host.querySelectorAll(".pg-levels .chip").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.l === lv)));
      msg("Push every crate onto a switch to open the door, then reach the exit.");
      draw();
    }
    const msg = t => host.querySelector("#pg-msg").textContent = t;
    const crateAt = (x, y) => crates.findIndex(c => c[0] === x && c[1] === y);
    const open = () => switches.every(s => crateAt(s[0], s[1]) >= 0);
    const solid = (x, y) => grid[y][x] === "#" || (grid[y][x] === "D" && !open());
    function move(dx, dy) {
      if (won) return;
      const nx = player[0] + dx, ny = player[1] + dy;
      if (solid(nx, ny)) return;
      const ci = crateAt(nx, ny);
      if (ci >= 0) { const bx = nx + dx, by = ny + dy; if (solid(bx, by) || crateAt(bx, by) >= 0 || grid[by][bx] === "D") return;
        hist.push([player.slice(), crates.map(c => c.slice())]); crates[ci] = [bx, by]; }
      else hist.push([player.slice(), crates.map(c => c.slice())]);
      player = [nx, ny]; moves++;
      if (player[0] === exit[0] && player[1] === exit[1]) { won = true; msg(lv < LEVELS.length - 1 ? `Level ${lv + 1} cleared in ${moves} moves. Next level loads in a moment.` : `All levels cleared. Final level took ${moves} moves.`); if (lv < LEVELS.length - 1) setTimeout(() => load(lv + 1), 1400); }
      else if (open()) msg("Door open. Head for the exit.");
      draw();
    }
    function undo() { const h = hist.pop(); if (!h) return; player = h[0]; crates = h[1]; moves = Math.max(0, moves - 1); won = false; draw(); }
    function draw() {
      host.querySelector("#pg-lv").textContent = `Level ${lv + 1} of ${LEVELS.length}`;
      host.querySelector("#pg-mv").textContent = `${moves} moves`;
      const rows = grid.length, cols = grid[0].length, s = Math.min(480 / cols, 320 / rows), ox = (480 - cols * s) / 2, oy = (320 - rows * s) / 2;
      const ink = css("--ink"), card = css("--card"), p2 = css("--paper-2"), teal = css("--teal"), warn = css("--warn"), paper = css("--paper");
      ctx.fillStyle = paper; ctx.fillRect(0, 0, 480, 320);
      grid.forEach((r, y) => r.forEach((ch, x) => {
        const X = ox + x * s, Y = oy + y * s;
        ctx.fillStyle = ch === "#" ? ink : card; ctx.fillRect(X, Y, s, s);
        if (ch !== "#") { ctx.strokeStyle = p2; ctx.lineWidth = 1; ctx.strokeRect(X + .5, Y + .5, s - 1, s - 1); }
        if (ch === "D") { ctx.fillStyle = open() ? p2 : warn; ctx.fillRect(X + s * .3, Y + 2, s * .4, s - 4); }
      }));
      switches.forEach(([x, y]) => { ctx.strokeStyle = teal; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ox + x * s + s / 2, oy + y * s + s / 2, s * .28, 0, 7); ctx.stroke(); });
      { const X = ox + exit[0] * s, Y = oy + exit[1] * s; ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.strokeRect(X + s * .18, Y + s * .18, s * .64, s * .64); ctx.fillStyle = ink; ctx.font = `600 ${s * .4}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("E", X + s / 2, Y + s / 2 + 1); }
      crates.forEach(([x, y]) => { const X = ox + x * s + s * .12, Y = oy + y * s + s * .12, w = s * .76, on = switches.some(q => q[0] === x && q[1] === y);
        ctx.fillStyle = on ? teal : "#b07a3c"; ctx.fillRect(X, Y, w, w); ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 2; ctx.strokeRect(X, Y, w, w);
        ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X + w, Y + w); ctx.moveTo(X + w, Y); ctx.lineTo(X, Y + w); ctx.stroke(); });
      const px = ox + player[0] * s + s / 2, py = oy + player[1] * s + s / 2;
      ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(px, py, s * .32, 0, 7); ctx.fill();
      ctx.fillStyle = card; ctx.beginPath(); ctx.arc(px - s * .1, py - s * .06, s * .06, 0, 7); ctx.arc(px + s * .1, py - s * .06, s * .06, 0, 7); ctx.fill();
    }
    const keys = { ArrowUp: [0,-1], ArrowDown: [0,1], ArrowLeft: [-1,0], ArrowRight: [1,0], w: [0,-1], s: [0,1], a: [-1,0], d: [1,0] };
    const onKey = e => { const k = keys[e.key] || keys[e.key.toLowerCase?.()]; if (k) { e.preventDefault(); move(...k); } else if (e.key.toLowerCase() === "z") undo(); else if (e.key.toLowerCase() === "r") load(lv); };
    stage.addEventListener("keydown", onKey);
    c.addEventListener("click", () => stage.focus());
    host.querySelectorAll(".pg-pad button").forEach(b => b.addEventListener("click", () => move(...b.dataset.d.split(",").map(Number))));
    host.querySelector("#pg-undo").addEventListener("click", undo);
    host.querySelector("#pg-rs").addEventListener("click", () => load(lv));
    host.querySelectorAll(".pg-levels .chip").forEach(b => b.addEventListener("click", () => load(+b.dataset.l)));
    let sx, sy; c.addEventListener("touchstart", e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    c.addEventListener("touchend", e => { const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) Math.abs(dx) > Math.abs(dy) ? move(Math.sign(dx), 0) : move(0, Math.sign(dy)); });
    load(Math.min(lv, LEVELS.length - 1));
    return () => {};
  };

  /* ================= Game assets: walkable sprite scene ================= */
  D["game-assets"] = host => {
    const pal = ["#1d2b53","#29366f","#3b5dc9","#41a6f6","#73eff7","#38b764","#a7f070","#257179","#ffcd75","#ef7d57","#b13e53","#5d275d","#f4f4f4","#94b0c2","#566c86","#333c57"];
    host.innerHTML = `<div class="demo-bar"><strong class="demo-title">Gem Run</strong><span class="pill" id="ga-score">Gems 0 of 6</span><span class="spacer"></span>
      <button class="btn small" type="button" id="ga-tod">Switch to night</button><button class="btn small" type="button" id="ga-grid" aria-pressed="false">Show sprite sheet</button></div>
      <div class="pg-stage" tabindex="0" id="ga-stage" aria-label="Sprite scene. Left and right arrows walk, up or space jumps."></div>
      <div class="pg-pad two"><button type="button" data-k="l" aria-label="Walk left">◀</button><button type="button" data-k="j" aria-label="Jump">⤒</button><button type="button" data-k="r" aria-label="Walk right">▶</button></div>
      <div class="ctl-row">${slider("ga-fps", "Animation speed", 4, 24, 1, 12, " fps")}</div>
      <p class="demo-note">Arrow keys or A and D to walk, up or space to jump. The character uses the 8 frame walk cycle at 12 fps, drawn from the project palette.</p>`;
    const stage = host.querySelector("#ga-stage");
    const { c, ctx } = canvas(stage, 480, 240, "Pixel scene with walking character");
    const fpsIn = bindOut(host, "ga-fps", " fps");
    let night = false, showSheet = false, x = 40, y = 0, vy = 0, dir = 1, frame = 0, ft = 0, keys = {}, score = 0;
    const ground = 196;
    let gems = [120, 190, 250, 320, 380, 440].map((gx, i) => ({ x: gx, y: ground - 40 - (i % 2) * 34, got: false }));
    const P = 3; // pixel size
    const body = [[3,0],[4,0],[2,1],[3,1],[4,1],[5,1],[3,2],[4,2],[2,3],[3,3],[4,3],[5,3],[3,4],[4,4]];
    function sprite(X, Y, f, flip) {
      const px = (i, j, col) => { const ii = flip ? 7 - i : i; ctx.fillStyle = col; ctx.fillRect(X + ii * P * 1.33, Y + j * P * 1.33, P * 1.33, P * 1.33); };
      body.forEach(([i, j]) => px(i, j, j < 2 ? pal[8] : pal[2]));
      const legs = [[[3,5],[4,5],[3,6],[4,6]],[[3,5],[4,5],[2,6],[5,6]],[[3,5],[4,5],[2,6],[4,6]],[[3,5],[4,5],[3,6],[5,6]]][f % 4];
      legs.forEach(([i, j]) => px(i, j, pal[0]));
      px(4, 1, pal[0]); px(f % 2 ? 1 : 6, 3, pal[8]);
    }
    const onKey = (e, v) => { const k = e.key.toLowerCase(); if (["arrowleft","a"].includes(k)) keys.l = v; else if (["arrowright","d"].includes(k)) keys.r = v; else if (["arrowup","w"," "].includes(k)) { if (v && y === 0) vy = 300; } else return; e.preventDefault(); };
    stage.addEventListener("keydown", e => onKey(e, true)); stage.addEventListener("keyup", e => onKey(e, false));
    c.addEventListener("click", () => stage.focus());
    host.querySelectorAll(".pg-pad button").forEach(b => {
      const k = b.dataset.k;
      const down = e => { e.preventDefault(); if (k === "j") { if (y === 0) vy = 300; } else keys[k] = true; };
      const up = () => { if (k !== "j") keys[k] = false; };
      b.addEventListener("pointerdown", down); b.addEventListener("pointerup", up); b.addEventListener("pointerleave", up);
    });
    host.querySelector("#ga-tod").addEventListener("click", e => { night = !night; e.currentTarget.textContent = night ? "Switch to day" : "Switch to night"; });
    host.querySelector("#ga-grid").addEventListener("click", e => { showSheet = !showSheet; e.currentTarget.setAttribute("aria-pressed", String(showSheet)); e.currentTarget.textContent = showSheet ? "Hide sprite sheet" : "Show sprite sheet"; });
    const stop = loop((dt, t) => {
      const sp = 110; let moving = false;
      if (keys.l) { x -= sp * dt; dir = -1; moving = true; } if (keys.r) { x += sp * dt; dir = 1; moving = true; }
      x = Math.max(4, Math.min(452, x)); vy -= 800 * dt; y = Math.max(0, y + vy * dt); if (y === 0) vy = Math.max(0, vy);
      ft += dt; if (moving && ft > 1 / +fpsIn.value) { frame = (frame + 1) % 8; ft = 0; } if (!moving) frame = 0;
      // sky
      const g = ctx.createLinearGradient(0, 0, 0, 240); g.addColorStop(0, night ? pal[0] : pal[3]); g.addColorStop(1, night ? pal[11] : pal[4]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, 480, 240);
      ctx.fillStyle = night ? pal[12] : pal[8]; ctx.beginPath(); ctx.arc(400, 46, 18, 0, 7); ctx.fill();
      if (night) { for (let i = 0; i < 30; i++) { ctx.fillStyle = pal[12]; ctx.fillRect((i * 97) % 480, (i * 53) % 120, 2, 2); } }
      // hills
      ctx.fillStyle = night ? pal[15] : pal[7]; ctx.beginPath(); ctx.moveTo(0, ground);
      for (let i = 0; i <= 480; i += 8) ctx.lineTo(i, ground - 40 - Math.sin(i / 60) * 18); ctx.lineTo(480, ground); ctx.fill();
      // ground tiles
      for (let i = 0; i < 480; i += 16) { ctx.fillStyle = night ? pal[14] : pal[5]; ctx.fillRect(i, ground, 16, 6); ctx.fillStyle = night ? pal[15] : "#7a5230"; ctx.fillRect(i, ground + 6, 16, 50); ctx.fillStyle = "rgba(0,0,0,.15)"; ctx.fillRect(i + 15, ground + 6, 1, 50); }
      // gems
      gems.forEach(gm => { if (gm.got) return; const bob = Math.sin(t * 3 + gm.x) * 3;
        ctx.fillStyle = pal[10]; ctx.beginPath(); ctx.moveTo(gm.x, gm.y + bob - 8); ctx.lineTo(gm.x + 7, gm.y + bob); ctx.lineTo(gm.x, gm.y + bob + 8); ctx.lineTo(gm.x - 7, gm.y + bob); ctx.fill();
        ctx.fillStyle = pal[12]; ctx.fillRect(gm.x - 2, gm.y + bob - 4, 2, 2);
        if (Math.abs(x + 16 - gm.x) < 14 && Math.abs(ground - 30 - y - gm.y) < 22) { gm.got = true; score++; host.querySelector("#ga-score").textContent = `Gems ${score} of 6`; } });
      if (score === 6) { ctx.fillStyle = "rgba(20,33,61,.75)"; ctx.fillRect(140, 70, 200, 50); ctx.fillStyle = pal[12]; ctx.font = "600 16px sans-serif"; ctx.textAlign = "center"; ctx.fillText("All gems collected", 240, 100); }
      sprite(x, ground - 30 - y, frame, dir < 0);
      if (showSheet) {
        ctx.fillStyle = "rgba(244,244,244,.92)"; ctx.fillRect(8, 8, 8 * 38 + 8, 52);
        for (let f = 0; f < 8; f++) { ctx.strokeStyle = f === frame ? pal[10] : pal[13]; ctx.lineWidth = 2; ctx.strokeRect(12 + f * 38, 12, 34, 44); sprite(14 + f * 38, 16, f, false); }
      }
    });
    return stop;
  };

  /* ================= Motor mount: explode and adjust ================= */
  D["motor-mount"] = host => {
    const parts = [
      ["1","MM-100","Base plate","A36, 10 mm","1","base"],["2","MM-110","Bracket, slotted","A36, 8 mm","2","bracket"],["3","MM-120","Spacer","Al 6061","4","spacer"],
      ["4","MM-130","Cover","Polycarbonate","1","cover"],["5","ISO 4762","Socket cap screw M8×30","8.8 zinc","8","screw"],["6","MOTOR","Drive motor (supplier STEP)","Purchased","1","motor"]];
    host.innerHTML = `<div class="demo-bar"><strong class="demo-title">Assembly viewer</strong><span class="spacer"></span>
      <button class="btn small" type="button" id="mm-cover" aria-pressed="true">Hide cover</button><button class="btn small" type="button" id="mm-anim">Play assembly</button></div>
      <div class="mm-wrap"><div class="mm-svg" id="mm-svg"></div>
      <div class="mm-side"><div class="ctl-row col">${slider("mm-ex", "Explode", 0, 100, 1, 0, " %")}${slider("mm-slot", "Slot position", 0, 30, 0.5, 9, " mm")}</div>
      <div class="mm-read" id="mm-read"></div>
      <table class="mini" id="mm-bom"><thead><tr><th>Item</th><th>Description</th><th>Qty</th></tr></thead><tbody>${parts.map(p => `<tr data-p="${p[5]}" tabindex="0"><td>${p[0]}</td><td>${p[2]}<small>${p[1]} · ${p[3]}</small></td><td>${p[4]}</td></tr>`).join("")}</tbody></table></div></div>
      <p class="demo-note">Drag the sliders. Hover a part or a BOM row to highlight it in both places. Moving the motor along the slots changes belt centre distance and tension.</p>`;
    const svgHost = host.querySelector("#mm-svg"), ex = bindOut(host, "mm-ex", " %"), slot = bindOut(host, "mm-slot", " mm");
    let cover = true, hl = null;
    function render() {
      const e = +ex.value / 100, s = +slot.value, mx = s * 2;
      const off = k => e * k * 40;
      const tension = Math.round(120 + s * 9), centre = (180 + s).toFixed(1);
      const g = (id, body) => `<g data-p="${id}" class="mm-part ${hl === id ? "hl" : ""}">${body}</g>`;
      svgHost.innerHTML = `<svg viewBox="0 0 520 330" role="img" aria-label="Motor mount assembly">
        ${g("base", `<rect x="40" y="${250 + off(1)}" width="320" height="22" class="pt"/><rect x="40" y="${272 + off(1)}" width="320" height="8" class="pt2"/>`)}
        ${g("spacer", [70, 130, 270, 330].map(x => `<rect x="${x - 8}" y="${236 + off(0.5)}" width="16" height="14" class="ac-fill"/>`).join(""))}
        ${g("bracket", [100, 300].map(x => `<rect x="${x - 22}" y="${170 - off(0.2)}" width="44" height="66" class="pt2"/><rect x="${x - 16}" y="${206 - off(.2)}" width="32" height="10" rx="5" class="slot"/><circle cx="${x - 12 + s * 0.8}" cy="${211 - off(.2)}" r="3.5" class="ink-fill"/>`).join(""))}
        ${g("motor", `<rect x="${110 + mx}" y="${100 - off(1.3)}" width="180" height="70" rx="10" class="pt"/>${[112, 128, 144, 160].map(y => `<line x1="${120 + mx}" y1="${y - off(1.3)}" x2="${280 + mx}" y2="${y - off(1.3)}" class="ln thin"/>`).join("")}<rect x="${290 + mx}" y="${128 - off(1.3)}" width="40" height="12" class="ink-fill"/><circle cx="${336 + mx}" cy="${134 - off(1.3)}" r="14" class="pt2"/>`)}
        ${g("screw", [100, 300].map(x => `<rect x="${x - 12 + s * 0.8 - 4}" y="${150 - off(2.2)}" width="8" height="${22}" class="ink-fill"/><rect x="${x - 12 + s * 0.8 - 7}" y="${146 - off(2.2)}" width="14" height="6" class="ink-fill"/>`).join(""))}
        <circle cx="470" cy="134" r="22" class="pt2"/><text x="470" y="176" class="tx sm" text-anchor="middle">Driven pulley</text>
        <path d="M${336 + mx} ${120 - off(1.3)} L470 112 M${336 + mx} ${148 - off(1.3)} Q${(400 + mx / 2)} ${156 - off(1.3) + (30 - s) * 0.8} 470 156" class="belt"/>
        ${cover ? g("cover", `<rect x="${100 + mx}" y="${70 - off(3)}" width="200" height="${110}" rx="14" class="cover"/>`) : ""}
      </svg>`;
      host.querySelector("#mm-read").innerHTML = `<div><span>Belt centre distance</span><strong>${centre} mm</strong></div><div><span>Static belt tension</span><strong>${tension} N</strong></div><div><span>Slot travel used</span><strong>${Math.round(s / 30 * 100)} %</strong></div>`;
      host.querySelectorAll("#mm-bom tr[data-p]").forEach(r => r.classList.toggle("hl", r.dataset.p === hl));
    }
    const setHl = id => { if (hl !== id) { hl = id; render(); } };
    svgHost.addEventListener("pointerover", e => { const p = e.target.closest("[data-p]"); setHl(p ? p.dataset.p : null); });
    svgHost.addEventListener("pointerleave", () => setHl(null));
    host.querySelectorAll("#mm-bom tr[data-p]").forEach(r => { ["pointerenter", "focus"].forEach(ev => r.addEventListener(ev, () => setHl(r.dataset.p))); r.addEventListener("pointerleave", () => setHl(null)); r.addEventListener("blur", () => setHl(null)); });
    ex.addEventListener("input", render); slot.addEventListener("input", render);
    host.querySelector("#mm-cover").addEventListener("click", e => { cover = !cover; e.currentTarget.setAttribute("aria-pressed", String(cover)); e.currentTarget.textContent = cover ? "Hide cover" : "Show cover"; render(); });
    let stopAnim = null;
    host.querySelector("#mm-anim").addEventListener("click", () => {
      if (stopAnim) stopAnim(); let tt = 0; ex.value = 100; render();
      if (reduced()) { ex.value = 0; ex.dispatchEvent(new Event("input")); return; }
      stopAnim = loop(dt => { tt += dt; ex.value = Math.max(0, 100 - tt * 50); ex.dispatchEvent(new Event("input")); if (tt > 2) { stopAnim(); stopAnim = null; } });
    });
    render();
    return () => stopAnim && stopAnim();
  };

  /* ================= Bracket FEA: live hand check and mode shape ================= */
  D["bracket-fea"] = host => {
    host.innerHTML = `<div class="demo-bar"><strong class="demo-title">Bracket hand check</strong><span class="spacer"></span>
      <div class="seg" role="group" aria-label="View"><button type="button" class="chip" data-v="stress" aria-pressed="true">Stress</button><button type="button" class="chip" data-v="mode" aria-pressed="false">Mode 1</button></div></div>
      <div class="pg-stage" id="fe-stage"></div>
      <div class="ctl-row">${slider("fe-f", "Load F", 100, 2000, 50, 500, " N")}${slider("fe-t", "Flange thickness", 4, 14, 0.5, 8, " mm")}${slider("fe-l", "Arm length", 60, 180, 5, 80, " mm")}</div>
      <div class="mm-read wide" id="fe-read"></div>
      <p class="demo-note">A cantilever hand check that I use alongside the full model. Bending stress σ = 6FL / (b t²), tip deflection δ = FL³ / (3EI), first mode from Euler Bernoulli beam theory. ASTM A36, E = 200 GPa, yield 250 MPa, flange width 40 mm, 8 kg motor mass at the tip, motor excitation 25 Hz.</p>`;
    const { c, ctx } = canvas(host.querySelector("#fe-stage"), 520, 240, "Bracket stress or mode shape");
    const F = bindOut(host, "fe-f", " N"), T = bindOut(host, "fe-t", " mm"), Lr = bindOut(host, "fe-l", " mm");
    let view = "stress";
    host.querySelectorAll(".seg .chip").forEach(b => b.addEventListener("click", () => { view = b.dataset.v; host.querySelectorAll(".seg .chip").forEach(x => x.setAttribute("aria-pressed", String(x === b))); }));
    const stop = loop((dt, time) => {
      const f = +F.value, t = +T.value / 1000, L = +Lr.value / 1000, b = 0.04, E = 200e9, I = b * t ** 3 / 12, rho = 7850, A = b * t, mTip = 8;
      const sig = 6 * f * L / (b * t * t) / 1e6, delta = f * L ** 3 / (3 * E * I) * 1000, fos = 250 / sig;
      const k = 3 * E * I / L ** 3, mEff = mTip + 0.2357 * rho * A * L, fn = Math.sqrt(k / mEff) / (2 * Math.PI);
      host.querySelector("#fe-read").innerHTML = `<div><span>Max bending stress</span><strong>${sig.toFixed(0)} MPa</strong></div><div><span>Factor of safety</span><strong class="${fos < 1.5 ? "bad" : "good"}">${fos.toFixed(2)}</strong></div><div><span>Tip deflection</span><strong>${delta.toFixed(2)} mm</strong></div><div><span>First natural frequency</span><strong>${fn.toFixed(0)} Hz</strong></div><div><span>Clear of 25 Hz excitation</span><strong class="${fn > 2 * 25 ? "good" : "bad"}">${fn > 50 ? "Yes" : "No"}</strong></div>`;
      const paper = css("--paper"), ink = css("--ink"), teal = css("--teal");
      ctx.fillStyle = paper; ctx.fillRect(0, 0, 520, 240);
      const x0 = 70, len = (L * 1000) * 2.2, hgt = Math.max(8, t * 1000 * 3), y0 = 110;
      // wall
      ctx.fillStyle = ink; ctx.fillRect(x0 - 24, 30, 24, 170);
      for (let i = 34; i < 200; i += 12) { ctx.strokeStyle = paper; ctx.beginPath(); ctx.moveTo(x0 - 24, i + 8); ctx.lineTo(x0 - 14, i); ctx.stroke(); }
      const amp = view === "mode" ? (reduced() ? 18 : Math.sin(time * 6) * 22) : Math.min(40, delta * 6);
      const shape = s => view === "mode" ? amp * (s * s * (3 - s) / 2) : amp * (s * s * (3 - s) / 2);
      const N = 60;
      for (let i = 0; i < N; i++) {
        const s0 = i / N, s1 = (i + 1) / N, xa = x0 + s0 * len, xb = x0 + s1 * len;
        const v = view === "stress" ? Math.min(1, (sig / 250) * (1 - s0)) : 0.35 + 0.65 * Math.abs(Math.sin(time * 6)) * s0;
        for (let j = 0; j < 6; j++) {
          const fy = j / 6, fiber = Math.abs(fy + 1 / 12 - .5) * 2;
          ctx.fillStyle = rgb(heat(view === "stress" ? v * fiber : v));
          ctx.beginPath();
          ctx.moveTo(xa, y0 - hgt / 2 + fy * hgt + shape(s0)); ctx.lineTo(xb, y0 - hgt / 2 + fy * hgt + shape(s1));
          ctx.lineTo(xb, y0 - hgt / 2 + (fy + 1 / 6) * hgt + shape(s1) + .5); ctx.lineTo(xa, y0 - hgt / 2 + (fy + 1 / 6) * hgt + shape(s0) + .5); ctx.fill();
        }
      }
      ctx.strokeStyle = ink; ctx.setLineDash([4, 4]); ctx.strokeRect(x0, y0 - hgt / 2, len, hgt); ctx.setLineDash([]);
      // load arrow
      const tipY = y0 - hgt / 2 + shape(1);
      if (view === "stress") { ctx.strokeStyle = teal; ctx.fillStyle = teal; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + len - 6, tipY - 60); ctx.lineTo(x0 + len - 6, tipY - 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x0 + len - 13, tipY - 16); ctx.lineTo(x0 + len - 6, tipY - 4); ctx.lineTo(x0 + len + 1, tipY - 16); ctx.fill(); ctx.lineWidth = 1;
        ctx.font = "600 12px sans-serif"; ctx.textAlign = "left"; ctx.fillText(`F = ${f} N`, x0 + len + 6, tipY - 50); }
      ctx.fillStyle = ink; ctx.font = "11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(view === "stress" ? "Deflection exaggerated for display" : `Mode 1 at ${fn.toFixed(0)} Hz, animation slowed`, 70, 224);
      // legend
      for (let i = 0; i < 7; i++) { ctx.fillStyle = rgb(heat(1 - i / 6)); ctx.fillRect(480, 40 + i * 20, 14, 20); }
      ctx.fillStyle = ink; ctx.textAlign = "right"; ctx.fillText(view === "stress" ? "250" : "max", 476, 50); ctx.fillText("0", 476, 176); if (view === "stress") ctx.fillText("MPa", 476, 192);
    });
    return stop;
  };

  /* ================= Enclosure CFD: live airflow and heat ================= */
  D["enclosure-cfd"] = host => {
    const NX = 72, NY = 40;
    const layouts = { baseline: { name: "Baseline", out: [[NX - 1, 4, 8]] }, top: { name: "Top vents", out: [[-1, 30, 40]] }, side: { name: "Side vents", out: [[NX - 1, 4, 9], [NX - 1, 30, 35]] }, rec: { name: "Recommended", out: [[NX - 1, 16, 28], [NX - 1, 4, 8]] } };
    host.innerHTML = `<div class="demo-bar"><strong class="demo-title">Cooling explorer</strong><span class="spacer"></span>
      <div class="seg" role="group" aria-label="Vent layout">${Object.entries(layouts).map(([k, v]) => `<button type="button" class="chip" data-k="${k}" aria-pressed="${k === "rec"}">${v.name}</button>`).join("")}</div></div>
      <div class="pg-stage" id="cf-stage"></div>
      <div class="ctl-row">${slider("cf-fan", "Fan speed", 20, 100, 5, 70, " %")}${slider("cf-q", "Processor load", 5, 40, 1, 30, " W")}
      <label class="ctl check"><input type="checkbox" id="cf-vec" checked> <span>Show airflow</span></label></div>
      <div class="mm-read wide" id="cf-read"></div>
      <p class="demo-note">A small live solver running in your browser: a potential flow field from the inlet fan to the vents, then heat convection and diffusion from the processor module and power supply. Pick a vent layout and watch the field settle.</p>`;
    const { c, ctx } = canvas(host.querySelector("#cf-stage"), 540, 300, "Temperature and airflow field");
    const fan = bindOut(host, "cf-fan", " %"), q = bindOut(host, "cf-q", " W"), vec = host.querySelector("#cf-vec");
    const solid = new Uint8Array(NX * NY), src = new Float32Array(NX * NY);
    const id = (x, y) => y * NX + x;
    // board and components as solids
    const rect = (x0, y0, x1, y1, arr, v) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) arr[id(x, y)] = v; };
    rect(14, 30, 48, 34, solid, 1); rect(54, 24, 64, 36, solid, 1);
    let phi = new Float32Array(NX * NY), u = new Float32Array(NX * NY), v = new Float32Array(NX * NY), T = new Float32Array(NX * NY), lay = "rec";
    function flow() {
      const outs = layouts[lay].out, isOut = new Uint8Array(NX * NY), isIn = new Uint8Array(NX * NY);
      for (let y = 12; y < 22; y++) isIn[id(0, y)] = 1;
      outs.forEach(([x, a, b]) => { for (let k = a; k < b; k++) { if (x === -1) isOut[id(k, 0)] = 1; else isOut[id(x, k)] = 1; } });
      phi.fill(0.5);
      for (let it = 0; it < 900; it++) {
        for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
          const i = id(x, y); if (solid[i]) continue; if (isIn[i]) { phi[i] = 1; continue; } if (isOut[i]) { phi[i] = 0; continue; }
          let s = 0, n = 0; [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx, dy]) => { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= NX || Y >= NY || solid[id(X, Y)]) return; s += phi[id(X, Y)]; n++; });
          if (n) phi[i] = s / n;
        }
      }
      for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) { const i = id(x, y); if (solid[i]) { u[i] = v[i] = 0; continue; }
        const p = k => (k < 0 || k >= NX * NY || solid[k]) ? phi[i] : phi[k];
        u[i] = -(p(x < NX - 1 ? id(x + 1, y) : -1) - p(x > 0 ? id(x - 1, y) : -1)) * 0.5 * NX;
        v[i] = -(p(y < NY - 1 ? id(x, y + 1) : -1) - p(y > 0 ? id(x, y - 1) : -1)) * 0.5 * NX; }
      let m = 0; for (let i = 0; i < u.length; i++) m = Math.max(m, Math.hypot(u[i], v[i])); for (let i = 0; i < u.length; i++) { u[i] /= m; v[i] /= m; }
      T.fill(0); window.__cfIsOut = isOut;
    }
    function step() {
      src.fill(0); const Q = +q.value; rect(26, 26, 36, 30, src, Q * 0.012); rect(54, 24, 64, 36, src, 0.06);
      const sp = +fan.value / 100 * 0.45, k = 0.08, Tn = new Float32Array(T.length);
      for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
        const i = id(x, y);
        const g = (X, Y) => (X < 0 || Y < 0 || X >= NX || Y >= NY) ? T[i] : T[id(X, Y)];
        if (x === 0 && y >= 12 && y < 22) { Tn[i] = 0; continue; }
        const lap = g(x + 1, y) + g(x - 1, y) + g(x, y + 1) + g(x, y - 1) - 4 * T[i];
        const ux = u[i] * sp, vy = v[i] * sp;
        const adv = (ux > 0 ? T[i] - g(x - 1, y) : g(x + 1, y) - T[i]) * ux + (vy > 0 ? T[i] - g(x, y - 1) : g(x, y + 1) - T[i]) * vy;
        Tn[i] = Math.max(0, T[i] + k * lap - adv + src[i] - (window.__cfIsOut[i] ? T[i] * 0.3 : 0));
      }
      T = Tn;
    }
    host.querySelectorAll(".seg .chip").forEach(b => b.addEventListener("click", () => { lay = b.dataset.k; host.querySelectorAll(".seg .chip").forEach(x => x.setAttribute("aria-pressed", String(x === b))); flow(); }));
    flow();
    const img = ctx.createImageData(NX, NY), off = document.createElement("canvas"); off.width = NX; off.height = NY; const octx = off.getContext("2d");
    let frameN = 0; window.__cfPeak = () => { let m = 0; for (let i = 0; i < T.length; i++) m = Math.max(m, T[i]); return m; };
    const stop = loop(() => {
      for (let s = 0; s < 6; s++) step();
      let peak = 0, peakI = 0; for (let i = 0; i < T.length; i++) if (!solid[i] || (i % NX >= 54)) { if (T[i] > peak) { peak = T[i]; peakI = i; } }
      const scale = 40;
      for (let i = 0; i < T.length; i++) { const col = solid[i] && !(i % NX >= 54) ? [40, 50, 70] : heat(T[i] / scale); img.data.set([...col, 255], i * 4); }
      octx.putImageData(img, 0, 0);
      ctx.fillStyle = css("--paper"); ctx.fillRect(0, 0, 540, 300); ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 20, 20, 500, 260);
      const ink = css("--ink"), card = css("--card");
      ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.strokeRect(20, 20, 500, 260); ctx.lineWidth = 1;
      const sx = 500 / NX, sy = 260 / NY;
      ctx.fillStyle = card; ctx.fillRect(14, 20 + 12 * sy, 8, 10 * sy);
      layouts[lay].out.forEach(([x, a, b]) => { ctx.fillStyle = "#fff"; if (x === -1) ctx.fillRect(20 + a * sx, 14, (b - a) * sx, 8); else ctx.fillRect(518, 20 + a * sy, 8, (b - a) * sy); });
      if (vec.checked) { ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.2;
        for (let y = 2; y < NY; y += 4) for (let x = 2; x < NX; x += 5) { const i = id(x, y); if (solid[i]) continue; const X = 20 + x * sx, Y = 20 + y * sy, L = 14 * Math.min(1, Math.hypot(u[i], v[i]) * 3) * (+fan.value / 100);
          const a = Math.atan2(v[i], u[i]); ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X + Math.cos(a) * L, Y + Math.sin(a) * L); ctx.stroke(); } }
      ctx.fillStyle = "#fff"; ctx.font = "600 11px sans-serif"; ctx.textAlign = "left"; ctx.fillText("Inlet fan", 26, 20 + 11 * sy); ctx.fillText("Processor", 20 + 26 * sx, 20 + 25 * sy); ctx.fillText("PSU", 20 + 55 * sx, 20 + 23 * sy);
      const px = 20 + (peakI % NX) * sx, py = 20 + Math.floor(peakI / NX) * sy; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 7, 0, 7); ctx.stroke(); ctx.lineWidth = 1;
      if (++frameN % 10 === 0) { const tC = 25 + peak * 1.2; host.querySelector("#cf-read").innerHTML = `<div><span>Layout</span><strong>${layouts[lay].name}</strong></div><div><span>Peak temperature, live</span><strong>${tC.toFixed(0)} °C</strong></div><div><span>Inlet air</span><strong>25 °C</strong></div><div><span>Hot spot</span><strong>${(peakI % NX) > 50 ? "Power supply" : "Processor"}</strong></div>`; }
    });
    return stop;
  };

  /* ================= TurtleBot obstacle avoidance ================= */
  D["turtlebot"] = host => {
    host.innerHTML = `<div class="demo-bar"><strong class="demo-title">Obstacle avoidance sim</strong><span class="pill" id="tb-state">Forward</span><span class="spacer"></span>
      <button class="btn small" type="button" id="tb-pause">Pause</button><button class="btn small" type="button" id="tb-reset">Reset world</button></div>
      <div class="tb-wrap"><div class="pg-stage" id="tb-stage"></div><div class="tb-side"><div id="tb-polar"></div><div class="mm-read col" id="tb-read"></div></div></div>
      <div class="ctl-row">${slider("tb-th", "Safety distance", 0.2, 0.6, 0.01, 0.30, " m")}${slider("tb-v", "Forward speed", 0.05, 0.22, 0.01, 0.15, " m/s")}
      <label class="ctl check"><input type="checkbox" id="tb-rays" checked> <span>Show LiDAR rays</span></label></div>
      <p class="demo-note">Click anywhere in the world to drop a box, click a box to remove it. The same front, left, and right sector logic as my ROS 2 node runs here on a simulated 360 degree scan.</p>`;
    const { c, ctx } = canvas(host.querySelector("#tb-stage"), 480, 320, "Robot world, click to add obstacles");
    const polarHost = host.querySelector("#tb-polar"); const pc = canvas(polarHost, 180, 180, "LiDAR polar view");
    const th = bindOut(host, "tb-th", " m", v => v.toFixed(2)), vs = bindOut(host, "tb-v", " m/s", v => v.toFixed(2)), rays = host.querySelector("#tb-rays");
    const PX = 120; // px per metre
    let robot, boxes, mover, paused = false, trail = [], scan = [];
    function reset() { robot = { x: 60, y: 260, a: -0.6 }; trail = []; boxes = [[140, 70, 50, 40], [230, 170, 60, 50], [340, 50, 40, 90], [110, 200, 40, 40], [380, 220, 50, 40]]; mover = { x: 300, y: 280, vx: -50 }; }
    reset();
    function cast(x, y, a) {
      let best = 4 * PX; const dx = Math.cos(a), dy = Math.sin(a);
      const seg = (t) => { if (t > 0 && t < best) best = t; };
      // walls
      if (dx > 0) seg((480 - x) / dx); if (dx < 0) seg(-x / dx); if (dy > 0) seg((320 - y) / dy); if (dy < 0) seg(-y / dy);
      boxes.forEach(([bx, by, bw, bh]) => { let t0 = -1e9, t1 = 1e9;
        for (const [p, d, lo, hi] of [[x, dx, bx, bx + bw], [y, dy, by, by + bh]]) { if (Math.abs(d) < 1e-9) { if (p < lo || p > hi) { t0 = 1e9; } continue; } let a1 = (lo - p) / d, a2 = (hi - p) / d; if (a1 > a2) [a1, a2] = [a2, a1]; t0 = Math.max(t0, a1); t1 = Math.min(t1, a2); }
        if (t0 <= t1 && t0 > 0) seg(t0); });
      const ox = mover.x - x, oy = mover.y - y, b = ox * dx + oy * dy, cc = ox * ox + oy * oy - 196, disc = b * b - cc; if (disc > 0) seg(b - Math.sqrt(disc));
      return best / PX;
    }
    c.addEventListener("click", e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 480, y = (e.clientY - r.top) / r.height * 320;
      const i = boxes.findIndex(([bx, by, bw, bh]) => x >= bx && x <= bx + bw && y >= by && y <= by + bh);
      if (i >= 0) boxes.splice(i, 1); else if (Math.hypot(x - robot.x, y - robot.y) > 40) boxes.push([x - 20, y - 20, 40, 40]); });
    host.querySelector("#tb-pause").addEventListener("click", e => { paused = !paused; e.currentTarget.textContent = paused ? "Resume" : "Pause"; });
    host.querySelector("#tb-reset").addEventListener("click", reset);
    let state = "Forward", turnDir = 1, nScan = 0;
    const stop = loop(dt => {
      if (!paused) {
        mover.x += mover.vx * dt; if (mover.x < 200 || mover.x > 450) mover.vx *= -1;
        scan = []; for (let k = 0; k < 120; k++) { const a = robot.a + (k / 120) * Math.PI * 2; scan.push(cast(robot.x, robot.y, a)); }
        const sector = (lo, hi) => { let m = 9; for (let k = 0; k < 120; k++) { let deg = k * 3; if (deg > 180) deg -= 360; if (deg >= lo && deg <= hi) m = Math.min(m, scan[k]); } return m; };
        const front = sector(-20, 20), left = sector(-90, -21), right = sector(21, 90), T0 = +th.value;
        let v = +vs.value, w = 0;
        if (front < T0) { v = 0; if (state !== "Turning") turnDir = left > right ? -1 : 1; w = turnDir * 1.6; state = "Turning"; }
        else if (left < T0 * 0.9) { w = 0.8; state = "Veer right"; } else if (right < T0 * 0.9) { w = -0.8; state = "Veer left"; } else { state = "Forward"; w = Math.sin(performance.now() / 1500) * 0.15; }
        robot.a += w * dt; robot.x += Math.cos(robot.a) * v * PX * dt; robot.y += Math.sin(robot.a) * v * PX * dt;
        robot.x = Math.max(14, Math.min(466, robot.x)); robot.y = Math.max(14, Math.min(306, robot.y));
        if (++nScan % 3 === 0) { trail.push([robot.x, robot.y]); if (trail.length > 300) trail.shift(); }
        host.querySelector("#tb-state").textContent = state;
        host.querySelector("#tb-read").innerHTML = [["Front", front], ["Left", left], ["Right", right]].map(([n, d]) => `<div><span>${n} sector</span><strong class="${d < T0 ? "bad" : ""}">${d > 3.9 ? "clear" : d.toFixed(2) + " m"}</strong></div>`).join("") + `<div><span>Command</span><strong>v ${v.toFixed(2)}, ω ${w.toFixed(2)}</strong></div>`;
      }
      const paper = css("--paper"), card = css("--card"), ink = css("--ink"), teal = css("--teal"), p2 = css("--paper-2"), warn = css("--warn");
      ctx.fillStyle = card; ctx.fillRect(0, 0, 480, 320);
      ctx.strokeStyle = p2; for (let g = 0; g < 480; g += PX / 4) { ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, 320); ctx.stroke(); } for (let g = 0; g < 320; g += PX / 4) { ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(480, g); ctx.stroke(); }
      ctx.fillStyle = p2; ctx.strokeStyle = ink; boxes.forEach(([x, y, w, h]) => { ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); });
      ctx.fillStyle = warn; ctx.beginPath(); ctx.arc(mover.x, mover.y, 14, 0, 7); ctx.fill();
      ctx.strokeStyle = teal; ctx.lineWidth = 2; ctx.beginPath(); trail.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.lineWidth = 1;
      if (rays.checked) { ctx.strokeStyle = "rgba(14,116,112,.25)"; scan.forEach((d, k) => { if (k % 2) return; const a = robot.a + (k / 120) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(robot.x, robot.y); ctx.lineTo(robot.x + Math.cos(a) * d * PX, robot.y + Math.sin(a) * d * PX); ctx.stroke(); });
        ctx.fillStyle = teal; scan.forEach((d, k) => { if (d > 3.9) return; const a = robot.a + (k / 120) * Math.PI * 2; ctx.fillRect(robot.x + Math.cos(a) * d * PX - 1.5, robot.y + Math.sin(a) * d * PX - 1.5, 3, 3); }); }
      ctx.save(); ctx.translate(robot.x, robot.y); ctx.rotate(robot.a); ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.fill(); ctx.fillStyle = card; ctx.fillRect(4, -3, 8, 6); ctx.restore();
      ctx.fillStyle = ink; ctx.font = "11px sans-serif"; ctx.fillText("Grid 0.25 m", 8, 314);
      // polar
      const p = pc.ctx; p.fillStyle = paper; p.fillRect(0, 0, 180, 180); const cx = 90, cy = 90, R = 80 / 2;
      p.strokeStyle = p2; [1, 2].forEach(r => { p.beginPath(); p.arc(cx, cy, r * R, 0, 7); p.stroke(); });
      p.fillStyle = "rgba(232,163,61,.35)"; p.beginPath(); p.moveTo(cx, cy); p.arc(cx, cy, 2 * R, -Math.PI / 2 - 0.35, -Math.PI / 2 + 0.35); p.fill();
      p.strokeStyle = ink; p.setLineDash([3, 3]); p.beginPath(); p.arc(cx, cy, +th.value * R, 0, 7); p.stroke(); p.setLineDash([]);
      p.fillStyle = teal; scan.forEach((d, k) => { if (d > 2) return; const a = -Math.PI / 2 + (k / 120) * Math.PI * 2; p.fillRect(cx + Math.cos(a) * d * R - 1, cy + Math.sin(a) * d * R - 1, 2.5, 2.5); });
      p.fillStyle = ink; p.beginPath(); p.arc(cx, cy, 4, 0, 7); p.fill(); p.font = "10px sans-serif"; p.fillText("2 m", cx + 2 * R - 18, cy - 3); p.fillText("front", cx - 12, 10);
    });
    return stop;
  };

  /* ================= Rock CT viewer ================= */
  D["rock-imaging"] = host => {
    const N = 96, cores = [{ id: "RC-01", seed: 3, n: 160 }, { id: "RC-02", seed: 11, n: 230 }, { id: "RC-03", seed: 29, n: 300 }];
    host.innerHTML = `<div class="demo-bar"><strong class="demo-title">CT slice viewer</strong><span class="spacer"></span>
      <div class="seg" role="group" aria-label="Sample">${cores.map((c, i) => `<button type="button" class="chip" data-i="${i}" aria-pressed="${i === 1}">${c.id}</button>`).join("")}</div></div>
      <div class="ri-wrap"><div class="pg-stage" id="ri-stage"></div><div class="ri-side"><div class="mm-read col" id="ri-read"></div>
      <label class="ctl check"><input type="checkbox" id="ri-ov" checked> <span>Segmentation overlay</span></label></div></div>
      <div class="ctl-row">${slider("ri-z", "Slice", 1, N, 1, 48)}${slider("ri-th", "Pore threshold", 40, 140, 1, 92)}</div>
      <p class="demo-note">Scroll through the stack and move the threshold. The pore phase is segmented live and porosity is measured for this slice and for the whole stack at 20 µm voxels.</p>`;
    const { c, ctx } = canvas(host.querySelector("#ri-stage"), 300, 300, "CT slice with pore segmentation");
    const z = bindOut(host, "ri-z"), thr = bindOut(host, "ri-th"), ov = host.querySelector("#ri-ov");
    let vol, cur = 1;
    function build(core) {
      let s = core.seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      vol = new Uint8Array(N * N * N);
      for (let i = 0; i < vol.length; i++) vol[i] = 150 + r() * 60;
      for (let k = 0; k < core.n; k++) { const cx = r() * N, cy = r() * N, cz = r() * N, rad = 1.5 + r() * 4.5;
        for (let zz = Math.max(0, cz - rad | 0); zz < Math.min(N, cz + rad + 1); zz++) for (let y = Math.max(0, cy - rad | 0); y < Math.min(N, cy + rad + 1); y++) for (let x = Math.max(0, cx - rad | 0); x < Math.min(N, cx + rad + 1); x++) {
          const d = Math.hypot(x - cx, y - cy, (zz - cz) * 1.2); if (d < rad) vol[(zz * N + y) * N + x] = 30 + r() * 50 + (d / rad) * 40; } }
    }
    const inside = (x, y) => Math.hypot(x - N / 2, y - N / 2) < N / 2 - 1;
    function draw() {
      const zz = +z.value - 1, T = +thr.value, img = ctx.createImageData(N, N); let pore = 0, tot = 0;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = (y * N + x), v = vol[zz * N * N + i];
        if (!inside(x, y)) { img.data.set([0, 0, 0, 0], i * 4); continue; } tot++;
        if (v < T) { pore++; if (ov.checked) { img.data.set([14, 160, 150, 255], i * 4); continue; } }
        img.data.set([v, v, v + 4, 255], i * 4); }
      const off = document.createElement("canvas"); off.width = N; off.height = N; off.getContext("2d").putImageData(img, 0, 0);
      ctx.clearRect(0, 0, 300, 300); ctx.imageSmoothingEnabled = false; ctx.drawImage(off, 6, 6, 288, 288);
      ctx.strokeStyle = css("--ink"); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(150, 150, 144, 0, 7); ctx.stroke();
      ctx.fillStyle = css("--ink"); ctx.fillRect(14, 286, 60, 3); ctx.font = "10px sans-serif"; ctx.fillText("0.4 mm", 14, 282);
      let vp = 0, vt = 0; for (let k = 0; k < N; k += 4) for (let i = 0; i < N * N; i += 3) { if (!inside(i % N, i / N | 0)) continue; vt++; if (vol[k * N * N + i] < T) vp++; }
      const vox = 0.02 ** 3, bulk = vt * 12 * vox;
      host.querySelector("#ri-read").innerHTML = `<div><span>Sample</span><strong>${cores[cur].id}</strong></div><div><span>Slice</span><strong>${zz + 1} of ${N}</strong></div><div><span>Slice porosity</span><strong>${(pore / tot * 100).toFixed(1)} %</strong></div><div><span>Stack porosity</span><strong>${(vp / vt * 100).toFixed(1)} %</strong></div><div><span>Voxel</span><strong>20 µm</strong></div>`;
    }
    host.querySelectorAll(".seg .chip").forEach(b => b.addEventListener("click", () => { cur = +b.dataset.i; host.querySelectorAll(".seg .chip").forEach(x => x.setAttribute("aria-pressed", String(x === b))); build(cores[cur]); draw(); }));
    [z, thr].forEach(i => i.addEventListener("input", draw)); ov.addEventListener("change", draw);
    let stopW = null; c.addEventListener("wheel", e => { e.preventDefault(); z.value = Math.max(1, Math.min(N, +z.value + Math.sign(e.deltaY))); z.dispatchEvent(new Event("input")); }, { passive: false });
    build(cores[cur]); draw();
    return () => stopW && stopW();
  };

  /* ================= Product video: playable motion piece ================= */
  D["product-video"] = host => {
    const DUR = 36, chapters = [[0, "Intro"], [6, "Step 1 Mount"], [14, "Step 2 Connect"], [22, "Step 3 Run"], [30, "Wrap"]];
    host.innerHTML = `<div class="vp"><div class="pg-stage vp-screen" id="vp-stage"></div>
      <div class="vp-ctl"><button class="btn small" type="button" id="vp-play" aria-label="Play">▶ Play</button>
      <input type="range" id="vp-seek" min="0" max="${DUR}" step="0.1" value="0" aria-label="Seek"><span class="mono" id="vp-time">0:00 / 3:00</span>
      <label class="ctl check"><input type="checkbox" id="vp-cc" checked> <span>Captions</span></label></div>
      <div class="vp-ch">${chapters.map(([t, n]) => `<button type="button" class="chip" data-t="${t}">${n}</button>`).join("")}</div></div>
      <p class="demo-note">A condensed, playable version of the cut. The timecode shows the position in the full three minute edit.</p>`;
    const { c, ctx } = canvas(host.querySelector("#vp-stage"), 640, 360, "Product video player");
    const seek = host.querySelector("#vp-seek"), cc = host.querySelector("#vp-cc"), playB = host.querySelector("#vp-play");
    let t = 0, playing = false;
    const caps = [[0, "Here is how to set up the unit in three steps."], [6, "Fix the base to the frame with four M8 screws."], [14, "Connect the supply and the control cable."], [22, "Press start and check the status light."], [30, "That is it. Full manual on our website."]];
    const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    playB.addEventListener("click", () => { playing = !playing; if (t >= DUR) t = 0; playB.textContent = playing ? "❚❚ Pause" : "▶ Play"; playB.setAttribute("aria-label", playing ? "Pause" : "Play"); });
    seek.addEventListener("input", () => { t = +seek.value; });
    host.querySelectorAll(".vp-ch .chip").forEach(b => b.addEventListener("click", () => { t = +b.dataset.t; playing = true; playB.textContent = "❚❚ Pause"; }));
    const stop = loop(dt => {
      if (playing) { t += dt; if (t >= DUR) { t = DUR; playing = false; playB.textContent = "▶ Play"; } seek.value = t; }
      host.querySelector("#vp-time").textContent = `${fmt(t * 5)} / 3:00`;
      const ch = chapters.filter(c => c[0] <= t).length - 1, lt = t - chapters[ch][0];
      const bg = ctx.createLinearGradient(0, 0, 0, 360); bg.addColorStop(0, "#1b2a4a"); bg.addColorStop(1, "#0d1424"); ctx.fillStyle = bg; ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = "#24365c"; ctx.fillRect(0, 280, 640, 80);
      // product: a machine on a frame
      const zoom = (ch === 3 ? 1 + Math.min(lt, 3) * 0.06 : 1) * 0.9, cx = 480, cy = 224;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(zoom, zoom);
      ctx.fillStyle = "#3a4d74"; ctx.fillRect(-150, 50, 300, 14);
      const drop = ch === 1 ? Math.max(0, 60 - lt * 30) : ch === 0 ? 60 : 0;
      ctx.fillStyle = "#e6e9ef"; ctx.fillRect(-110, -70 - drop, 220, 120); ctx.fillStyle = "#c3c9d4"; ctx.fillRect(-110, 30 - drop, 220, 20);
      ctx.fillStyle = "#0e7470"; ctx.beginPath(); ctx.arc(0, -15 - drop, 34, 0, 7); ctx.fill(); ctx.fillStyle = "#e6e9ef"; ctx.beginPath(); ctx.arc(0, -15 - drop, 12, 0, 7); ctx.fill();
      if (ch >= 3) { ctx.save(); ctx.translate(0, -15); ctx.rotate(t * 6); ctx.fillStyle = "#4cc0b6"; for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.fillRect(-3, -30, 6, 18); } ctx.restore(); }
      const lit = ch >= 3 ? (Math.floor(t * 2) % 2 ? "#38d39f" : "#1f8f6a") : "#55607a"; ctx.fillStyle = lit; ctx.beginPath(); ctx.arc(80, -50, 7, 0, 7); ctx.fill();
      if (ch >= 2) { ctx.strokeStyle = "#e8a33d"; ctx.lineWidth = 5; ctx.beginPath(); const k = ch === 2 ? Math.min(1, lt / 4) : 1; ctx.moveTo(110, 10); ctx.bezierCurveTo(170, 10, 180, 60, 220 * k + 110 * (1 - k), 80); ctx.stroke(); }
      if (ch === 1) [[-90, 50], [90, 50]].forEach(([x, y]) => { ctx.fillStyle = "#f4f4f4"; ctx.fillRect(x - 4, y - 10 - Math.max(0, 30 - lt * 15), 8, 18); });
      ctx.restore();
      // title cards and step labels
      const a = Math.min(1, lt * 2);
      ctx.globalAlpha = a; ctx.fillStyle = "#4cc0b6"; ctx.fillRect(40, 90, 6, 70);
      ctx.fillStyle = "#fff"; ctx.font = "700 30px Archivo, sans-serif"; ctx.textAlign = "left";
      const titles = ["Setup and operation", "Mount", "Connect", "Run", "Ready to work"], subs = ["in under three minutes", "Step 1 of 3", "Step 2 of 3", "Step 3 of 3", "See the full manual online"];
      ctx.fillText(titles[ch], 58, 122); ctx.font = "16px sans-serif"; ctx.fillStyle = "#c9d3e3"; ctx.fillText(subs[ch], 58, 150); ctx.globalAlpha = 1;
      if (cc.checked) { const cap = caps.filter(c => c[0] <= t).pop()[1]; ctx.font = "16px sans-serif"; const w = ctx.measureText(cap).width + 24; ctx.fillStyle = "rgba(0,0,0,.65)"; ctx.fillRect(320 - w / 2, 316, w, 28); ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.fillText(cap, 320, 336); }
      ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.font = "11px monospace"; ctx.textAlign = "right"; ctx.fillText("1080p  H.264", 630, 18);
      if (!playing && t === 0) { ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(0, 0, 640, 360); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(300, 150); ctx.lineTo(350, 180); ctx.lineTo(300, 210); ctx.fill(); }
      host.querySelectorAll(".vp-ch .chip").forEach((b, i) => b.setAttribute("aria-pressed", String(i === ch)));
    });
    c.addEventListener("click", () => playB.click());
    return stop;
  };

  /* ================= BOM cross check ================= */
  D["bom-records"] = host => {
    const model = [["MM-100","Base plate",1,"C"],["MM-110","Bracket, slotted",2,"C"],["MM-120","Spacer",4,"B"],["MM-130","Cover",1,"D"],["ISO 4762-M8x30","Socket cap screw",8,"A"],["ISO 7089-M8","Washer",8,"A"],["MM-140","Belt guard",1,"A"],["MOTOR-A","Drive motor",1,"A"]];
    let bom = [["MM-100","Base plate",1,"C"],["MM-110","Bracket, slotted",2,"B"],["MM-120","Spacer",4,"B"],["MM-130","Cover",1,"D"],["ISO 4762-M8x30","Socket cap screw",6,"A"],["ISO 7089-M8","Washer",8,"A"],["MOTOR-A","Drive motor",1,"A"]];
    let log = [["D", "Cover material to PC"], ["C", "Fastener change to M8"]], sortK = 0, q = "";
    host.innerHTML = `<div class="demo-bar"><strong class="demo-title">BOM cross check</strong><span class="spacer"></span>
      <input type="search" id="bm-q" class="search" placeholder="Filter parts" aria-label="Filter parts">
      <button class="btn small primary" type="button" id="bm-run">Run cross check</button></div>
      <div class="bm-wrap"><div class="tbl-scroll"><table class="mini edit" id="bm-t"></table></div>
      <div class="bm-side"><h4>Check result</h4><ul class="issues" id="bm-issues"><li class="muted">Run the check to compare this BOM with the CAD model tree.</li></ul>
      <h4>Revision log</h4><ol class="rlog" id="bm-log"></ol></div></div>
      <p class="demo-note">Edit a quantity or revision, then run the check. Fix issues one by one, or use "Fix" to pull the value from the model. Every fix is added to the revision log.</p>`;
    const tb = host.querySelector("#bm-t");
    function table() {
      const rows = bom.map((r, i) => [r, i]).filter(([r]) => (r[0] + r[1]).toLowerCase().includes(q)).sort((a, b) => String(a[0][sortK]).localeCompare(String(b[0][sortK]), undefined, { numeric: true }));
      tb.innerHTML = `<thead><tr>${["Part no.", "Description", "Qty", "Rev"].map((h, k) => `<th><button type="button" class="sortb" data-k="${k}" aria-pressed="${k === sortK}">${h}</button></th>`).join("")}</tr></thead>
        <tbody>${rows.map(([r, i]) => `<tr data-i="${i}"><td class="mono">${r[0]}</td><td>${r[1]}</td><td><input type="number" min="0" value="${r[2]}" data-f="2" aria-label="Quantity for ${r[0]}"></td><td><input type="text" maxlength="2" value="${r[3]}" data-f="3" aria-label="Revision for ${r[0]}"></td></tr>`).join("")}</tbody>`;
      tb.querySelectorAll(".sortb").forEach(b => b.addEventListener("click", () => { sortK = +b.dataset.k; table(); }));
      tb.querySelectorAll("input").forEach(inp => inp.addEventListener("change", () => { const i = +inp.closest("tr").dataset.i; bom[i][+inp.dataset.f] = inp.dataset.f === "2" ? +inp.value : inp.value.toUpperCase(); }));
    }
    function check() {
      const issues = [];
      model.forEach(m => { const b = bom.find(r => r[0] === m[0]);
        if (!b) issues.push({ t: `${m[0]} ${m[1]} is in the model but missing from the BOM`, fix: () => bom.push(m.slice()), why: `Added ${m[0]}` });
        else { if (b[2] !== m[2]) issues.push({ t: `${m[0]} quantity is ${b[2]}, model has ${m[2]}`, fix: () => b[2] = m[2], why: `${m[0]} qty ${b[2]} to ${m[2]}` });
          if (b[3] !== m[3]) issues.push({ t: `${m[0]} revision is ${b[3]}, drawing is at ${m[3]}`, fix: () => b[3] = m[3], why: `${m[0]} rev to ${m[3]}` }); } });
      bom.forEach(b => { if (!model.find(m => m[0] === b[0])) issues.push({ t: `${b[0]} is in the BOM but not in the model`, fix: () => bom.splice(bom.indexOf(b), 1), why: `Removed ${b[0]}` }); });
      tb.querySelectorAll("tbody tr").forEach(tr => { const r = bom[+tr.dataset.i]; tr.classList.toggle("bad-row", issues.some(x => x.t.startsWith(r[0] + " "))); });
      const ul = host.querySelector("#bm-issues");
      ul.innerHTML = issues.length ? issues.map((x, k) => `<li><span>${x.t}</span><button type="button" class="btn small" data-k="${k}">Fix</button></li>`).join("") : `<li class="ok">BOM matches the model and drawings.</li>`;
      ul.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { const x = issues[+b.dataset.k]; x.fix(); const last = log[0] ? log[0][0] : "D"; log.unshift([String.fromCharCode(last.charCodeAt(0) + 1), x.why]); renderLog(); table(); check(); }));
    }
    const renderLog = () => host.querySelector("#bm-log").innerHTML = log.map(([r, t]) => `<li><strong>${r}</strong> ${t}</li>`).join("");
    host.querySelector("#bm-run").addEventListener("click", check);
    host.querySelector("#bm-q").addEventListener("input", e => { q = e.target.value.toLowerCase(); table(); });
    table(); renderLog();
    return () => {};
  };

  window.DEMOS = D;
})();
