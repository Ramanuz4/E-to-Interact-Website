/* ============================================================
   E TO INTERACT — world.js
   Builds the tall world: Spawn at the bottom, Sky Temple at the
   top, unique crossings in between. Also owns biome detection
   and the sky crossfade.
   ============================================================ */
(function () {
  const C = ETI.CONFIG;
  const worldEl = document.getElementById("world");

  const zones = [];         // {y0, y1, biome, id, name}
  const interactables = []; // {y, label, action, el}
  let totalHeight = 0;

  /* ---------- decor helpers ---------- */
  function d(cls, styles) {
    const e = document.createElement("div");
    e.className = "decor " + cls;
    Object.assign(e.style, styles);
    return e;
  }

  function decorate(sec, biome, h) {
    const add = (el) => sec.appendChild(el);

    // shared ground strip at the base of most lands
    function ground(cls) {
      add(d("ground " + cls, { bottom: "0px", left: "0", width: "100%" }));
    }

    switch (biome) {
      case "spawn": {
        ground("g-grass");
        // a proper little campsite: tent, campfire with logs, rocks, a lantern
        const tent = d("tent", { left: "calc(50% - 210px)", top: h * 0.5 + "px" });
        add(tent);
        const fire = d("campfire", { left: "calc(50% - 40px)", top: h * 0.62 + "px" });
        fire.appendChild(d("flame", {}));
        fire.appendChild(d("log l1", {}));
        fire.appendChild(d("log l2", {}));
        add(fire);
        add(d("rock", { left: "calc(50% + 120px)", top: h * 0.66 + "px" }));
        add(d("rock r2", { left: "calc(50% - 120px)", top: h * 0.72 + "px" }));
        add(d("logpost", { left: "calc(50% + 150px)", top: h * 0.5 + "px" }));
        add(d("bush", { right: "10%", top: h * 0.68 + "px" }));
        add(d("bush", { left: "6%", top: h * 0.6 + "px" }));
        add(d("tree t3", { right: "18%", top: h * 0.38 + "px" }));
        add(d("cloud-bg", { left: "12%", top: h * 0.12 + "px" }));
        add(d("cloud-bg c2", { right: "16%", top: h * 0.2 + "px" }));
        break;
      }

      case "forest": {
        ground("g-forest");
        // dense treeline: back row (small, dim) + front row (big)
        const back = [10, 22, 34, 48, 62, 76, 88];
        back.forEach((x, i) => add(d("tree tb", { left: x + "%", top: (h * (0.2 + (i % 3) * 0.05)) + "px" })));
        add(d("tree t2", { left: "12%", top: h * 0.42 + "px" }));
        add(d("tree",    { left: "26%", top: h * 0.6 + "px" }));
        add(d("tree t2", { right: "14%", top: h * 0.5 + "px" }));
        add(d("tree",    { right: "28%", top: h * 0.68 + "px" }));
        add(d("tree t3", { left: "42%", top: h * 0.78 + "px" }));
        // undergrowth
        add(d("bush", { left: "8%", top: h * 0.72 + "px" }));
        add(d("bush", { right: "10%", top: h * 0.74 + "px" }));
        add(d("bush", { left: "34%", top: h * 0.82 + "px" }));
        add(d("mushroom", { left: "20%", top: h * 0.8 + "px" }));
        add(d("mushroom m2", { right: "22%", top: h * 0.83 + "px" }));
        add(d("log-fallen", { left: "calc(50% - 90px)", top: h * 0.86 + "px" }));
        break;
      }

      case "castle": {
        ground("g-stone");
        // a fuller keep: two big towers, a central gatehouse, banners, battlements
        const t1 = d("tower", { left: "9%", top: h * 0.26 + "px" });
        t1.appendChild(d("flag", {}));
        const t2 = d("tower", { right: "9%", top: h * 0.26 + "px" });
        t2.appendChild(d("flag", {}));
        const gate = d("gatehouse", { left: "calc(50% - 90px)", top: h * 0.44 + "px" });
        gate.appendChild(d("gate-door", {}));
        add(t1); add(t2); add(gate);
        add(d("wall", { left: "0", top: h * 0.5 + "px" }));
        add(d("banner", { left: "22%", top: h * 0.5 + "px" }));
        add(d("banner b2", { right: "22%", top: h * 0.5 + "px" }));
        add(d("torch-wall", { left: "calc(50% - 130px)", top: h * 0.5 + "px" }));
        add(d("torch-wall", { left: "calc(50% + 118px)", top: h * 0.5 + "px" }));
        break;
      }

      case "studio": {
        ground("g-floor");
        // a game studio: desks with glowing monitors, a whiteboard, shelves, a plant
        const desk1 = d("desk", { left: "12%", top: h * 0.42 + "px" });
        desk1.appendChild(d("screen", {}));
        desk1.appendChild(d("screen s2", {}));
        const desk2 = d("desk", { right: "12%", top: h * 0.6 + "px" });
        desk2.appendChild(d("screen", {}));
        add(desk1); add(desk2);
        add(d("whiteboard", { left: "calc(50% - 80px)", top: h * 0.3 + "px" }));
        add(d("shelf", { right: "14%", top: h * 0.32 + "px" }));
        add(d("plant", { left: "8%", top: h * 0.62 + "px" }));
        add(d("plant p2", { right: "8%", top: h * 0.44 + "px" }));
        add(d("poster", { left: "30%", top: h * 0.34 + "px" }));
        add(d("arcade", { left: "calc(50% + 120px)", top: h * 0.5 + "px" }));
        break;
      }

      case "space": {
        // deep-space station interior + a planet out the window
        add(d("planet",   { left: "8%",  top: h * 0.2 + "px" }));
        add(d("planet pm", { right: "12%", top: h * 0.72 + "px" }));
        add(d("porthole", { right: "14%", top: h * 0.32 + "px" }));
        add(d("porthole", { left: "16%",  top: h * 0.56 + "px", transform: "scale(.72)" }));
        add(d("console", { left: "calc(50% - 120px)", top: h * 0.5 + "px" }));
        add(d("console cr", { left: "calc(50% + 30px)", top: h * 0.5 + "px" }));
        add(d("satellite", { right: "24%", top: h * 0.16 + "px" }));
        add(d("pipe", { left: "4%", top: h * 0.1 + "px" }));
        add(d("pipe", { right: "4%", top: h * 0.1 + "px" }));
        break;
      }

      case "temple": {
        // floating sky sanctuary: layered platforms, pillars, an arch, drifting isles
        add(d("platform",    { left: "10%",  top: h * 0.34 + "px" }));
        add(d("platform p2", { right: "12%", top: h * 0.5 + "px" }));
        add(d("platform p2", { left: "24%",  top: h * 0.7 + "px" }));
        add(d("arch", { left: "calc(50% - 90px)", top: h * 0.34 + "px" }));
        add(d("pillar", { left: "calc(50% - 150px)", top: h * 0.52 + "px" }));
        add(d("pillar", { left: "calc(50% + 118px)", top: h * 0.52 + "px" }));
        add(d("isle", { left: "6%", top: h * 0.2 + "px" }));
        add(d("isle i2", { right: "8%", top: h * 0.26 + "px" }));
        add(d("orb", { left: "calc(50% - 8px)", top: h * 0.22 + "px" }));
        break;
      }
    }
  }

  /* ---------- build ---------- */
  function build() {
    let y = 0;

    const place = (biome, id, name, h, cssClass, makeInner) => {
      const sec = document.createElement("div");
      sec.className = cssClass;
      sec.style.top = y + "px";
      sec.style.height = h + "px";
      // keeps layout height reserved while content-visibility skips painting
      sec.style.containIntrinsicSize = "100% " + h + "px";
      sec.dataset.biome = biome;
      if (makeInner) makeInner(sec, y, h);
      worldEl.appendChild(sec);
      zones.push({ y0: y, y1: y + h, biome, id, name });
      y += h;
    };

    const placeSection = (s) => {
      place(s.biome, s.id, s.title, C.sectionHeight, "section", (sec, secY, h) => {
        decorate(sec, s.biome, h);
        const sign = document.createElement("div");
        sign.className = "sign";
        sign.style.top = h * 0.42 + "px";
        sign.innerHTML =
          `<div class="plate">${s.icon} ${s.title}</div>` +
          `<div class="sub">${s.sub}</div>`;
        sec.appendChild(sign);
        interactables.push({
          y: secY + h * 0.42 + 60,
          label: "Read — " + s.sub,
          el: sign,
          action: () => ETI.openPanel(s)
        });
      });
    };

    const placeTransition = (t) => {
      place(t.id, t.id, t.name, C.transitionHeight, "transition trans-" + t.id, (sec, secY, h) => {
        if (t.id === "stairs") {
          // torches alternate down the stairwell
          for (let i = 0; i < 4; i++) {
            const torch = d("torch", {
              top: (h * (0.15 + i * 0.22)) + "px",
              left: i % 2 ? "calc(50% - 190px)" : "calc(50% + 182px)"
            });
            sec.appendChild(torch);
          }
        }
        if (t.id === "bridge") {
          sec.appendChild(d("lamp", { top: h * 0.2 + "px", left: "calc(50% - 210px)" }));
          sec.appendChild(d("lamp", { top: h * 0.65 + "px", left: "calc(50% + 200px)" }));
        }
        if (t.id === "skybridge") {
          sec.appendChild(d("cloud", { top: h * 0.2 + "px", left: "12%" }));
          sec.appendChild(d("cloud c2", { top: h * 0.55 + "px", right: "10%" }));
          sec.appendChild(d("cloud c2", { top: h * 0.8 + "px", left: "20%" }));
        }
      });
    };

    // top → bottom: section, its crossing, next section...
    C.sections.forEach((s, i) => {
      placeSection(s);
      const t = C.transitions[i];
      if (t) placeTransition(t);
    });

    // spawn at the very bottom
    place("spawn", "spawn", "Spawn", C.spawnHeight, "section", (sec, secY, h) => {
      decorate(sec, "spawn", h);
      const sign = document.createElement("div");
      sign.className = "sign";
      sign.style.top = h * 0.3 + "px";
      sign.innerHTML =
        `<div class="plate">🏕 Spawn</div>` +
        `<div class="sub">Hold W to head up into the world</div>`;
      sec.appendChild(sign);
    });

    totalHeight = y;
    worldEl.style.height = totalHeight + "px";
  }

  /* ---------- biome / sky ---------- */
  const skyEls = {
    dayA: document.getElementById("sky-day-a"),
    dayB: document.getElementById("sky-day-b"),
    nightA: document.getElementById("sky-night-a"),
    nightB: document.getElementById("sky-night-b"),
    night: document.getElementById("sky-night")
  };
  let currentBiome = "";
  let timeMix = 0;                 // 0 = day, 1 = night (eased)
  let _blendPrev = -1, _mixPrev = -1;
  const bgCache = {};              // avoid restyling every frame

  function setBg(key, el, grad) {
    if (bgCache[key] !== grad) { bgCache[key] = grad; el.style.background = grad; }
  }

  /** Position-based sky blend: which two zones we're between, and how far.
      Reuses a shared result object (no per-frame allocation → no GC spikes). */
  const _blend = { a: "spawn", b: "spawn", t: 0 };
  function skyBlend(cy) {
    let i = -1;
    for (let k = 0; k < zones.length; k++) {
      if (cy >= zones[k].y0 && cy < zones[k].y1) { i = k; break; }
    }
    if (i < 0) i = zones.length - 1;
    const z = zones[i];
    // Blend window: never larger than half the zone, so the blend hits
    // exactly 0 at the zone's midpoint (prevents mid-zone flicker).
    const B = Math.min(320, (z.y1 - z.y0) / 2);
    let j = i, t = 0;
    const dTop = cy - z.y0, dBot = z.y1 - cy;
    if (dTop <= dBot && i > 0 && dTop < B) { j = i - 1; t = (B - dTop) / (2 * B); }
    else if (i < zones.length - 1 && dBot < B) { j = i + 1; t = (B - dBot) / (2 * B); }
    _blend.a = z.biome; _blend.b = zones[j].biome; _blend.t = t;
    return _blend;
  }

  function biomeAt(yPos) {
    for (let i = 0; i < zones.length; i++) {
      if (yPos >= zones[i].y0 && yPos < zones[i].y1) return zones[i];
    }
    return zones[zones.length - 1];
  }

  ETI.world = {
    build,
    interactables,
    get totalHeight() { return totalHeight; },
    biomeAt,

    /** Per-frame sky: blends neighbouring zones by position, and
        eases day↔night instead of snapping. */
    updateSky(cy, dt) {
      const blend = skyBlend(cy);
      const S = C.skies;
      const a = S[blend.a] || S.spawn, b = S[blend.b] || S.spawn;
      setBg("da", skyEls.dayA, a.day);
      setBg("db", skyEls.dayB, b.day);
      setBg("na", skyEls.nightA, a.night);
      setBg("nb", skyEls.nightB, b.night);
      // only write opacity when it moved enough to matter
      if (Math.abs(blend.t - _blendPrev) > 0.004) {
        skyEls.dayB.style.opacity = blend.t;
        skyEls.nightB.style.opacity = blend.t;
        _blendPrev = blend.t;
      }

      const targetMix = document.body.dataset.time === "night" ? 1 : 0;
      timeMix += (targetMix - timeMix) * Math.min(1, dt * 0.9);
      if (Math.abs(targetMix - timeMix) < 0.003) timeMix = targetMix;
      if (Math.abs(timeMix - _mixPrev) > 0.004) {
        skyEls.night.style.opacity = timeMix;
        _mixPrev = timeMix;
      }
    },

    /** Returns the zone if the biome changed this frame, else null.
        Accepts an optional precomputed zone to avoid a second lookup. */
    updateBiome(yPos, z) {
      z = z || biomeAt(yPos);
      if (z.biome !== currentBiome) {
        currentBiome = z.biome;
        document.body.dataset.biome = z.biome;
        document.getElementById("biome-name").textContent = z.name;
        ETI.particles.setBiome(z.biome);
        return z;
      }
      return null;
    },

    /** World Y for a section id (used by shortcut travel). */
    targetFor(id) {
      const z = zones.find(zz => zz.id === id);
      if (!z) return null;
      return z.y0 + (z.y1 - z.y0) * 0.5;
    }
  };
})();