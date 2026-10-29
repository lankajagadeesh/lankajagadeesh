/* Drafting sheet background: grid, CAD crosshair with coordinates, click empty space to sketch dimensioned lines */
(function () {
  const cv = document.createElement("canvas"); cv.id = "sheet"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const ctx = cv.getContext("2d");
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MM = 0.5; // 1 px on the sheet = 0.5 mm
  let W = 0, H = 0, dpr = 1, mouse = null, pts = [], dirty = true, snapOn = true;
  const ink = () => getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#1c1e22";
  const red = () => getComputedStyle(document.documentElement).getPropertyValue("--teal").trim() || "#b3361d";
  function size() { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px"; dirty = true; }
  addEventListener("resize", size); size();
  addEventListener("scroll", () => { dirty = true; }, { passive: true });
  const snap = v => snapOn ? Math.round(v / 10) * 10 : v;
  if (fine) {
    addEventListener("pointermove", e => { mouse = { x: e.clientX, y: e.clientY, over: !!e.target.closest("a, button, input, label, canvas:not(#sheet), .three-wrap, table, summary, .demo-host") }; dirty = true; }, { passive: true });
    document.addEventListener("pointerleave", () => { mouse = null; dirty = true; });
    addEventListener("click", e => {
      if (e.target.closest("a, button, input, label, select, textarea, canvas:not(#sheet), .three-wrap, table, summary, details, .demo-host, .card, h1, h2, h3, p, li, dt, dd")) return;
      if (getSelection && String(getSelection()).length) return;
      pts.push({ x: snap(e.clientX + scrollX), y: snap(e.clientY + scrollY), t: performance.now() });
      if (pts.length > 24) pts.shift(); dirty = true;
    });
    addEventListener("keydown", e => { if (e.key === "Escape" && pts.length) { pts = []; dirty = true; } });
  }
  function dimLine(ax, ay, bx, by, alpha) {
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy); if (L < 4) return;
    const nx = -dy / L, ny = dx / L, off = 14;
    ctx.globalAlpha = alpha; ctx.strokeStyle = ink(); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.globalAlpha = alpha * 0.6; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(ax + nx * 4, ay + ny * 4); ctx.lineTo(ax + nx * (off + 4), ay + ny * (off + 4)); ctx.moveTo(bx + nx * 4, by + ny * 4); ctx.lineTo(bx + nx * (off + 4), by + ny * (off + 4)); ctx.stroke();
    const ax2 = ax + nx * off, ay2 = ay + ny * off, bx2 = bx + nx * off, by2 = by + ny * off;
    ctx.strokeStyle = red(); ctx.globalAlpha = alpha * 0.9; ctx.beginPath(); ctx.moveTo(ax2, ay2); ctx.lineTo(bx2, by2); ctx.stroke();
    const ux = dx / L, uy = dy / L, ah = 6;
    [[ax2, ay2, 1], [bx2, by2, -1]].forEach(([x, y, s]) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s * ux * ah + nx * 2.5, y + s * uy * ah + ny * 2.5); ctx.lineTo(x + s * ux * ah - nx * 2.5, y + s * uy * ah - ny * 2.5); ctx.closePath(); ctx.fillStyle = red(); ctx.fill(); });
    let ang = Math.atan2(dy, dx); if (ang > Math.PI / 2 || ang < -Math.PI / 2) ang += Math.PI;
    ctx.save(); ctx.translate((ax2 + bx2) / 2 + nx * 8, (ay2 + by2) / 2 + ny * 8); ctx.rotate(ang);
    ctx.font = "11px 'Libre Franklin', Arial, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const txt = (L * MM).toFixed(1) + " mm"; const w = ctx.measureText(txt).width + 8;
    ctx.globalAlpha = alpha; ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim() || "#f3f3f0"; ctx.fillRect(-w / 2, -8, w, 16);
    ctx.fillStyle = red(); ctx.fillText(txt, 0, 1); ctx.restore(); ctx.globalAlpha = 1;
  }
  function draw(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const ox = -scrollX % 10, oy = -scrollY % 10, c = ink();
    // grid: 1 mm minor every 10 px is too dense, so minor 20 px, major 100 px
    ctx.strokeStyle = c; ctx.lineWidth = 1;
    for (const [step, a] of [[20, 0.035], [100, 0.07]]) {
      const sx = -scrollX % step, sy = -scrollY % step; ctx.globalAlpha = a; ctx.beginPath();
      for (let x = sx; x < W; x += step) { ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, H); }
      for (let y = sy; y < H; y += step) { ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(W, Math.round(y) + 0.5); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // sketch
    const life = 20000;
    pts = pts.filter(p => now - p.t < life);
    pts.forEach((p, i) => {
      const a = Math.min(1, (life - (now - p.t)) / 4000), x = p.x - scrollX, y = p.y - scrollY;
      if (i > 0) { const q = pts[i - 1]; dimLine(q.x - scrollX, q.y - scrollY, x, y, Math.min(a, Math.min(1, (life - (now - q.t)) / 4000)) * 0.85); }
      ctx.globalAlpha = a; ctx.strokeStyle = c; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y); ctx.moveTo(x, y - 7); ctx.lineTo(x, y + 7); ctx.globalAlpha = a * 0.5; ctx.stroke(); ctx.globalAlpha = 1;
    });
    // crosshair
    if (mouse && !mouse.over) {
      const sx = snap(mouse.x + scrollX) - scrollX, sy = snap(mouse.y + scrollY) - scrollY;
      ctx.globalAlpha = 0.16; ctx.strokeStyle = c; ctx.setLineDash([4, 4]); ctx.beginPath();
      ctx.moveTo(0, sy + 0.5); ctx.lineTo(W, sy + 0.5); ctx.moveTo(sx + 0.5, 0); ctx.lineTo(sx + 0.5, H); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.rect(sx - 4, sy - 4, 8, 8); ctx.stroke();
      if (pts.length) { const q = pts[pts.length - 1]; ctx.globalAlpha = 0.3; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(q.x - scrollX, q.y - scrollY); ctx.lineTo(sx, sy); ctx.stroke(); ctx.setLineDash([]); }
      ctx.globalAlpha = 0.75; ctx.fillStyle = c; ctx.font = "11px 'IBM Plex Mono', Consolas, monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top";
      const X = ((sx + scrollX) * MM).toFixed(1), Y = ((sy + scrollY) * MM).toFixed(1);
      let label = `X ${X}  Y ${Y}`;
      if (pts.length) { const q = pts[pts.length - 1]; label += `   L ${(Math.hypot(sx + scrollX - q.x, sy + scrollY - q.y) * MM).toFixed(1)}`; }
      ctx.fillText(label, Math.min(sx + 12, W - 200), sy + 10);
      ctx.globalAlpha = 1;
    }
    dirty = false;
  }
  function loop(now) { requestAnimationFrame(loop); if (dirty || pts.length) draw(now); }
  if (reduced) { draw(performance.now()); addEventListener("scroll", () => draw(performance.now()), { passive: true }); addEventListener("pointermove", () => draw(performance.now()), { passive: true }); addEventListener("click", () => setTimeout(() => draw(performance.now()))); }
  else requestAnimationFrame(loop);
  window.__sheet = { clear: () => { pts = []; dirty = true; }, toggleSnap: () => { snapOn = !snapOn; return snapOn; } };
})();
