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
  let sheetPlaying = false; // only sprite strips need frame stepping
  let _sprinting = false;
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
  // true when the shown art is already drawn facing a direction (e.g. the
  // left-walk gif) and so must NOT be mirrored by the scaleX facing flip.
  let currentDirectional = false;

  // Continuous motion cues, smoothly eased every frame instead of being
  // toggled by CSS class/keyframe swaps — this is what makes idle->walk,
  // walk->run, run->idle, starting, stopping and turning all blend into
  // each other instead of popping.
  let bobPhase = 0;
  let bobRate = 0; // current bob cycles/sec (eases toward target)
  let bobAmp = 0; // current bob amplitude in px (eases toward target)
  let facing = 1; // -1..1, eases toward facingTarget (turning)
  let facingTarget = 1;
  // True only while Vaugn is ACTIVELY moving left (horizontal velocity is
  // leftward this frame). Distinct from `facingTarget`, which remembers the
  // last direction he faced even after he stops or turns to move up/down.
  // The left-walk gif keys off this, so it never shows during up/down-only
  // movement or while idle.
  let movingLeft = false;

  // world position (px). x is an offset from screen centre.
  const pos = { x: 0, y: 0 };

  /** Resolve which animation to show for the current state:
      a directional walk art when moving left; else the state's own src;
      else the idle src (fallback); else the CSS placeholder. */
  function resolve() {
    const A = ETI.CONFIG.ANIMATIONS;

    // Dedicated left-facing walk art. Shown only while Vaugn is moving
    // (walking or running) AND actually travelling left this frame — never
    // during up/down-only movement or while idle. It's directional, so it
    // must NOT be flipped and skips the idle-borrow bob (it animates itself).
    if ((state === "walking" || state === "running") &&
        movingLeft && A.walkingLeft && A.walkingLeft.src) {
      return { a: A.walkingLeft, fallback: false, mirror: false, directional: true };
    }

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
    // The bob motion cue (walk/run) only applies when this state is
    // borrowing idle art — tick() eases its amplitude toward this target
    // every frame rather than snapping it on/off.
    usingFallbackMotion = !!r.fallback;
    // Directional art (the left-walk gif) is its own complete animation, so
    // it isn't flipped and doesn't get the borrowed idle bob.
    currentDirectional = !!r.directional;

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

    // Only rebuild the image/size when the resolved asset actually
    // changed. Walking/running currently borrow the same idle.gif — if
    // we reset background-image to that same URL on every state flip,
    // most browsers restart the GIF from frame 0, which reads as a
    // visible glitch every time the player starts/stops/changes speed.
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

    /** Called every frame with the current horizontal/vertical velocity
        (px/s) so the mascot can ease its facing direction (turning) and
        motion cues continuously, instead of main.js flipping a class. */
    setMotion(vx, vy) {
      // Small dead zone so vertical-only movement (the common case here)
      // doesn't cause the mascot to flicker its facing back and forth.
      const prevFacing = facingTarget;
      const prevMovingLeft = movingLeft;

      // Actual leftward motion this frame (drives the left-walk gif).
      movingLeft = vx < -20;

      // Facing only ever flips to left while ACTIVELY moving left; any other
      // time (moving right, up/down only, or standing still) it returns to the
      // default orientation. This keeps the idle art from staying mirrored
      // after a left walk, and keeps up/down movement showing normal idle art.
      facingTarget = movingLeft ? -1 : 1;

      // The left-walk gif swaps in/out on movingLeft; the mirrored art swaps
      // on facingTarget. Rebuild the sprite if either changed while moving.
      if ((movingLeft !== prevMovingLeft || facingTarget !== prevFacing) &&
          (state === "walking" || state === "running")) {
        applyState();
      }
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
          spriteEl.style.backgroundPosition = -frame * a.frameW + "px 0";
        }
      }

      // ---- turning: ease the facing flip instead of snapping it ----
      // While idle, snap instead of easing: the idle art is the same either
      // way, so easing the mirror after a left walk would show a brief,
      // pointless left-to-right flip. Snapping makes stopping seamless.
      if (state === "idle") {
        facing = facingTarget;
      } else {
        facing += (facingTarget - facing) * Math.min(1, dt * 9);
        if (Math.abs(facing - facingTarget) < 0.01) facing = facingTarget;
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
        // Directional art (left-walk gif) is already drawn facing left, so
        // never mirror it. Other art flips via scaleX to face where he moves.
        spriteEl.style.transform =
          currentDirectional || Math.abs(facing - 1) < 0.001
            ? ""
            : `scaleX(${facing})`;
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
