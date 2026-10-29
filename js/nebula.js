/* Living Nebula. No network assets, no changes to portfolio content or navigation. */
(function () {
  "use strict";
  const layer = document.createElement("div");
  layer.id = "nebula";
  layer.setAttribute("aria-hidden", "true");
  const canvas = document.createElement("canvas");
  layer.appendChild(canvas);
  document.body.prepend(layer);
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
  if (!gl) return; // The CSS nebula remains when WebGL is unavailable.

  const vertex = `attribute vec2 position;
    varying vec2 uv;
    void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
  const fragment = `#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    varying vec2 uv;
    uniform vec2 res, mouse;
    uniform float time, pulse;
    float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
    float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*noise(p);p=mat2(.8,.6,-.6,.8)*p*2.03+1.7;a*=.5;}return s;}
    void main(){
      float aspect=res.x/res.y,small=step(aspect,.86);
      vec2 center=mix(vec2(.77,.54),vec2(.64,.26),small);
      vec2 q=(uv-center)*vec2(aspect,1.)*mix(1.,1.35,small);
      vec2 p=q*4.7-mouse*.7;
      float stir=sin(length(p-mouse*2.)*4.-pulse*9.)*pulse*.1;
      p+=vec2(stir);
      vec2 warp=vec2(fbm(p+vec2(time*.08,-time*.03)),fbm(p+vec2(4.1,-time*.08)));
      float f=fbm(p+warp*3.+vec2(time*.03,-time*.04));
      float ribbons=fbm(p*1.7-warp*2.+time*.035);
      vec3 field=mix(vec3(.584,.318,.957),vec3(1.,.376,.612),smoothstep(.30,.72,f));
      field=mix(field,vec3(.278,.784,.875),smoothstep(.47,.75,ribbons));
      field*=smoothstep(.22,.8,f)*.8+.12;
      float mask=exp(-dot(q*vec2(.8,1.),q*vec2(.8,1.))*2.);
      vec3 color=mix(vec3(.0745,.0549,.153),field,mask*.90);
      color+=vec3(1.,.953,1.)*pow(max(0.,1.-abs(f-.50)*14.),9.)*.025;
      float stars=pow(noise(uv*res*.35),44.);
      color+=vec3(1.,.953,1.)*stars*.26;
      color+=(hash(uv*res)-.5)*.009;
      gl_FragColor=vec4(clamp(color,0.,1.),1.);
    }`;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
    return shader;
  }
  const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) { canvas.remove(); return; }
  const program = gl.createProgram();
  gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  gl.deleteShader(vs); gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniforms = Object.fromEntries(["res", "mouse", "time", "pulse"].map(key => [key, gl.getUniformLocation(program, key)]));
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const toggle = document.createElement("button");
  toggle.className = "nebula-toggle"; toggle.type = "button";
  toggle.setAttribute("aria-controls", "nebula");
  document.body.appendChild(toggle);
  let paused = motion.matches, lost = false, frame = 0, last = 0, time = 12, pulse = 0;
  let x = 0, y = 0, targetX = 0, targetY = 0;
  try { paused = paused || sessionStorage.getItem("nebula-paused") === "true"; } catch (_) { /* Storage is optional. */ }
  function label() { toggle.textContent = paused ? "Play background" : "Pause background"; }
  function draw() {
    gl.uniform2f(uniforms.res, canvas.width, canvas.height);
    gl.uniform2f(uniforms.mouse, x, y);
    gl.uniform1f(uniforms.time, time); gl.uniform1f(uniforms.pulse, pulse);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  function tick(now) {
    frame = 0;
    if (paused || lost || document.hidden) return;
    if (now - last >= 1000 / 30) {
      const dt = Math.min((now - last) / 1000, .1); last = now;
      time += dt * .7; pulse = Math.max(0, pulse - dt * .4);
      x += (targetX - x) * .10; y += (targetY - y) * .10;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = performance.now(); label();
    if (!paused && !lost && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function resize() {
    if (lost) return;
    // Cap the pixel count because the portfolio also contains 3D project demos.
    const ratio = Math.min(devicePixelRatio || 1, 1.25, Math.sqrt(1100000 / (innerWidth * innerHeight)));
    canvas.width = Math.max(1, Math.round(innerWidth * ratio));
    canvas.height = Math.max(1, Math.round(innerHeight * ratio));
    gl.viewport(0, 0, canvas.width, canvas.height); draw();
  }
  toggle.addEventListener("click", () => {
    paused = !paused;
    try { sessionStorage.setItem("nebula-paused", String(paused)); } catch (_) { /* Storage is optional. */ }
    sync();
  });
  motion.addEventListener("change", () => { paused = motion.matches; sync(); });
  document.addEventListener("visibilitychange", sync);
  addEventListener("resize", resize, { passive: true });
  addEventListener("pointermove", event => {
    if (paused || event.pointerType === "touch") return;
    targetX = event.clientX / innerWidth - .5; targetY = .5 - event.clientY / innerHeight;
  }, { passive: true });
  document.addEventListener("pointerleave", () => { targetX = 0; targetY = 0; });
  addEventListener("pointerdown", event => {
    if (paused || event.target.closest("a,button,input,select,textarea,summary,.three-wrap,.demo-host")) return;
    targetX = event.clientX / innerWidth - .5; targetY = .5 - event.clientY / innerHeight; pulse = 1;
  }, { passive: true });
  canvas.addEventListener("webglcontextlost", () => { lost = true; sync(); canvas.hidden = true; toggle.hidden = true; });
  resize(); sync();
})();
