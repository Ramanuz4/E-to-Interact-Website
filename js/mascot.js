/* ============================================================
   E TO INTERACT — mascot.js
   The guide. Handles animation states, sprite-sheet playback
   (when you provide sheets in config.js).

   States: idle | up | down | left | right  (+ any you add)
   ============================================================ */
(function () {
  const el = document.getElementById("mascot");
  const spriteEl = document.getElementById("mascot-sprite");
  const labelEl = document.getElementById("anim-label");

  let state = "idle";
  let frame = 0;
  let frameTimer = 0;
  let sheetPlaying = false;   // only sprite strips need frame stepping
  let _sprinting = false;
  let _tx = null, _ty = null;  // last-applied transform (skip redundant writes)

  // world position (px). x is an offset from screen centre.
  const pos = { x: 0, y: 0 };

  /** Resolve which animation to show for the current state:
      the state's own src; else the idle src (fallback); else the
      CSS placeholder. */
  function resolve() {
    const A = ETI.CONFIG.ANIMATIONS;
    const own = A[state] || A.idle;
    if (own.src) return { a: own, fallback: false, mirror: false };
    const idle = A.idle;
    if (idle.src) return { a: idle, fallback: true, mirror: false };
    return { a: own, fallback: false, placeholder: true };
  }

  function applyState() {
    const r = resolve();
    const a = r.a;
    spriteEl.dataset.anim = state;
    labelEl.textContent = "[" + state + "]";
    frame = 0; frameTimer = 0;
    sheetPlaying = false;
    spriteEl.classList.remove("sheet-mode", "gif-mode", "fb-move", "mirror");
    spriteEl.style.backgroundImage = "";

    if (r.placeholder) {
      // CSS placeholder character
      spriteEl.style.width = spriteEl.style.height = "";
      labelEl.style.display = "";
      return;
    }

    const isGif = a.gif || /\.gif(\?|$)/i.test(a.src);
    spriteEl.classList.add(isGif ? "gif-mode" : "sheet-mode");
    spriteEl.style.backgroundImage = `url(${a.src})`;
    const w = a.dispW || a.frameW, h = a.dispH || a.frameH;
    spriteEl.style.width = w + "px";
    spriteEl.style.height = h + "px";
    if (isGif) {
      // browser animates the GIF itself
      spriteEl.style.backgroundSize = "contain";
      spriteEl.style.backgroundPosition = "center bottom";
    } else {
      spriteEl.style.backgroundSize = (a.frameW * a.frames) + "px " + a.frameH + "px";
      spriteEl.style.backgroundPosition = "0 0";
      sheetPlaying = true;
      spriteEl._sheet = a;
    }

    // Every state (idle included) shows its own art plus a small [state]
    // label, so they all read consistently until walking/running art exists.
    // The motion cue is added only when borrowing idle art.
    if (r.fallback) spriteEl.classList.add("fb-move");
    labelEl.style.display = "";
  }

  ETI.mascot = {
    pos, el,

    setState(s) {
      if (s === state) return;
      state = s;
      applyState();
    },

    get state() { return state; },

    setSprinting(on) {
      on = !!on;
      if (on === _sprinting) return;
      _sprinting = on;
      el.classList.toggle("sprinting", on);
    },

    tick(dt) {
      // sprite-strip frame advance (GIFs animate on their own)
      if (sheetPlaying && spriteEl._sheet) {
        const a = spriteEl._sheet;
        frameTimer += dt;
        const frameDur = 1 / a.fps;
        while (frameTimer >= frameDur) {
          frameTimer -= frameDur;
          frame = (frame + 1) % a.frames;
          spriteEl.style.backgroundPosition = (-frame * a.frameW) + "px 0";
        }
      }
      // place in world via a single composited transform (no layout).
      // Round to whole pixels and skip the write when nothing moved.
      const tx = pos.x | 0, ty = pos.y | 0;
      if (tx !== _tx || ty !== _ty) {
        _tx = tx; _ty = ty;
        el.style.transform = `translate(${tx}px, ${ty}px)`;
      }
    }
  };

  applyState();

  // Vaugn's face in the dialogue portrait, if idle artwork exists
  (function setPortrait() {
    const idle = ETI.CONFIG.ANIMATIONS.idle;
    if (!idle.src) return;
    const portrait = document.querySelector("#dialogue .portrait");
    if (!portrait) return;
    portrait.style.background =
      `url(${idle.src}) center 20% / auto 170% no-repeat, #1c1c28`;
    const mini = portrait.querySelector(".px-mini");
    if (mini) mini.style.display = "none";
  })();
})();