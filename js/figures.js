/* Project figures drawn as inline SVG. Colours come from CSS tokens through classes. */
(function () {
  const W = 480, H = 300;
  const wrap = (body, label) =>
    `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const t = (x, y, s, cls = "tx", anchor = "start") => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${s}</text>`;
  function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

  // heat colour scale, 0..1 to a fixed engineering ramp (blue to red)
  const ramp = ["#2b4c9a", "#2f86c0", "#33b0a8", "#8cc46a", "#e6c84a", "#ec8a3a", "#d6453a"];
  const heat = v => ramp[Math.max(0, Math.min(ramp.length - 1, Math.round(v * (ramp.length - 1))))];
  function legend(x, y, lo, hi, unit) {
    let s = "";
    ramp.forEach((c, i) => { s += `<rect x="${x}" y="${y + (ramp.length - 1 - i) * 22}" width="14" height="22" fill="${c}"/>`; });
    s += t(x + 20, y + 10, `${hi} ${unit}`, "tx sm");
    s += t(x + 20, y + ramp.length * 22 - 4, `${lo} ${unit}`, "tx sm");
    return s;
  }

  const F = {};

  /* ---------- Motor mount ---------- */
  F.mmAssembly = () => ({ title: "Assembly view", caption: "Base plate, slotted brackets, spacers, and motor with the protective cover hidden.", svg: wrap(`
    <rect x="60" y="210" width="360" height="22" class="pt"/>
    <rect x="60" y="232" width="360" height="8" class="pt2"/>
    <rect x="110" y="140" width="40" height="70" class="pt2"/><rect x="330" y="140" width="40" height="70" class="pt2"/>
    <rect x="118" y="182" width="24" height="9" rx="4.5" class="slot"/><rect x="338" y="182" width="24" height="9" rx="4.5" class="slot"/>
    <rect x="150" y="96" width="180" height="96" rx="10" class="pt"/>
    ${[110,126,142,158,174].map(y=>`<line x1="160" y1="${y}" x2="320" y2="${y}" class="ln thin"/>`).join("")}
    <rect x="330" y="134" width="70" height="12" class="ac-fill"/>
    <circle cx="240" cy="144" r="14" class="pt2"/>
    ${[90,150,330,390].map(x=>`<rect x="${x-6}" y="200" width="12" height="10" class="pt2"/>`).join("")}
    ${t(400,128,"Shaft", "tx sm","end")}${t(64,262,"Base plate, 10 mm","tx sm")}${t(240,82,"Motor, NEMA frame","tx sm","middle")}
    ${t(130,132,"Slotted bracket","tx sm","middle")}`, "Assembly of motor mount") });

  F.mmExploded = () => ({ title: "Exploded view", caption: "Assembly order along the vertical axis with fastener positions.", svg: wrap(`
    <line x1="240" y1="20" x2="240" y2="290" class="ln dash"/>
    <rect x="170" y="24" width="140" height="34" rx="6" class="pt"/>${t(320,46,"Cover","tx sm")}
    <rect x="160" y="78" width="160" height="50" rx="8" class="pt"/>${t(330,106,"Motor","tx sm")}
    <rect x="150" y="146" width="40" height="38" class="pt2"/><rect x="290" y="146" width="40" height="38" class="pt2"/>${t(340,168,"Brackets (2)","tx sm")}
    <rect x="155" y="200" width="30" height="12" class="ac-fill"/><rect x="295" y="200" width="30" height="12" class="ac-fill"/>${t(340,210,"Spacers (4)","tx sm")}
    <rect x="100" y="232" width="280" height="20" class="pt"/>${t(390,246,"Base plate","tx sm")}
    ${[170,310].map(x=>`<line x1="${x}" y1="130" x2="${x}" y2="270" class="ln thin dash"/><rect x="${x-5}" y="262" width="10" height="20" class="pt2"/>`).join("")}
    ${t(60,276,"M8 × 30 fasteners","tx sm")}`, "Exploded motor mount") });

  F.mmDrawing = () => ({ title: "Bracket drawing", caption: "Front view of the slotted bracket with slot travel and hole positions.", svg: wrap(`
    <rect x="12" y="12" width="456" height="276" class="frame"/>
    <rect x="320" y="236" width="148" height="52" class="frame"/>
    ${t(328,254,"BRACKET, SLOTTED","tx sm b")}${t(328,270,"S275 steel, 6 mm","tx sm")}${t(328,284,"Rev C   Scale 1:2","tx sm")}
    <path d="M90 220 L90 70 L250 70 L250 220 Z" class="pt"/>
    <rect x="120" y="150" width="100" height="20" rx="10" class="slot"/>
    <circle cx="130" cy="100" r="8" class="slot"/><circle cx="210" cy="100" r="8" class="slot"/>
    <line x1="120" y1="190" x2="220" y2="190" class="dim"/>
    <line x1="120" y1="172" x2="120" y2="196" class="ln thin"/><line x1="220" y1="172" x2="220" y2="196" class="ln thin"/>
    ${t(170,206,"100 (slot length)","tx sm","middle")}
    <line x1="130" y1="160" x2="210" y2="160" class="dim ac-stroke"/>${t(170,144,"travel 20","tx sm ac","middle")}
    <line x1="90" y1="240" x2="250" y2="240" class="dim"/>${t(170,256,"160","tx sm","middle")}
    <line x1="270" y1="70" x2="270" y2="220" class="dim"/>${t(278,150,"150","tx sm")}
    ${t(140,90,"2× Ø9 THRU","tx sm")}${t(30,40,"±0.1 on mating features","tx sm")}`, "Dimensioned bracket drawing") });

  F.mmBom = () => {
    const rows = [["1","MM-100","Base plate","S275, 10 mm","1"],["2","MM-110","Bracket, slotted","S275, 6 mm","2"],["3","MM-120","Spacer","Al 6061","4"],["4","MM-130","Cover","Polycarbonate","1"],["5","ISO 4762","Socket cap screw M8×30","8.8 zinc","8"],["6","ISO 7089","Washer M8","Steel","8"]];
    const xs=[24,58,138,320,440];
    let s = `<rect x="16" y="20" width="448" height="30" class="ac-soft"/>`;
    ["Item","Part no.","Description","Material","Qty"].forEach((h,i)=>{ s += t(xs[i]+(i===4?8:0), 40, h, "tx sm b"); });
    rows.forEach((r,j)=>{ const y = 76 + j*34; s += `<line x1="16" y1="${y+12}" x2="464" y2="${y+12}" class="ln thin"/>`; r.forEach((c,i)=>{ s += t(xs[i]+(i===4?8:0), y, c, "tx sm"); }); });
    return { title: "Bill of materials extract", caption: "First six of 14 line items with materials and quantities.", svg: wrap(s, "Bill of materials table") };
  };

  /* ---------- Bracket FEA ---------- */
  const bracketPath = "M80 240 L80 120 Q80 90 110 90 L200 90 L200 60 L400 60 L400 110 L240 110 L240 240 Z";
  F.feaMesh = () => {
    const r = rng(7); let tris = "";
    for (let x = 80; x < 400; x += 16) for (let y = 60; y < 240; y += 16) {
      const inside = (x < 240 && y >= 90) || (y < 110 && x >= 200) || (x<240 && y>=90);
      if (!inside) continue;
      const near = Math.hypot(x - 130, y - 180) < 40 || Math.hypot(x - 350, y - 85) < 30 || Math.hypot(x-240,y-110)<26;
      const st = near ? 8 : 16;
      for (let a = 0; a < 16; a += st) for (let b = 0; b < 16; b += st) {
        const X = x + a, Y = y + b, j = () => (r() - .5) * 1.5;
        tris += `<path d="M${X+j()} ${Y+j()} L${X+st} ${Y} L${X} ${Y+st} Z M${X+st} ${Y} L${X+st} ${Y+st} L${X} ${Y+st}" class="mesh"/>`;
      }
    }
    return { title: "Bracket mesh", caption: "Second order tetrahedral mesh with local refinement at the bolt holes and the inner fillet.", svg: wrap(`
      <defs><clipPath id="bk1"><path d="${bracketPath}"/></clipPath></defs>
      <path d="${bracketPath}" class="pt"/><g clip-path="url(#bk1)">${tris}</g><path d="${bracketPath}" class="ln" fill="none"/>
      <circle cx="130" cy="180" r="14" class="hole"/><circle cx="350" cy="85" r="11" class="hole"/>
      ${t(300,170,"Elements: 48,612","tx sm")}${t(300,188,"Nodes: 81,940","tx sm")}${t(300,206,"Hole refinement: 0.5 mm","tx sm")}`, "Finite element mesh of bracket") };
  };

  F.feaBC = () => ({ title: "Boundary conditions", caption: "Fixed mounting face, bolt preload at both holes, and motor load on the top flange.", svg: wrap(`
    <path d="${bracketPath}" class="pt"/>
    ${[100,130,160,190,220].map(x=>`<path d="M${x} 244 l-8 14 h16 Z" class="ac-fill"/>`).join("")}
    <line x1="70" y1="262" x2="250" y2="262" class="ln"/>${t(160,284,"Fixed support, mounting face","tx sm","middle")}
    <circle cx="130" cy="180" r="14" class="hole"/><circle cx="350" cy="85" r="11" class="hole"/>
    ${[260,300,340,380].map(x=>`<line x1="${x}" y1="18" x2="${x}" y2="54" class="arrow"/>`).join("")}
    ${t(320,14,"F = 1.2 kN","tx sm ac","middle")}
    <path d="M118 168 l24 24 M142 168 l-24 24" class="ln"/>${t(150,216,"Preload 18 kN","tx sm")}
    ${t(280,150,"Frictional contact μ = 0.2","tx sm")}${t(280,168,"Steel, E = 210 GPa","tx sm")}`, "Boundary condition diagram") });

  F.feaStress = () => {
    let cells = "";
    for (let x = 80; x < 400; x += 8) for (let y = 56; y < 244; y += 8) {
      const d1 = Math.hypot(x - 240, y - 110), d2 = Math.hypot(x - 130, y - 180);
      const v = Math.max(0, 1 - d1 / 120) * 0.95 + Math.max(0, 1 - d2 / 70) * 0.35;
      cells += `<rect x="${x}" y="${y}" width="8.5" height="8.5" fill="${heat(Math.min(1, v))}"/>`;
    }
    return { title: "von Mises stress", caption: "Peak stress of 142 MPa at the inner fillet, factor of safety 1.76 against yield.", svg: wrap(`
      <defs><clipPath id="bk2"><path d="${bracketPath}"/></clipPath></defs>
      <g clip-path="url(#bk2)">${cells}</g><path d="${bracketPath}" class="ln" fill="none"/>
      <circle cx="130" cy="180" r="14" class="hole"/><circle cx="350" cy="85" r="11" class="hole"/>
      <line x1="244" y1="114" x2="300" y2="170" class="ln"/>${t(304,180,"Max 142 MPa","tx sm b")}
      ${legend(412, 120, 0, 142, "MPa")}`, "Stress contour plot") };
  };

  F.feaConvergence = () => {
    const pts = [[8000,118],[16000,131],[28000,138],[48612,142],[72000,143]];
    const x = n => 60 + (n / 80000) * 380, y = v => 250 - ((v - 100) / 50) * 200;
    let s = `<line x1="60" y1="250" x2="440" y2="250" class="ln"/><line x1="60" y1="50" x2="60" y2="250" class="ln"/>`;
    [100,110,120,130,140,150].forEach(v=>{ s+= `<line x1="60" y1="${y(v)}" x2="440" y2="${y(v)}" class="grid"/>` + t(52,y(v)+4,v,"tx sm","end"); });
    [0,20000,40000,60000,80000].forEach(n=>{ s+= t(x(n),268,(n/1000)+"k","tx sm","middle"); });
    s += `<polyline points="${pts.map(p=>x(p[0])+","+y(p[1])).join(" ")}" class="ac-stroke thick" fill="none"/>`;
    pts.forEach((p,i)=>{ s += `<circle cx="${x(p[0])}" cy="${y(p[1])}" r="${i===3?6:4}" class="${i===3?'ac-fill':'pt2'}"/>`; });
    s += t(x(48612)+8, y(142)-12, "Selected mesh", "tx sm b") + t(250,288,"Elements","tx sm","middle") + t(16,40,"Peak stress, MPa","tx sm");
    return { title: "Mesh convergence", caption: "Peak stress changed by under 1 percent between the selected and the finest mesh.", svg: wrap(s, "Mesh convergence chart") };
  };

  /* ---------- Enclosure CFD ---------- */
  F.cfdGeometry = () => ({ title: "Enclosure and airflow paths", caption: "Inlet fan on the left, outlet vents on the right, with the main flow paths over the board.", svg: wrap(`
    <rect x="40" y="40" width="400" height="220" rx="6" class="pt" />
    <rect x="44" y="110" width="14" height="80" class="ac-fill"/>${t(48,100,"Inlet fan","tx sm")}
    ${[80,120,160,200].map(y=>`<rect x="428" y="${y}" width="10" height="22" class="slot"/>`).join("")}${t(436,70,"Outlet vents","tx sm","end")}
    <rect x="110" y="170" width="200" height="70" class="pt2"/>${t(120,232,"Main board","tx sm")}
    <rect x="180" y="150" width="60" height="20" class="pt2"/>${t(184,144,"Heat sink, 25 W","tx sm")}
    <rect x="330" y="160" width="70" height="80" class="pt2"/>${t(334,154,"PSU, 15 W","tx sm")}
    ${[["M70 130 C150 110 260 90 420 92"],["M70 150 C160 140 300 120 420 132"],["M70 170 C140 160 250 150 330 150 C360 150 400 190 420 212"]].map(p=>`<path d="${p}" class="flow"/>`).join("")}`, "Enclosure geometry") });

  F.cfdContour = () => {
    let cells = "";
    for (let x = 40; x < 440; x += 10) for (let y = 40; y < 260; y += 10) {
      const v = 0.15 + Math.max(0, 1 - Math.hypot(x - 210, y - 170) / 120) * 0.75 + Math.max(0, 1 - Math.hypot(x - 365, y - 200) / 70) * 0.45 - Math.max(0, 1 - (x - 40) / 160) * 0.2;
      cells += `<rect x="${x}" y="${y}" width="10.5" height="10.5" fill="${heat(Math.max(0, Math.min(1, v)))}"/>`;
    }
    return { title: "Temperature contour, recommended layout", caption: "Mid plane temperature with the recommended vent layout. Peak component temperature 58 °C.", svg: wrap(`
      ${cells.replace(/x="(\d+)"/g,(m,v)=>`x="${(v-40)*0.88+20}"`).replace(/width="10.5"/g,'width="9.4"')}
      <rect x="20" y="40" width="352" height="220" class="ln" fill="none"/>
      <rect x="142" y="150" width="53" height="20" fill="none" class="ln"/>${t(168,142,"58 °C","tx sm b inv","middle")}
      ${legend(392, 60, 24, 58, "°C")}`, "Temperature contour") };
  };

  F.cfdCompare = () => {
    const d = [["Baseline", 71], ["Top vents", 66], ["Side vents", 62], ["Recommended", 58]];
    const x0 = 140, sc = v => (v / 80) * 300;
    let s = "";
    [0,20,40,60,80].forEach(v=>{ s += `<line x1="${x0+sc(v)}" y1="30" x2="${x0+sc(v)}" y2="250" class="grid"/>` + t(x0+sc(v),268,v,"tx sm","middle"); });
    d.forEach((r,i)=>{ const y = 50 + i*50; s += t(130, y+20, r[0], "tx sm", "end") + `<rect x="${x0}" y="${y}" width="${sc(r[1])}" height="28" class="${i===3?'ac-fill':'pt2'}"/>` + t(x0+sc(r[1])+6, y+19, r[1]+" °C", "tx sm b"); });
    s += t(x0+150, 290, "Peak component temperature, °C", "tx sm", "middle");
    return { title: "Vent layout comparison", caption: "Four layouts at the same inlet flow. The recommended layout lowers the peak by 13 °C.", svg: wrap(s, "Bar chart comparing vent layouts") };
  };

  /* ---------- TurtleBot ---------- */
  F.tbScene = () => ({ title: "Gazebo test world", caption: "Top view of the test world with the recorded path around static and moving obstacles.", svg: wrap(`
    <rect x="30" y="20" width="420" height="260" class="pt"/>
    ${[[100,60,50,40],[220,170,60,50],[330,60,40,90],[120,200,40,40]].map(b=>`<rect x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" class="pt2"/>`).join("")}
    <circle cx="300" cy="230" r="14" class="ac-soft-fill"/><path d="M286 230 h-30" class="arrow"/>${t(316,256,"Moving obstacle","tx sm")}
    <path d="M60 250 C80 180 70 130 90 120 C160 110 190 140 200 150 C230 150 280 140 300 130 C320 120 310 60 400 50" class="path"/>
    <circle cx="60" cy="250" r="8" class="ac-fill"/>${t(72,270,"Start","tx sm")}
    <circle cx="400" cy="50" r="6" class="ln" fill="none"/>${t(392,40,"Goal","tx sm","end")}`, "Gazebo scene with path") });

  F.tbGraph = () => {
    const n = (x,y,w,l,cls="pt") => `<rect x="${x}" y="${y}" width="${w}" height="36" rx="18" class="${cls}"/>` + t(x+w/2,y+23,l,"tx sm b","middle");
    const e = (x1,y1,x2,y2,l) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="arrow"/>` + t((x1+x2)/2,(y1+y2)/2-8,l,"tx sm mono","middle");
    return { title: "ROS 2 system graph", caption: "Nodes and topics between the LiDAR driver, the avoidance node, and the base controller.", svg: wrap(`
      ${n(20,60,120,"lds_driver")}${n(180,130,140,"avoid_node","ac-soft")}${n(360,60,110,"base_ctrl")}${n(360,200,110,"odom")}
      ${e(140,80,190,135,"/scan")}${e(320,140,360,90,"/cmd_vel")}${e(415,200,320,160,"/odom")}
      ${t(250,230,"Python, rclpy","tx sm","middle")}${t(250,250,"Timer 10 Hz","tx sm","middle")}`, "ROS 2 node graph") };
  };

  F.tbLidar = () => {
    const r = rng(3); let pts = ""; const cx = 200, cy = 150;
    for (let a = 0; a < 360; a += 3) {
      const rad = a * Math.PI / 180; let d = 110 + r() * 6;
      if (a > 340 || a < 20) d = 52 + r() * 3; if (a > 60 && a < 100) d = 80 + r() * 3; if (a > 200 && a < 240) d = 95;
      pts += `<circle cx="${cx + d * Math.cos(rad - Math.PI/2)}" cy="${cy + d * Math.sin(rad - Math.PI/2)}" r="2.2" class="ac-fill"/>`;
    }
    return { title: "LiDAR scan and sectors", caption: "One 360 degree scan split into front, left, and right sectors. The front sector is below the 0.35 m threshold.", svg: wrap(`
      ${[40,80,120].map(r=>`<circle cx="${cx}" cy="${cy}" r="${r}" class="grid" fill="none"/>`).join("")}
      <path d="M${cx} ${cy} L${cx-40} ${cy-110} A118 118 0 0 1 ${cx+40} ${cy-110} Z" class="warn-fill"/>
      <circle cx="${cx}" cy="${cy}" r="62" class="ln dash" fill="none"/>
      ${pts}<circle cx="${cx}" cy="${cy}" r="10" class="pt2"/>
      ${t(330,60,"Front sector ±20°","tx sm b")}${t(330,80,"Nearest 0.31 m","tx sm")}${t(330,100,"Action: turn left","tx sm")}
      ${t(330,140,"Dashed ring 0.35 m","tx sm")}${t(330,160,"Grid 0.25 m","tx sm")}`, "LiDAR polar scan") };
  };

  /* ---------- Puzzle game ---------- */
  F.pgLevel = () => {
    const map = ["##########","#P..#....#","#.C.#.S..#","#...D..C.#","#.#####..#","#..S...E.#","##########"];
    let s = ""; const sz = 34, ox = 70, oy = 30;
    map.forEach((row,j)=>[...row].forEach((c,i)=>{ const x=ox+i*sz, y=oy+j*sz;
      s += `<rect x="${x}" y="${y}" width="${sz}" height="${sz}" class="${c==='#'?'pt2':'pt'}"/>`;
      if(c==='C') s += `<rect x="${x+6}" y="${y+6}" width="22" height="22" class="ac-fill"/><path d="M${x+6} ${y+6} l22 22 M${x+28} ${y+6} l-22 22" class="ln thin"/>`;
      if(c==='S') s += `<circle cx="${x+17}" cy="${y+17}" r="9" class="ln" fill="none"/>`;
      if(c==='P') s += `<circle cx="${x+17}" cy="${y+17}" r="10" class="ink-fill"/>`;
      if(c==='D') s += `<rect x="${x+12}" y="${y+2}" width="10" height="30" class="warn-fill"/>`;
      if(c==='E') s += `<rect x="${x+6}" y="${y+6}" width="22" height="22" class="ln" fill="none"/>` + t(x+17,y+22,"E","tx sm b","middle");
    }));
    s += t(70,286,"P player   C crate   S switch   D door   E exit","tx sm mono");
    return { title: "Level 7 layout", caption: "Push both crates onto the switches to open the door to the exit.", svg: wrap(s, "Puzzle level grid") };
  };

  F.pgStates = () => {
    const n = (x,y,l,cls="pt") => `<rect x="${x}" y="${y}" width="110" height="40" rx="8" class="${cls}"/>` + t(x+55,y+25,l,"tx sm b","middle");
    const e = (d,l,lx,ly) => `<path d="${d}" class="arrow" fill="none"/>` + (l?t(lx,ly,l,"tx sm"):"");
    return { title: "Game states", caption: "State machine shared by every level scene.", svg: wrap(`
      ${n(20,40,"Main menu")}${n(185,40,"Playing","ac-soft")}${n(350,40,"Paused")}${n(185,170,"Level complete")}${n(20,170,"Checkpoint")}${n(350,170,"Next level")}
      ${e("M130 60 H185","Start",140,52)}${e("M295 55 H350","Esc",305,48)}${e("M350 70 H295","",0,0)}
      ${e("M240 80 V170","Exit tile",248,130)}${e("M185 190 C150 190 140 190 130 190","",0,0)}${e("M75 170 C75 120 150 100 190 80","Restart",60,130)}
      ${e("M295 190 H350","",0,0)}${e("M405 170 C405 120 330 100 290 80","Load",410,130)}`, "Game state diagram") };
  };

  /* ---------- Game assets ---------- */
  const pal = ["#1d2b53","#29366f","#3b5dc9","#41a6f6","#73eff7","#38b764","#a7f070","#257179","#ffcd75","#ef7d57","#b13e53","#5d275d","#f4f4f4","#94b0c2","#566c86","#333c57"];
  F.gaSprites = () => {
    const frames = 8; let s = ""; const sz = 52;
    const body = [[3,0],[4,0],[2,1],[3,1],[4,1],[5,1],[3,2],[4,2],[2,3],[3,3],[4,3],[5,3],[3,4],[4,4]];
    for (let f = 0; f < frames; f++) {
      const ox = 20 + (f % 4) * 112, oy = 30 + Math.floor(f / 4) * 130;
      s += `<rect x="${ox}" y="${oy}" width="${sz*1.8}" height="${sz*2}" class="pt" />`;
      const px = 10, bx = ox + 14, by = oy + 14;
      body.forEach(([i,j])=>{ s += `<rect x="${bx+i*px}" y="${by+j*px}" width="${px}" height="${px}" fill="${j<2?pal[8]:pal[2]}"/>`; });
      const leg = f % 2 ? [[2,5],[5,6]] : [[3,6],[4,5]];
      [[3,5],[4,5],...leg].forEach(([i,j])=>{ s += `<rect x="${bx+i*px}" y="${by+j*px}" width="${px}" height="${px}" fill="${pal[0]}"/>`; });
      s += `<rect x="${bx+3*px}" y="${by+px}" width="4" height="4" fill="${pal[0]}"/>` + t(ox+4, oy+sz*2-6, "f"+(f+1), "tx sm mono");
    }
    return { title: "Walk cycle sprite sheet", caption: "Eight frames at 32 × 32 px, played at 12 fps.", svg: wrap(s, "Sprite sheet frames") };
  };

  F.gaIcons = () => {
    const ic = [
      `<path d="M-14 6 L0 -12 L14 6 Z" />`, `<circle r="13"/><path d="M-5 -6 L8 0 L-5 6 Z" class="bgfill"/>`,
      `<rect x="-12" y="-12" width="24" height="24" rx="3"/>`, `<path d="M0 -14 L4 -4 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -4 Z"/>`,
      `<path d="M-12 -2 h8 v-10 h8 v10 h8 v8 h-8 v10 h-8 v-10 h-8 Z"/>`, `<circle r="13"/><circle r="6" class="bgfill"/>`,
      `<path d="M-13 -10 h26 v16 h-10 l-6 7 l-1 -7 h-9 Z"/>`, `<path d="M-6 -13 v26 M6 -13 v26" class="icstroke"/>`
    ];
    let s = "";
    ic.forEach((g,i)=>{ const x = 70 + (i%4)*110, y = 90 + Math.floor(i/4)*110;
      s += `<rect x="${x-36}" y="${y-36}" width="72" height="72" rx="14" class="pt"/><g transform="translate(${x} ${y})" class="icon">${g}</g>`; });
    return { title: "Interface icon set", caption: "Eight of 24 vector icons drawn on a shared 32 px grid.", svg: wrap(s, "Icon set") };
  };

  F.gaPalette = () => {
    let s = ""; pal.forEach((c,i)=>{ const x = 30 + (i%8)*54, y = 40 + Math.floor(i/8)*110;
      s += `<rect x="${x}" y="${y}" width="46" height="60" rx="4" fill="${c}" class="sw"/>` + t(x+23, y+78, c.slice(1).toUpperCase(), "tx sm mono", "middle"); });
    return { title: "Project palette", caption: "The 16 colour palette used across every sprite and environment painting.", svg: wrap(s, "Colour palette") };
  };

  /* ---------- Product video ---------- */
  F.pvTimeline = () => {
    const tracks = [["V2",[[60,20,"Titles"],[230,30,"Step labels"],[400,25,"End card"]]],["V1",[[0,95,"Setup"],[95,140,"Operation"],[235,95,"Close-up"],[330,120,"Wrap"]]],["A1",[[0,450,"Narration"]]],["A2",[[0,450,"Music bed, -18 dB"]]]];
    let s = ""; const x0 = 50, sc = 400/450;
    [0,60,120,180].forEach((sec,i)=>{ const x = x0 + (i*150)*sc; s += `<line x1="${x}" y1="30" x2="${x}" y2="260" class="grid"/>` + t(x, 24, `${i}:00`, "tx sm mono", "middle"); });
    tracks.forEach(([n,clips],j)=>{ const y = 44 + j*54; s += t(20, y+24, n, "tx sm b");
      clips.forEach(([a,w,l],k)=>{ s += `<rect x="${x0+a*sc}" y="${y}" width="${w*sc-2}" height="38" rx="4" class="${j<2?(k%2?'pt2':'ac-soft'):'pt'}"/>` + t(x0+a*sc+6, y+24, l, "tx sm"); }); });
    s += `<line x1="${x0+200*sc}" y1="30" x2="${x0+200*sc}" y2="270" class="ac-stroke thick"/>`;
    return { title: "Editing timeline", caption: "Main sequence of the three minute cut with title and narration tracks.", svg: wrap(s, "Video editing timeline") };
  };

  F.pvPoster = () => ({ title: "Poster frame", caption: "Opening frame of the main video with the title card and step label style.", svg: wrap(`
    <rect x="0" y="0" width="480" height="270" class="ink-fill"/>
    <rect x="250" y="60" width="160" height="150" rx="10" class="pt2"/><circle cx="330" cy="135" r="40" class="ac-fill"/><circle cx="330" cy="135" r="14" class="ink-fill"/>
    <rect x="40" y="90" width="6" height="70" class="ac-fill"/>
    ${t(58,116,"Setup and operation","tx lg inv b")}${t(58,144,"in under three minutes","tx inv")}
    <rect x="40" y="210" width="120" height="28" rx="4" class="ac-fill"/>${t(52,229,"STEP 1  Mount","tx sm b")}
    ${t(470,290,"1920 × 1080   H.264","tx sm mono","end")}`, "Video poster frame") });

  /* ---------- Rock imaging ---------- */
  F.riSlice = () => {
    const r = rng(11); let s = `<defs><clipPath id="core"><circle cx="170" cy="150" r="120"/></clipPath></defs><circle cx="170" cy="150" r="120" class="ct"/>`;
    let g = ""; for (let i = 0; i < 380; i++) { const a = r()*6.28, d = Math.sqrt(r())*118, x = 170+d*Math.cos(a), y = 150+d*Math.sin(a); g += `<circle cx="${x}" cy="${y}" r="${1+r()*2.5}" class="ct-grain"/>`; }
    let p = ""; for (let i = 0; i < 60; i++) { const a = r()*6.28, d = Math.sqrt(r())*110, x = 170+d*Math.cos(a), y = 150+d*Math.sin(a), rr = 2+r()*7; p += `<ellipse cx="${x}" cy="${y}" rx="${rr}" ry="${rr*(.5+r()*.6)}" transform="rotate(${r()*180} ${x} ${y})" class="pore"/>`; }
    s += `<g clip-path="url(#core)">${g}${p}</g><circle cx="170" cy="150" r="120" class="ln" fill="none"/>`;
    s += `<rect x="330" y="70" width="16" height="16" class="pore"/>${t(354,83,"Pore phase","tx sm")}<rect x="330" y="100" width="16" height="16" class="ct"/>${t(354,113,"Solid phase","tx sm")}`;
    s += t(330,150,"Sample R-03, slice 412","tx sm b") + t(330,170,"Voxel 25 µm isotropic","tx sm") + t(330,190,"Porosity 14.2 %","tx sm");
    s += `<line x1="60" y1="285" x2="140" y2="285" class="ln thick"/>` + t(100,278,"2 mm","tx sm","middle");
    return { title: "CT slice with segmentation overlay", caption: "Pore phase highlighted over the greyscale CT slice of sample R-03.", svg: wrap(s, "CT slice segmentation") };
  };

  F.riMap = () => {
    const sites = [["R-01",120,90,11.6],["R-02",170,130,13.1],["R-03",250,110,14.2],["R-04",300,180,15.9],["R-05",210,220,16.4],["R-06",360,90,17.8]];
    let s = `<rect x="30" y="20" width="420" height="250" class="pt"/>`;
    s += `<path d="M30 200 C120 170 180 260 300 230 S420 150 450 170" class="water"/><path d="M60 20 C90 100 60 160 120 270" class="grid" fill="none"/>`;
    [100,170,240,310,380].forEach(x=> s+= `<line x1="${x}" y1="20" x2="${x}" y2="270" class="grid"/>`); [80,140,200,260].forEach(y=> s+=`<line x1="30" y1="${y}" x2="450" y2="${y}" class="grid"/>`);
    sites.forEach(([id,x,y,p])=>{ const rr = 5 + (p-11)*1.3; s += `<circle cx="${x}" cy="${y}" r="${rr}" class="ac-fill site"/>` + t(x+rr+4, y+4, `${id}  ${p}%`, "tx sm b"); });
    s += t(440,262,"WGS 84","tx sm mono","end") + `<path d="M420 40 l8 20 l-8 -6 l-8 6 Z" class="ink-fill"/>` + t(420,74,"N","tx sm b","middle");
    s += t(40,290,"Marker size scales with porosity","tx sm");
    return { title: "Sampling location map", caption: "Six collection sites joined to their porosity measurements by sample identifier.", svg: wrap(s, "Sampling map") };
  };

  F.riTable = () => {
    const rows = [["R-01","1.82","3.31","11.6"],["R-02","1.79","3.47","13.1"],["R-03","1.85","3.88","14.2"],["R-04","1.80","4.25","15.9"],["R-05","1.83","4.47","16.4"],["R-06","1.81","4.77","17.8"]];
    const xs = [30,140,270,390]; let s = `<rect x="16" y="20" width="448" height="30" class="ac-soft"/>`;
    ["Sample","Bulk volume, cm³","Pore volume, cm³","Porosity, %"].forEach((h,i)=> s += t(xs[i],40,h,"tx sm b"));
    rows.forEach((r,j)=>{ const y = 76 + j*34; s += `<line x1="16" y1="${y+12}" x2="464" y2="${y+12}" class="ln thin"/>`; r.forEach((c,i)=> s += t(xs[i], y, c, "tx sm mono")); });
    return { title: "Measurement table", caption: "Bulk and pore volume per sample from the 3D Slicer segmentation.", svg: wrap(s, "Measurement table") };
  };

  /* ---------- BOM records ---------- */
  F.bomRevision = () => {
    const rows = [["A","Initial release","All"],["B","Bracket thickness 5 to 6 mm","Mfg"],["C","Fastener change to M8","Proc"],["D","Cover material to PC","Mfg, Proc"]];
    const xs = [30,80,360]; let s = `<rect x="16" y="20" width="448" height="30" class="ac-soft"/>`;
    ["Rev","Change","Notified"].forEach((h,i)=> s += t(xs[i],40,h,"tx sm b"));
    rows.forEach((r,j)=>{ const y = 84 + j*48; s += `<line x1="16" y1="${y+18}" x2="464" y2="${y+18}" class="ln thin"/>`; r.forEach((c,i)=> s += t(xs[i], y, c, i===0?"tx sm b":"tx sm")); });
    return { title: "Revision record", caption: "Revision log entries with the change and the teams notified.", svg: wrap(s, "Revision record table") };
  };

  F.bomFlow = () => {
    const n = (x,y,l,cls="pt") => `<rect x="${x}" y="${y}" width="120" height="44" rx="8" class="${cls}"/>` + t(x+60,y+27,l,"tx sm b","middle");
    const a = (x1,y1,x2,y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="arrow"/>`;
    return { title: "Document update process", caption: "How a design review change moves through the BOM and drawings before release.", svg: wrap(`
      ${n(20,40,"Design review")}${n(180,40,"Update CAD")}${n(340,40,"Update drawing")}
      ${n(340,150,"Update BOM","ac-soft")}${n(180,150,"Cross check")}${n(20,150,"Release")}
      ${a(140,62,180,62)}${a(300,62,340,62)}${a(400,84,400,150)}${a(340,172,300,172)}${a(180,172,140,172)}
      <path d="M240 194 C240 250 400 250 400 200" class="arrow dash" fill="none"/>${t(320,262,"Mismatch found","tx sm","middle")}`, "Document update flow") };
  };

  window.FIGURES = F;
})();
