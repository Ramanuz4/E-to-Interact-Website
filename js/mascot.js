/* ============================================================
   E TO INTERACT — mascot.js
   The guide. Vaugn uses a single idle GIF; the walking/running
   states borrow that same art and add a bob motion cue in code.
   ============================================================ */
(function () {
  const el = document.getElementById("mascot");
  const spriteEl = document.getElementById("mascot-sprite");
  const labelEl = document.getElementById("anim-label");

  // Preload every sprite image up front so switching animations never shows a
  // blank frame while the browser fetches the new file. Kept referenced so the
  // cache isn't garbage-collected.
  const _preloaded = [];
  (function preloadSprites() {
    const srcs = new Set();
    const A = (window.ETI && ETI.CONFIG && ETI.CONFIG.ANIMATIONS) || {};
    for (const k in A) { if (A[k] && A[k].src) srcs.add(A[k].src); }
    srcs.forEach(src => { const im = new Image(); im.src = src; _preloaded.push(im); });
  })();

  let state = "idle";
  let frame = 0;
  let frameTimer = 0;
  let sheetPlaying = false; // only sprite strips need frame stepping
  let _sprinting = false;
  let _dashing = false;
  let _scrolling = false;   // true while movement is coming from wheel scroll
  let _tx = null,
    _ty = null; // last-applied transform (skip redundant writes)

  // Which underlying asset is currently loaded into the DOM. Several
  // states (walking/running with no art yet) resolve to the SAME file
  // (idle.gif) as a fallback — we must not touch background-image /
  // classes when the resolved asset hasn't actually changed, or the
  // browser restarts the GIF from frame 0 and it visibly snaps every
  // time the state flips (e.g. tapping W repeatedly).
  let currentSrc = null;
  let currentModeClass = null;
  let usingFallbackMotion = false;

  // Continuous motion cue (the walk/run bob), smoothly eased every frame
  // instead of toggled by CSS class swaps — this is what makes idle->walk,
  // walk->run and run->idle blend into each other instead of popping.
  let bobPhase = 0;
  let bobRate = 0; // current bob cycles/sec (eases toward target)
  let bobAmp = 0; // current bob amplitude in px (eases toward target)
  const now = () => (performance && performance.now ? performance.now() : Date.now());

  // world position (px). x is an offset from screen centre.
  const pos = { x: 0, y: 0 };

  /** Resolve which animation to show for the current state.
      Vaugn has only idle art, which every state borrows. When a non-idle
      state (walking/running) borrows it, `fallback` is true so tick() adds
      the walk/run bob motion cue on top of the idle GIF. */
  function resolve() {
    const A = ETI.CONFIG.ANIMATIONS;
    const own = A[state];
    // State has its own dedicated art → use it directly, no borrowed motion.
    if (own && own.src) return { a: own, fallback: false, mirror: false };
    // Otherwise borrow the idle art. Mark it as a fallback for any non-idle
    // state so the bob (walk/run cue) kicks in; idle itself stays still.
    const idle = A.idle;
    if (idle && idle.src) return { a: idle, fallback: state !== "idle", mirror: false };
    return { a: idle || own || {}, fallback: false, placeholder: true };
  }

  /** Build the little state caption under Vaugn.
      A dash outranks everything (it's a brief burst); otherwise the internal
      "running" state — Shift held, or wheel-scroll movement — reads as
      "sprinting" to the player. */
  function labelText() {
    if (_dashing) return "dash";
    if (state === "running" || _scrolling) return "sprinting";
    return state;
  }
  function updateLabel() {
    labelEl.textContent = "[" + labelText() + "]";
  }

  function applyState() {
    const r = resolve();
    const a = r.a;
    spriteEl.dataset.anim = state;
    updateLabel();
    // The bob motion cue (walk/run) only applies when this state is
    // borrowing idle art — tick() eases its amplitude toward this target
    // every frame rather than snapping it on/off.
    usingFallbackMotion = !!r.fallback;

    if (r.placeholder) {
      if (currentSrc !== null) {
        spriteEl.classList.remove("sheet-mode", "gif-mode");
        spriteEl.style.backgroundImage = "";
        spriteEl.style.width = spriteEl.style.height = "";
        spriteEl.style.translate = "";
        spriteEl.style.transform = "";
        currentSrc = null;
        currentModeClass = null;
      }
      labelEl.style.display = "";
      return;
    }

    const isGif = a.gif || /\.gif(\?|$)/i.test(a.src);
    const modeClass = isGif ? "gif-mode" : "sheet-mode";

    // Only rebuild the image/size when the resolved asset actually changed —
    // re-setting the same GIF url restarts it from frame 0 (a visible glitch),
    // so we avoid that for the looping idle art.
    if (a.src !== currentSrc || modeClass !== currentModeClass) {
      spriteEl.classList.remove("sheet-mode", "gif-mode");
      spriteEl.classList.add(modeClass);
      spriteEl.style.backgroundImage = `url(${a.src})`;
      const w = a.dispW || a.frameW,
        h = a.dispH || a.frameH;
      spriteEl.style.width = w + "px";
      spriteEl.style.height = h + "px";
      // expose the sprite height so the state label can sit above the full
      // sprite (which is taller than the 96px mascot box and bottom-anchored),
      // instead of overlapping Vaugn's head.
      el.style.setProperty("--sprite-h", h + "px");
      if (isGif) {
        // browser animates the GIF itself
        spriteEl.style.backgroundSize = "contain";
        spriteEl.style.backgroundPosition = "center bottom";
        sheetPlaying = false;
      } else {
        spriteEl.style.backgroundSize =
          a.frameW * a.frames + "px " + a.frameH + "px";
        spriteEl.style.backgroundPosition = "0 0";
        frame = 0;
        frameTimer = 0;
        sheetPlaying = true;
        spriteEl._sheet = a;
      }
      currentSrc = a.src;
      currentModeClass = modeClass;
    }

    labelEl.style.display = "";
  }

  ETI.mascot = {
    pos,
    el,

    setState(s) {
      if (s === state) return;
      state = s;
      applyState();
    },

    get state() {
      return state;
    },

    setSprinting(on) {
      on = !!on;
      if (on === _sprinting) return;
      _sprinting = on;
      el.classList.toggle("sprinting", on);
    },

    /** main.js calls this each frame: true while movement is being driven by
        wheel scrolling, so the state label reads "sprinting". */
    setScrolling(on) {
      on = !!on;
      if (on === _scrolling) return;
      _scrolling = on;
      updateLabel();   // flip walking <-> sprinting straight away
    },

    /** main.js calls this while a spacebar dash burst is active, so the state
        label reads "[dash]" for the duration of the dash. */
    setDashing(on) {
      on = !!on;
      if (on === _dashing) return;
      _dashing = on;
      updateLabel();
    },

    /** main.js calls this every frame with the current velocity (px/s).
        Vaugn's only art is the symmetric idle GIF, which is never mirrored,
        so there's no facing/turning to track — this is intentionally a
        no-op kept so main.js's per-frame call stays valid. */
    setMotion(vx, vy) {},

    tick(dt) {
      // sprite-strip frame advance (GIFs animate on their own)
      if (sheetPlaying && spriteEl._sheet) {
        const a = spriteEl._sheet;
        frameTimer += dt;
        const frameDur = 1 / a.fps;
        while (frameTimer >= frameDur) {
          frameTimer -= frameDur;
          frame = (frame + 1) % a.frames;
          spriteEl.style.backgroundPosition = -frame * a.frameW + "px 0";
        }
      }

      // ---- idle -> walk -> run (and back) motion cue, fully eased ----
      // Only applies while borrowing idle art for walking/running. The
      // rate/amplitude glide toward their target every frame, so starting,
      // stopping, and changing speed all blend instead of popping.
      const reduceMotion = document.body.classList.contains("reduce-motion");
      let targetRate = 0,
        targetAmp = 0;
      if (usingFallbackMotion && !reduceMotion) {
        if (state === "running") {
          targetRate = 2.6;
          targetAmp = 7;
        } else {
          targetRate = 1.7;
          targetAmp = 4.5;
        } // walking (or any future fallback state)
      }
      const ease = Math.min(1, dt * 5);
      bobRate += (targetRate - bobRate) * ease;
      bobAmp += (targetAmp - bobAmp) * ease;
      if (bobAmp < 0.05 && targetAmp === 0) bobAmp = 0;
      bobPhase += bobRate * dt * Math.PI * 2;
      const bob = bobAmp > 0 ? -Math.abs(Math.sin(bobPhase)) * bobAmp : 0;

      if (currentModeClass) {
        spriteEl.style.translate = `-50% ${bob}px`;
        // Vaugn's only art is the symmetric idle GIF, so it's never mirrored.
        spriteEl.style.transform = "";
      }

      // place in world via a single composited transform (no layout).
      // Math.round (not truncation) keeps sub-pixel motion from wobbling
      // by a stray 1px around zero, then skip the write when nothing moved.
      const tx = Math.round(pos.x),
        ty = Math.round(pos.y);
      if (tx !== _tx || ty !== _ty) {
        _tx = tx;
        _ty = ty;
        el.style.transform = `translate(${tx}px, ${ty}px)`;
      }
    },
  };

  applyState();

  // Vaugn's face in the dialogue portrait, if idle artwork exists
  (function setPortrait() {
    const idle = ETI.CONFIG.ANIMATIONS.idle;
    if (!idle.src) return;
    const portrait = document.querySelector("#dialogue .portrait");
    if (!portrait) return;
    portrait.style.background = `url(${idle.src}) center 20% / auto 170% no-repeat, #1c1c28`;
    const mini = portrait.querySelector(".px-mini");
    if (mini) mini.style.display = "none";
  })();
})();
