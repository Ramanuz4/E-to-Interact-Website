/* ============================================================
   E TO INTERACT — particles.js
   One canvas, biome-aware emitters. Old particles die out
   naturally when the biome changes, so worlds crossfade.
   ============================================================ */
(function () {
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  let W = 0, H = 0, DPR = 1;
  let pool = [];
  let currentKey = "spawn";
  let density = 1;       // 1 = High, .4 = Low, 0 = Off

  function resize() {
    // Particles are small soft squares, so they don't need a crisp 2x canvas.
    // Capping the backing store at 1.5x (and never above the CSS size) cuts
    // the per-frame clear+fill cost a lot on large desktop screens, which was
    // a real source of lag, with no visible quality loss.
    DPR = Math.min(1.5, window.devicePixelRatio || 1);
    // The canvas is confined to the lane panel, so size it to the PANEL's box.
    // Measure the panel (#viewport), not the canvas itself — the canvas carries
    // an inline pixel width from a previous resize, so measuring it would read a
    // stale value and never shrink on window resize.
    const vp = document.getElementById("viewport");
    const r = vp ? vp.getBoundingClientRect() : canvas.getBoundingClientRect();
    W = Math.round(r.width) || window.innerWidth;
    H = Math.round(r.height) || window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  let _rzT;
  window.addEventListener("resize", () => { clearTimeout(_rzT); _rzT = setTimeout(resize, 150); });
  resize();
  // the panel may not be laid out at init; re-measure once it is
  requestAnimationFrame(() => requestAnimationFrame(resize));

  function rand(a, b) { return a + Math.random() * (b - a); }

  function activeConfig() {
    const cfg = ETI.CONFIG.particles;
    const night = document.body.dataset.time === "night";
    if (currentKey === "forest" && night && cfg.forestNight) return cfg.forestNight; // fireflies
    return cfg[currentKey] || cfg.spawn;
  }

  // Reset an existing particle object in place (no allocation) so we never
  // churn the garbage collector while recycling — GC pauses were a cause of
  // the periodic frame spikes.
  function reset(p, cfg, anywhere) {
    const goingUp = cfg.vy[0] < 0;
    p.x = rand(0, W);
    p.y = anywhere ? rand(0, H) : (goingUp ? H + 10 : -10);
    p.vx = rand(cfg.vx[0], cfg.vx[1]);
    p.vy = rand(cfg.vy[0], cfg.vy[1]);
    p.size = rand(cfg.size[0], cfg.size[1]);
    p.color = cfg.colors[(Math.random() * cfg.colors.length) | 0];
    p.life = 1;
    p.decay = cfg.fade ? rand(0.15, 0.4) : 0;
    p.glow = !!cfg.glow;
    p.wob = rand(0, Math.PI * 2);
    p.key = currentKey + (document.body.dataset.time === "night" ? "-n" : "-d");
    p.dead = false;
    return p;
  }

  function update(dt) {
    if (density === 0) { if (pool.length) pool.length = 0; return; }
    const cfg = activeConfig();
    const target = Math.round(cfg.count * density);
    const keyNow = currentKey + (document.body.dataset.time === "night" ? "-n" : "-d");

    // count how many belong to the current biome
    let mine = 0;
    for (let i = 0; i < pool.length; i++) if (pool[i].key === keyNow) mine++;
    // top up (reuse a blank object; reset() fills it)
    while (mine < target) { pool.push(reset({}, cfg, mine < 4)); mine++; }

    let anyDead = false;
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      p.wob += dt * 2;
      p.x += (p.vx + Math.sin(p.wob) * 6) * dt;
      p.y += p.vy * dt;
      if (p.decay) p.life -= p.decay * dt;
      const off = p.y > H + 20 || p.y < -20 || p.x < -30 || p.x > W + 30 || p.life <= 0;
      if (off) {
        if (p.key === keyNow) reset(p, cfg, false);   // recycle in place
        else { p.dead = true; anyDead = true; }
      }
    }

    // compact only when something actually died — swap-remove, no allocation
    if (anyDead) {
      let n = 0;
      for (let i = 0; i < pool.length; i++) {
        if (!pool[i].dead) { if (i !== n) pool[n] = pool[i]; n++; }
      }
      pool.length = n;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (!pool.length) return;

    // Draw all non-glow particles first (no shadow state), then glow ones
    // in a single pass — toggling shadowBlur per particle is expensive, so
    // we change canvas state at most twice per frame instead of once each.
    ctx.shadowBlur = 0;
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      if (p.glow) continue;
      const s = p.size;
      ctx.globalAlpha = (p.life < 1 ? Math.max(0, p.life) : 1) * 0.9;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    }

    let anyGlow = false;
    for (let i = 0; i < pool.length; i++) { if (pool[i].glow) { anyGlow = true; break; } }
    if (anyGlow) {
      ctx.shadowBlur = 8;
      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (!p.glow) continue;
        const s = p.size;
        ctx.globalAlpha = (p.life < 1 ? Math.max(0, p.life) : 1) * 0.9;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  ETI.particles = {
    setBiome(key) { currentKey = key; },
    setDensity(v) { density = v; },
    tick(dt) { update(dt); draw(); }
  };
})();