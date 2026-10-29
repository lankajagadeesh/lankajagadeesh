(function () {
  const D = window.PORTFOLIO, FIG = window.FIGURES;
  const app = document.getElementById("app");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const byId = id => D.projects.find(p => p.id === id);
  const ordered = [...D.featured.map(byId), ...D.projects.filter(p => !D.featured.includes(p.id))];
  let activeFilter = "All";
  try { activeFilter = sessionStorage.getItem("pf-filter") || "All"; } catch (e) {}

  const toolsLine = p => p.tools.map(t => t[0]).join(" · ");
  const DEMO_LABEL = { "puzzle-game": "Playable in the browser", "game-assets": "Playable in the browser", "motor-mount": "Interactive 3D assembly", "bracket-fea": "Interactive stress check", "enclosure-cfd": "Interactive airflow model", "turtlebot": "Interactive robot simulation", "rock-imaging": "Interactive CT viewer", "product-video": "Playable 3D cut", "bom-records": "Interactive BOM check" };
  let cleanup = null, heroCleanup = null;
  const fig = (name, opts = {}) => {
    const f = FIG[name]();
    return opts.thumb ? `<div class="thumb" data-thumb="${opts.id || ""}">${f.svg}</div>` :
      `<figure class="fig"><div class="fig-art">${f.svg}</div><figcaption><strong>${esc(f.title)}</strong> ${esc(f.caption)}</figcaption></figure>`;
  };

  function card(p) {
    const featured = D.featured.includes(p.id);
    return `<article class="card" data-tilt data-filters="${esc(p.filters.join("|"))}">
      <a class="card-link" href="#project-${p.id}" aria-label="${esc(p.title)}, view project">
        ${fig(p.figures[0], { thumb: true, id: p.id })}
        <div class="card-body">
          <div class="card-meta"><span class="num">${p.num}</span><span>${esc(p.area)}</span></div>
          <span class="try">${esc(DEMO_LABEL[p.id])}</span>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.summary)}</p>
          <p class="tools-line">${esc(toolsLine(p))}</p>
        </div>
      </a>
          </article>`;
  }

  function home() {
    const P = D.person;
    return `
    <section class="hero wrap" id="top">
      <div class="hero-text">
        <p class="eyebrow">${esc(P.location)}</p>
        <h1>${esc(P.shortName)}</h1>
        <p class="headline">${esc(P.headline)}</p>
        <p class="lede">${esc(P.intro)}</p>
        <div class="actions">
          <a class="btn primary" href="#work">See selected work</a>
          <a class="btn" href="${esc(P.resume)}" download>Download resume (PDF)</a>
          <a class="btn" href="#contact">Get in touch</a>
        </div>
        
      </div>
      <div class="hero-visual"><div id="hero3d"></div>
      <p class="hero-caption"><span>Gear train, drag to turn it</span><span>MEng, University of Cincinnati, Dec 2026</span></p></div>
    </section>

    <section class="band" id="work" aria-labelledby="work-h">
      <div class="wrap">
        <div class="sec-head"><h2 id="work-h">Selected work</h2><p>Mechanical design, simulation, and robotics come first. Interactive, visual, and documentation work follows.</p></div>
        <div class="filters" role="group" aria-label="Filter projects">
          ${["All", ...D.filters].map(f => `<button type="button" class="chip" id="f-${f.replace(/\s/g, "")}" aria-pressed="${f === activeFilter}" data-f="${esc(f)}">${esc(f)}</button>`).join("")}
        </div>
        <p class="filter-status" aria-live="polite"></p>
        <div class="grid">${ordered.map(card).join("")}</div>
      </div>
    </section>

    <section class="wrap sec" id="capabilities" aria-labelledby="cap-h">
      <div class="sec-head"><h2 id="cap-h">Capabilities</h2></div>
      <div class="caps">${D.capabilities.map(c => `<div class="cap"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div>`).join("")}</div>
    </section>

    <section class="wrap sec" id="process" aria-labelledby="proc-h">
      <div class="sec-head"><h2 id="proc-h">How I work</h2></div>
      <ol class="process">${D.process.map(s => `<li><h3>${esc(s.step)}</h3><p>${esc(s.text)}</p></li>`).join("")}</ol>
    </section>

    <section class="band" id="tools" aria-labelledby="tools-h">
      <div class="wrap">
        <div class="sec-head"><h2 id="tools-h">Tool experience</h2><p>${esc(D.toolNote)}</p></div>
        <div class="toolgroups">
          ${D.tools.map(g => `<details class="tg" ${["Mechanical CAD", "Finite element analysis", "Computational fluid dynamics"].includes(g.group) ? "open" : ""}>
            <summary><span>${esc(g.group)}</span><span class="count">${g.items.length}</span></summary>
            <dl>${g.items.map(i => `<div><dt><button type="button" class="toolb" data-tool="${esc(i[0])}">${esc(i[0])}</button></dt><dd>${esc(i[1])}</dd></div>`).join("")}</dl>
          </details>`).join("")}
        </div>
        <div class="tool-find" aria-live="polite" id="tool-find"><span class="muted">Select any tool to see where I used it.</span></div>
        <p class="supporting"><strong>Also from my resume:</strong> ${D.supportingTools.map(esc).join(", ")}</p>
      </div>
    </section>

    <section class="wrap sec about" id="about" aria-labelledby="about-h">
      <div class="sec-head"><h2 id="about-h">About</h2></div>
      <div class="about-grid">
        <div class="prose">${P.about.map(p => `<p>${esc(p)}</p>`).join("")}</div>
        <div class="edu">
          ${P.education.map(e => `<div class="edu-item"><strong>${esc(e.degree)}</strong><span>${esc(e.school)}</span><span class="muted">${esc(e.note)}</span></div>`).join("")}
          <div class="edu-item"><strong>Certification</strong><span>${esc(P.certification)}</span></div>
        </div>
      </div>
    </section>

    <section class="band" id="experience" aria-labelledby="exp-h">
      <div class="wrap">
        <div class="sec-head"><h2 id="exp-h">Experience</h2></div>
        <div class="exp-time" aria-hidden="true">${D.experience.map((e, i) => `<span class="exp-bar" style="left:${e.span[0]}%;width:${e.span[1] - e.span[0]}%" data-i="${i}"></span>`).join("")}<div class="exp-years">${[["Jan 2022",0],["2023",20],["2024",40],["2025",60],["2026",80],["Dec 2026",100]].map(([y, x]) => `<span style="left:${x}%">${y}</span>`).join("")}</div></div>
        <ol class="exp">${D.experience.map((e, i) => `<li data-i="${i}"><button type="button" class="exp-btn" aria-expanded="false" aria-controls="exp-d-${i}"><span class="exp-date">${esc(e.dates)}</span><span class="exp-main"><strong>${esc(e.role)}</strong><span class="exp-org">${esc(e.org)}</span></span><span class="exp-plus" aria-hidden="true">+</span></button>
          <div class="exp-detail" id="exp-d-${i}" hidden><p>${esc(e.text)}</p><ul class="ticks">${e.details.map(d => `<li>${esc(d)}</li>`).join("")}</ul>${e.skills ? `<p class="tools-line">${esc(e.skills.join(" · "))}</p>` : ""}${e.link ? `<a class="btn small" href="#project-${e.link}">See related project</a>` : ""}</div></li>`).join("")}</ol>
      </div>
    </section>

    ${contact()}`;
  }

  function contact() {
    const P = D.person;
    return `<section class="contact" id="contact" aria-labelledby="contact-h">
      <div class="wrap">
        <h2 id="contact-h">Let us talk about your project</h2>
        <p>I am happy to discuss engineering design, simulation, interactive development, or technical documentation needs.</p>
        <div class="contact-rows">
          <div class="crow"><span class="clabel">Email</span><span class="cval" id="email-text">${esc(P.email)}</span>
            <a class="btn small" href="mailto:${esc(P.email)}">Write an email</a>
            <button type="button" class="btn small" id="copy-email">Copy address</button></div>
          <div class="crow"><span class="clabel">Resume</span><span class="cval">PDF, 1 file</span>
            <a class="btn small" href="${esc(P.resume)}" download>Download resume</a>
            <a class="btn small" href="${esc(P.resume)}" target="_blank" rel="noopener">Open in browser</a></div>
          <div class="crow"><span class="clabel">LinkedIn</span><span class="cval">${esc(P.linkedinLabel)}</span>
            <a class="btn small" href="${esc(P.linkedin)}" target="_blank" rel="noopener">Open profile</a></div>
        </div>
        <p class="copy-status" aria-live="polite"></p>
      </div>
    </section>`;
  }

  function detail(p) {
    const i = ordered.indexOf(p), prev = ordered[(i - 1 + ordered.length) % ordered.length], next = ordered[(i + 1) % ordered.length];
    return `<article class="detail wrap">
      <a class="back" href="#work">&larr; All projects</a>
      <header class="d-head">
        <div class="card-meta"><span class="num">${p.num}</span><span>${esc(p.area)}</span>${p.filters.map(f => `<span class="badge">${esc(f)}</span>`).join("")}</div>
        <h1>${esc(p.title)}</h1>
        <p class="lede">${esc(p.summary)}</p>
        <p class="tools-line">${esc(toolsLine(p))}</p>
      </header>
      <dl class="metrics">${p.metrics.map(m => `<div><dt>${esc(m[0])}</dt><dd>${esc(m[1])}</dd></div>`).join("")}</dl>
      <section class="demo" aria-labelledby="demo-h"><h2 id="demo-h" class="demo-h">${esc(DEMO_LABEL[p.id])}</h2><div class="demo-host" id="demo-host"></div></section>
      <div class="d-grid">
        <div class="d-main">
          <section><h2>Overview</h2><p>${esc(p.description)}</p></section>
          <section><h2>My role</h2><p>${esc(p.role)}</p></section>
          <section><h2>Workflow</h2><ol class="steps">${p.workflow.map(w => `<li><strong>${esc(w[0])}</strong><span>${esc(w[1])}</span></li>`).join("")}</ol></section>
        </div>
        <aside class="d-side">
          <section><h2>Why these tools</h2><dl class="why">${p.tools.map(t => `<div><dt>${esc(t[0])}</dt><dd>${esc(t[1])}</dd></div>`).join("")}</dl></section>
          <section><h2>Checks</h2><ul class="ticks">${p.checks.map(c => `<li>${esc(c)}</li>`).join("")}</ul></section>
          <section><h2>Deliverables</h2><ul class="ticks">${p.deliverables.map(c => `<li>${esc(c)}</li>`).join("")}</ul></section>
        </aside>
      </div>
      <section class="gallery-sec"><h2>Gallery</h2><div class="gallery">${p.figures.map(f => fig(f)).join("")}</div></section>
      <nav class="pn" aria-label="More projects">
        <a href="#project-${prev.id}"><span>Previous</span>${esc(prev.title)}</a>
        <a href="#project-${next.id}" class="nx"><span>Next</span>${esc(next.title)}</a>
      </nav>
    </article>`;
  }

  function applyFilter() {
    const cards = app.querySelectorAll(".card");
    let n = 0;
    cards.forEach(c => { const show = activeFilter === "All" || c.dataset.filters.split("|").includes(activeFilter); c.hidden = !show; if (show) n++; });
    app.querySelectorAll(".chip").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.f === activeFilter)));
    const st = app.querySelector(".filter-status");
    if (st) st.textContent = activeFilter === "All" ? `Showing all ${n} projects` : `Showing ${n} ${n === 1 ? "project" : "projects"} in ${activeFilter}`;
  }

  function wire() {
    app.querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => {
      activeFilter = b.dataset.f; try { sessionStorage.setItem("pf-filter", activeFilter); } catch (e) {} applyFilter();
    }));
    const cp = document.getElementById("copy-email");
    if (cp) cp.addEventListener("click", () => {
      const st = app.querySelector(".copy-status");
      navigator.clipboard.writeText(D.person.email).then(() => { st.textContent = "Email address copied"; })
        .catch(() => { const r = document.createRange(); r.selectNodeContents(document.getElementById("email-text")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); st.textContent = "Address selected, press Ctrl+C to copy"; });
    });
    app.querySelectorAll(".exp-btn").forEach(b => b.addEventListener("click", () => {
      const li = b.closest("li"), d = li.querySelector(".exp-detail"), open = d.hidden;
      d.hidden = !open; b.setAttribute("aria-expanded", String(open)); li.classList.toggle("open", open);
      app.querySelector(`.exp-bar[data-i="${li.dataset.i}"]`).classList.toggle("on", open);
    }));
    app.querySelectorAll(".exp > li").forEach(li => {
      const bar = () => app.querySelector(`.exp-bar[data-i="${li.dataset.i}"]`);
      li.addEventListener("pointerenter", () => bar().classList.add("hover")); li.addEventListener("pointerleave", () => bar().classList.remove("hover"));
    });
    app.querySelectorAll(".toolb").forEach(b => b.addEventListener("click", () => {
      const name = b.dataset.tool.toLowerCase(), parts = name.split(/,\s*| \/ | or /).map(s => s.trim()).filter(Boolean);
      const hits = D.projects.filter(p => p.tools.some(t => parts.some(x => t[0].toLowerCase().includes(x))));
      app.querySelectorAll(".toolb").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      document.getElementById("tool-find").innerHTML = `<strong>${esc(b.dataset.tool)}</strong> ${hits.length ? `used in ${hits.map(p => `<a href="#project-${p.id}">${esc(p.title)}</a>`).join(", ")}` : "is part of my wider toolset, not featured in these nine projects."}`;
    }));
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.remove("pre"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
      app.querySelectorAll(".sec-head, .card, .cap, .process li, .tg, .exp > li").forEach(el => { const r = el.getBoundingClientRect(); if (r.top > innerHeight) { el.classList.add("reveal", "pre"); io.observe(el); } });
    }
    applyFilter();
  }

  function route() {
    const h = location.hash.slice(1);
    const nav = document.getElementById("site-nav"); nav.classList.remove("open");
    document.getElementById("menu-btn").setAttribute("aria-expanded", "false");
    if (h.startsWith("project-") && byId(h.slice(8))) {
      const p = byId(h.slice(8));
      if (cleanup) { cleanup(); cleanup = null; }
      if (heroCleanup) { heroCleanup(); heroCleanup = null; }
      app.innerHTML = detail(p);
      try { cleanup = window.DEMOS[p.id](document.getElementById("demo-host")) || null; } catch (err) { console.error(err); }
      document.title = `${p.title} | Jagadeesh Lanka`;
      window.scrollTo(0, 0);
      app.querySelector("h1").setAttribute("tabindex", "-1"); app.querySelector("h1").focus({ preventScroll: true });
    } else {
      if (cleanup) { cleanup(); cleanup = null; }
      if (!app.querySelector("#work")) { app.innerHTML = home(); wire(); try { const h1 = window.mountHero3D(document.getElementById("hero3d")); const h2 = window.mountCards3D ? window.mountCards3D(app) : () => {}; heroCleanup = () => { h1(); h2(); }; } catch (err) { console.error(err); } }
      document.title = "Jagadeesh Lanka Portfolio";
      const el = h && document.getElementById(h);
      if (el) el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      else window.scrollTo(0, 0);
    }
  }

  document.getElementById("menu-btn").addEventListener("click", e => {
    const nav = document.getElementById("site-nav"), open = nav.classList.toggle("open");
    e.currentTarget.setAttribute("aria-expanded", String(open));
  });
  document.getElementById("year").textContent = new Date().getFullYear();
  window.addEventListener("hashchange", route);
  route();
})();
