/* ============================================================
   E TO INTERACT — main.js
   Boot → intro → play. Input, camera, travel, crossings, secret.
   ============================================================ */
(function () {
  const C = ETI.CONFIG;
  const M = ETI.mascot;
  const worldEl = document.getElementById("world");
  const bootEl = document.getElementById("boot");
  const onboardEl = document.getElementById("onboard");
  const promptEl = document.getElementById("prompt");
  const promptLabel = document.getElementById("prompt-label");
  const darknessEl = document.getElementById("darkness");
  const fadeEl = document.getElementById("fade");
  const lanternEl = document.getElementById("lantern");

  ETI.world.build();

  /* ---------- state ---------- */
  let mode = "boot"; // boot | onboard | intro | play | portal
  let introSkip = null;
  const keys = new Set();
  let camY = 0;
  let visitedBiomes = new Set(["spawn"]);
  let secretBuffer = [];
  let secretDone = false;
  let doorInteractable = null;

  // one unique arrival line per zone (lands + crossings)
  const enterLines = {};
  C.sections.forEach(s => { enterLines[s.biome] = s.enterLine; });
  C.transitions.forEach(t => { enterLines[t.id] = t.line; });

  // spawn position: near the bottom, just below the spawn sign
  M.pos.y = ETI.world.totalHeight - 380;
  camY = camTarget();
  applyCamera();
  ETI.world.updateBiome(centerY());
  ETI.world.updateSky(centerY(), 1);

  function vh() { return window.innerHeight; }
  function centerY() { return M.pos.y + 48; }
  function camTarget() {
    return Math.max(0, Math.min(ETI.world.totalHeight - vh(), centerY() - vh() * 0.55));
  }
  var _camApplied = null;
  function applyCamera() {
    const v = -camY | 0;
    if (v === _camApplied) return;   // no write when the camera is still
    _camApplied = v;
    worldEl.style.transform = `translate3d(0, ${v}px, 0)`;
  }

  /* ============================================================
     BOOT → ONBOARDING → INTRO
     ============================================================ */

  // ---- onboarding controller (multi-page, skippable, replayable) ----
  const onboard = (function () {
    let pages = [];
    let idx = 0;
    let onFinish = null;
    let returnToPause = false;   // true when opened from the menu
    const badgeEl = document.getElementById("ob-badge");
    const dotsWrap = document.getElementById("ob-dots");
    const backBtn = document.getElementById("ob-back");
    const nextBtn = document.getElementById("ob-next");
    const skipBtn = document.getElementById("ob-skip");

    function visiblePageSet() {
      // whichever .ob-pages block isn't display:none for this device
      const sets = [...onboardEl.querySelectorAll(".ob-pages")];
      const active = sets.find(s => getComputedStyle(s).display !== "none") || sets[0];
      return [...active.querySelectorAll(".ob-page")];
    }

    function renderDots() {
      dotsWrap.innerHTML = "";
      pages.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.className = "dot" + (i === idx ? " on" : "");
        dot.addEventListener("click", () => show(i));
        dotsWrap.appendChild(dot);
      });
    }

    function show(i) {
      idx = Math.max(0, Math.min(pages.length - 1, i));
      pages.forEach((p, n) => p.classList.toggle("on", n === idx));
      [...dotsWrap.children].forEach((dot, n) => dot.classList.toggle("on", n === idx));
      if (badgeEl && pages[idx].dataset.badge) badgeEl.innerHTML = pages[idx].dataset.badge;
      backBtn.disabled = idx === 0;
      nextBtn.textContent = idx === pages.length - 1 ? "Finish ›" : "Next ›";
    }

    function finish() {
      onboardEl.classList.add("out");
      setTimeout(() => { onboardEl.classList.add("hidden"); onboardEl.classList.remove("out"); }, 420);
      const cb = onFinish; onFinish = null;
      if (returnToPause) {
        returnToPause = false;
        mode = "play";
        ETI.ui.openPause();
      } else if (cb) {
        cb();
      }
    }

    backBtn.addEventListener("click", () => show(idx - 1));
    nextBtn.addEventListener("click", () => { idx === pages.length - 1 ? finish() : show(idx + 1); });
    skipBtn.addEventListener("click", finish);

    return {
      // run as part of the first-load flow (boot → onboard → intro)
      run(done) {
        returnToPause = false;
        onFinish = done;
        pages = visiblePageSet();
        onboardEl.classList.remove("hidden");
        renderDots();
        show(0);
      },
      // reopen later from the pause menu
      replay() {
        returnToPause = true;
        onFinish = null;
        mode = "onboard";
        pages = visiblePageSet();
        onboardEl.classList.remove("hidden");
        renderDots();
        show(0);
      },
      key(k) {
        if (mode !== "onboard") return false;
        if (k === "escape") { finish(); return true; }
        if (k === "arrowright" || k === "d" || k === "e" || k === "enter") {
          idx === pages.length - 1 ? finish() : show(idx + 1);
          return true;
        }
        if (k === "arrowleft" || k === "a") { show(idx - 1); return true; }
        return true; // swallow other keys while onboarding
      },
      get isOpen() { return mode === "onboard"; }
    };
  })();
  // expose replay so the pause menu can reopen the guide
  ETI.replayOnboarding = onboard.replay;

  // Boot → show onboarding every visit, then run the intro.
  function startFromBoot() {
    if (mode !== "boot") return;
    bootEl.classList.add("out");
    setTimeout(() => bootEl.remove(), 1100);
    mode = "onboard";
    onboard.run(startIntro);
  }

  function startIntro() {
    mode = "intro";

    // mascot walks in from the left
    M.pos.x = -Math.min(500, window.innerWidth * 0.45);
    M.setState("walking");

    let dialogueStarted = false;
    function beginDialogue() {
      if (dialogueStarted) return;
      dialogueStarted = true;
      clearInterval(walkIn);
      M.pos.x = 0;
      M.setState("idle");
      ETI.dialogue.say([
        "Hey! Welcome to E to Interact.",
        "I'm Vaugn — your guide.",
        "Let's explore."
      ], () => {
        mode = "play";
      });
    }
    // expose so a keypress during the walk-in can skip straight to dialogue
    introSkip = beginDialogue;

    const walkIn = setInterval(() => {
      M.pos.x += 4.5;
      if (M.pos.x >= 0) beginDialogue();
    }, 16);
  }

  /* ============================================================
     PORTAL TRAVEL (keyboard shortcuts G/H/T/P/C, touch keycaps, MAP)
     A portal opens beside Vaugn, pulls him in, collapses with a
     flash, reopens at the destination, and he pops back out.
     ============================================================ */
  const shortcuts = { g: "castle", h: "spawn", t: "studio", c: "temple", p: "space" };
  const shortcutNames = { castle: "Games", spawn: "Home", studio: "Team", temple: "Contact", space: "Posts" };

  const hopEl = M.el.querySelector(".hop");
  const shadowEl = M.el.querySelector(".shadow");
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function spawnPortal(y, xOff) {
    const p = document.createElement("div");
    p.className = "portal";
    p.style.top = (y + 20) + "px";   // portal center sits on Vaugn's torso
    p.style.left = `calc(50% + ${xOff}px)`;
    p.innerHTML =
      '<div class="bh-halo"></div>' +
      '<div class="bh-disk"></div>' +
      '<div class="bh-spiral"></div>' +
      '<div class="bh-core"></div>';
    worldEl.appendChild(p);
    requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add("open")));
    return p;
  }
  function closePortal(p) {
    p.classList.remove("open", "feeding");
    p.classList.add("closing");
    setTimeout(() => p.remove(), 460);
  }

  let portalBusy = false;
  const PORTAL_DX = 96; // must match the suckIn/spitOut keyframe translate

  async function startTravel(id) {
    const y = ETI.world.targetFor(id);
    if (y === null || portalBusy || mode !== "play") return;
    if (Math.abs(y - centerY()) < 60) return; // already there
    portalBusy = true;
    mode = "portal";
    const name = shortcutNames[id];
    ETI.dialogue.toast("Tearing open a portal...  →  " + name, 2400);
    if (M.state !== "idle") M.setState("idle");
    M.setSprinting(false);

    // 1) a black hole tears open beside Vaugn
    const pIn = spawnPortal(M.pos.y, M.pos.x + PORTAL_DX);
    await sleep(620);

    // 2) gravity grabs Vaugn — he spaghettifies and gets swallowed
    pIn.classList.add("feeding");
    hopEl.style.animation = "suckIn .62s cubic-bezier(.45,0,.85,.4) forwards";
    shadowEl.style.transition = "opacity .4s ease";
    shadowEl.style.opacity = "0";
    await sleep(560);

    // 3) the hole collapses in on itself with a purple flash over the cut
    closePortal(pIn);
    fadeEl.style.transition = "opacity .16s ease";
    fadeEl.style.background =
      "radial-gradient(circle at 50% 55%, rgba(150,90,235,.92), rgba(14,5,32,.98) 70%)";
    fadeEl.style.opacity = "1";
    await sleep(230);

    // 4) teleport under the flash — snap Vaugn and the camera to the target
    M.pos.y = y - 48;
    camY = camTarget();
    applyCamera();
    hopEl.style.animation = "none";           // reset before the exit anim
    void hopEl.offsetHeight;
    const pOut = spawnPortal(M.pos.y, M.pos.x + PORTAL_DX);
    await sleep(150);
    fadeEl.style.transition = "opacity .45s ease";
    fadeEl.style.opacity = "0";
    await sleep(320);

    // 5) the hole spits Vaugn back out at the destination
    pOut.classList.add("feeding");
    hopEl.style.animation = "spitOut .66s cubic-bezier(.2,1.5,.45,1) forwards";
    shadowEl.style.opacity = "";
    await sleep(430);
    pOut.classList.remove("feeding");
    await sleep(240);

    // 6) portal closes; hand control back
    closePortal(pOut);
    hopEl.style.animation = "";
    hopEl.style.transform = "";
    shadowEl.style.transition = "";
    mode = "play";
    portalBusy = false;
    ETI.dialogue.toast(name + " — stuck the landing.", 2000);
  }

  /* ============================================================
     SECRET  (W W S S A D A D)
     ============================================================ */
  function pushSecret(k) {
    if (secretDone) return;
    secretBuffer.push(k);
    if (secretBuffer.length > C.secretCode.length) secretBuffer.shift();
    if (secretBuffer.length === C.secretCode.length &&
        secretBuffer.every((v, i) => v === C.secretCode[i])) {
      secretDone = true;
      triggerSecret();
    }
  }

  function triggerSecret() {
    ETI.dialogue.say(["...", "Wait...", "You actually knew that?"], () => {
      // a secret door appears just ahead of the mascot
      const door = document.createElement("div");
      door.id = "secret-door";
      const doorY = Math.max(120, M.pos.y - 240);
      door.style.top = doorY + "px";
      worldEl.appendChild(door);
      doorInteractable = {
        y: doorY + 60,
        label: "Enter — ???",
        el: door,
        action: () => ETI.ui.openDev()
      };
      ETI.world.interactables.push(doorInteractable);
      ETI.dialogue.toast("A door appeared just ahead...", 2600);
    });
  }

  /* ============================================================
     INTERACT PROMPT
     ============================================================ */
  let nearest = null;

  let _nearSignEl = null;    // currently highlighted sign, cached
  let _promptHidden = true;  // avoid redundant class writes

  function updatePrompt() {
    nearest = null;
    let best = 150;
    const cy = centerY();
    const list = ETI.world.interactables;
    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      const dist = Math.abs(it.y - cy);
      if (dist < best) { best = dist; nearest = it; }
    }

    const show = nearest && mode === "play" && !ETI.dialogue.isBlocking &&
                 !ETI.ui.pauseOpen && !ETI.ui.panelOpen && !ETI.ui.devOpen;

    // highlighted sign — only touch the DOM when it actually changes
    const wantSign = (show && nearest.el && nearest.el.classList.contains("sign")) ? nearest.el : null;
    if (wantSign !== _nearSignEl) {
      if (_nearSignEl) _nearSignEl.classList.remove("near");
      if (wantSign) wantSign.classList.add("near");
      _nearSignEl = wantSign;
    }

    if (show) {
      if (_promptHidden) { promptEl.classList.remove("hidden"); _promptHidden = false; }
      promptLabel.textContent = nearest.label;
      const screenY = M.pos.y - camY;
      promptEl.style.transform = `translate(calc(-50% + ${M.pos.x | 0}px), ${(screenY - 46) | 0}px)`;
    } else if (!_promptHidden) {
      promptEl.classList.add("hidden");
      _promptHidden = true;
    }
  }

  /* ============================================================
     TRANSITION EFFECTS — only the Tower Stairs go dark (torchlit);
     every other crossing has its own light and particles.
     ============================================================ */
  let _darkPrev = -1;
  function updateZoneFx(zone, cy) {
    // Torch-darkness ramps in with depth into the stairwell, so there's
    // no snap at the border — it fades over the first/last ~340px.
    let dark = 0;
    if (zone.biome === "stairs") {
      const edge = 340;
      const into = Math.min(cy - zone.y0, zone.y1 - cy);
      dark = 0.7 * Math.max(0, Math.min(1, into / edge));
    }
    // only write when it meaningfully changed
    if (Math.abs(dark - _darkPrev) > 0.004) {
      darknessEl.style.opacity = dark;
      lanternEl.style.opacity = Math.min(1, dark / 0.45);
      _darkPrev = dark;
    }
    if (dark > 0) {
      const sx = window.innerWidth / 2 + M.pos.x;
      const sy = M.pos.y - camY + 40;
      lanternEl.style.setProperty("--lx", sx + "px");
      lanternEl.style.setProperty("--ly", sy + "px");
    }
  }

  /* ============================================================
     INPUT
     ============================================================ */
  const handled = new Set(["w", "a", "s", "d", "e", "c", "g", "h", "t", "p", " ", "escape", "enter", "shift"]);

  window.addEventListener("keydown", (ev) => {
    const k = ev.key.toLowerCase();
    if (handled.has(k)) ev.preventDefault();

    if (mode === "boot") { if (k === "e") startFromBoot(); return; }
    if (mode === "onboard") { onboard.key(k); return; }
    // during the walk-in (before dialogue), any key jumps straight to dialogue
    if (mode === "intro" && !ETI.dialogue.isBlocking) { if (introSkip) introSkip(); return; }
    if (ev.repeat) { if ("wasd".includes(k) && k.length === 1) keys.add(k); return; }

    // menus eat input first
    if (ETI.ui.devKey && ETI.ui.devOpen) { ETI.ui.devKey(k); return; }
    if (ETI.ui.pauseOpen) { ETI.ui.pauseKey(k); return; }
    if (mapOpen) { if (k === "escape" || k === "e" || k === "enter") closeMap(); return; }

    if (ETI.ui.panelOpen) {
      if (k === "e" || k === "escape" || k === "enter") ETI.ui.closePanel();
      return;
    }

    // blocking dialogue: E advances
    if (ETI.dialogue.isBlocking) {
      if (k === "e" || k === "enter" || k === " ") ETI.dialogue.advance();
      if (k === "escape") { /* let people pause anyway */ ETI.ui.openPause(); }
      return;
    }

    if (k === "escape") { actionEsc(); return; }
    if (mode !== "play") return;

    if ("wasd".includes(k) && k.length === 1) {
      keys.add(k);
      pushSecret(k);
      return;
    }
    if (k === "shift") { keys.add("shift"); return; }
    if (k === "e") {
      if (nearest) nearest.action();
      return;
    }
    if (shortcuts[k]) startTravel(shortcuts[k]);
  });

  window.addEventListener("keyup", (ev) => {
    const k = ev.key.toLowerCase();
    keys.delete(k === "shift" ? "shift" : k);
  });

  /* ============================================================
     TOUCH & ON-SCREEN CONTROLS
     Virtual keycaps mirror the keyboard exactly (WASD, E, SHIFT,
     ESC, MAP) so the control theme survives on any device.
     ============================================================ */
  // Touch UI only on real touch devices in a phone/tablet-sized viewport.
  // Requires a coarse primary pointer AND no hover AND actual touch points —
  // desktops (even hybrid/touchscreen laptops with a mouse) stay on keyboard.
  function evalTouch() {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const noHover = window.matchMedia("(hover: none)").matches;
    const hasTouch = (navigator.maxTouchPoints || 0) > 0;
    const smallish = window.innerWidth <= 1024;
    const on = coarse && noHover && hasTouch && smallish;
    document.body.classList.toggle("touch", on);
    return on;
  }
  evalTouch();
  let _tzTimer;
  window.addEventListener("resize", () => {
    clearTimeout(_tzTimer);
    _tzTimer = setTimeout(evalTouch, 200);
  });

  /** Central "E was pressed" behaviour shared by key and button. */
  function actionE() {
    if (mode === "boot") { startFromBoot(); return; }
    if (mode === "onboard") { onboard.key("e"); return; }
    if (ETI.dialogue.isBlocking) { ETI.dialogue.advance(); return; }
    if (ETI.ui.panelOpen) { ETI.ui.closePanel(); return; }
    if (ETI.ui.pauseOpen || ETI.ui.devOpen) return; // menu items are tappable
    if (mode === "play" && nearest) nearest.action();
  }

  /** Central "Esc was pressed" behaviour shared by key and button. */
  function actionEsc() {
    if (mode === "boot" || mode === "portal") return;
    if (mode === "onboard") { onboard.key("escape"); return; }
    if (ETI.ui.devOpen) { ETI.ui.devKey("escape"); return; }
    if (ETI.ui.pauseOpen) { ETI.ui.pauseKey("escape"); return; }
    if (mapOpen) { closeMap(); return; }
    if (ETI.ui.panelOpen) { ETI.ui.closePanel(); return; }
    ETI.ui.openPause();
  }

  // ---- analog joystick (replaces the D-pad on touch) ----
  const joy = { x: 0, y: 0 };
  (function initJoystick() {
    const base = document.getElementById("joystick");
    if (!base) return;
    const knob = document.getElementById("joy-knob");
    let active = false, pid = null, cx = 0, cy = 0, R = 1;
    let lastDir = null;

    function setKnob(dx, dy) { knob.style.transform = `translate(${dx}px, ${dy}px)`; }

    function engage() {
      if (mode !== "play") return false;
      if (ETI.ui.pauseOpen || ETI.ui.panelOpen || ETI.ui.devOpen || mapOpen || ETI.dialogue.isBlocking) return false;
      return true;
    }

    function track(e) {
      if (!active || e.pointerId !== pid) return;
      if (!engage()) { joy.x = joy.y = 0; setKnob(0, 0); return; }
      let dx = e.clientX - cx, dy = e.clientY - cy;
      const d = Math.hypot(dx, dy);
      if (d > R) { dx = dx / d * R; dy = dy / d * R; }
      setKnob(dx, dy);
      joy.x = dx / R; joy.y = dy / R;
      // discrete direction "pulses" so the secret code works on touch too:
      // push past 55%, return to centre, push again — each push counts once
      let dir = null;
      if (Math.hypot(joy.x, joy.y) > 0.55) {
        dir = Math.abs(joy.y) >= Math.abs(joy.x)
          ? (joy.y < 0 ? "w" : "s")
          : (joy.x < 0 ? "a" : "d");
      }
      if (dir && dir !== lastDir) pushSecret(dir);
      lastDir = dir;
    }

    base.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      if (mode === "boot") { startFromBoot(); return; }
      const r = base.getBoundingClientRect();
      cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      R = Math.max(1, r.width / 2 - 12);
      active = true; pid = e.pointerId;
      try { base.setPointerCapture(pid); } catch (err) {}
      track(e);
    });
    base.addEventListener("pointermove", track);
    const end = (e) => {
      if (e.pointerId !== pid) return;
      active = false; pid = null; lastDir = null;
      joy.x = joy.y = 0; setKnob(0, 0);
    };
    base.addEventListener("pointerup", end);
    base.addEventListener("pointercancel", end);
    base.addEventListener("contextmenu", e => e.preventDefault());
  })();

  // ---- E: a real button (fires on release, so the panel it opens
  //      doesn't get closed by the release's ghost click) ----
  const eBtn = document.querySelector('#actions [data-key="e"]');
  if (eBtn) eBtn.addEventListener("click", (e) => { e.preventDefault(); actionE(); });

  // ---- sprint toggle (instant on touch-down feels right) ----
  const sprintBtn = document.querySelector('[data-action="sprint"]');
  let sprintLatched = false;
  if (sprintBtn) sprintBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    sprintLatched = !sprintLatched;
    sprintBtn.classList.toggle("on", sprintLatched);
    if (sprintLatched) keys.add("shift"); else keys.delete("shift");
  });

  // ---- ESC + MAP: click-based buttons ----
  const pauseBtn = document.querySelector('[data-action="pause"]');
  if (pauseBtn) pauseBtn.addEventListener("click", (e) => { e.preventDefault(); actionEsc(); });

  const mapEl = document.getElementById("travel-sheet");
  const mapBtn = document.querySelector('[data-action="map"]');
  let mapOpen = false;
  function openMap() {
    if (mode === "boot" || ETI.ui.pauseOpen || ETI.ui.devOpen) return;
    if (ETI.ui.panelOpen) ETI.ui.closePanel();
    mapOpen = true;
    mapEl.classList.remove("hidden");
  }
  function closeMap() { mapOpen = false; mapEl.classList.add("hidden"); }
  if (mapBtn) mapBtn.addEventListener("click", (e) => { e.preventDefault(); mapOpen ? closeMap() : openMap(); });
  document.getElementById("travel-close").addEventListener("click", closeMap);
  mapEl.addEventListener("click", (e) => { if (e.target === mapEl) closeMap(); });
  document.querySelectorAll("#travel-list li").forEach(li => {
    li.addEventListener("click", () => { closeMap(); startTravel(li.dataset.travel); });
  });

  // ---- shortcut keycaps: H G T P C, same destinations as the keyboard ----
  document.querySelectorAll("#shortcut-keys [data-shortcut]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (mode === "boot" || ETI.ui.pauseOpen || ETI.ui.panelOpen || ETI.ui.devOpen || ETI.dialogue.isBlocking) return;
      closeMap();
      startTravel(btn.dataset.shortcut);
    });
  });

  // ---- tap-to-advance dialogue, tap the prompt to interact ----
  document.getElementById("dialogue").addEventListener("click", () => ETI.dialogue.advance());
  promptEl.addEventListener("click", () => { if (mode === "play" && nearest) nearest.action(); });

  /* ============================================================
     MAIN LOOP
     ============================================================ */
  let last = performance.now();

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    const uiBlocked = ETI.ui.pauseOpen || ETI.ui.panelOpen || ETI.ui.devOpen;

    /* --- movement --- */
    if (mode === "play" && !uiBlocked && !ETI.dialogue.isBlocking) {
      const up = keys.has("w") ? 1 : 0;
      const down = keys.has("s") ? 1 : 0;
      const left = keys.has("a") ? 1 : 0;
      const right = keys.has("d") ? 1 : 0;
      const sprint = keys.has("shift");
      const speed = sprint ? C.sprintSpeed : C.walkSpeed;

      // keyboard (digital) + joystick (analog), clamped to full deflection
      const mx = Math.max(-1, Math.min(1, (right - left) + joy.x));
      const my = Math.max(-1, Math.min(1, (down - up) + joy.y));
      const vy = my * speed;
      const vx = mx * speed * 0.7;

      M.pos.y = Math.max(80, Math.min(ETI.world.totalHeight - 140, M.pos.y + vy * dt));
      M.pos.x = Math.max(-260, Math.min(260, M.pos.x + vx * dt));

      const moving = Math.abs(vx) > 6 || Math.abs(vy) > 6;
      M.setSprinting(sprint && moving);

      // Moving = walking; holding Shift while moving = running.
      if (moving) {
        M.setState(sprint ? "running" : "walking");
      } else {
        M.setState("idle");
      }

    } else if (mode !== "boot" && mode !== "intro" && mode !== "portal") {
      M.setState("idle");
      M.setSprinting(false);
    }

    /* --- camera (smooth follow) --- */
    const target = camTarget();
    const stiffness = 4.5;
    camY += (target - camY) * Math.min(1, dt * stiffness);
    if (Math.abs(target - camY) < 0.3) camY = target;
    applyCamera();

    /* --- biome + atmosphere --- */
    const cy = centerY();
    const zone = ETI.world.biomeAt(cy);
    const changed = ETI.world.updateBiome(cy, zone);
    ETI.world.updateSky(cy, dt);
    updateZoneFx(zone, cy);

    if (changed && !visitedBiomes.has(changed.biome)) {
      visitedBiomes.add(changed.biome);
      if (mode === "play" && !ETI.dialogue.isBlocking && enterLines[changed.biome]) {
        ETI.dialogue.toast(enterLines[changed.biome], 3400);
      }
    }

    updatePrompt();
    M.tick(dt);
    ETI.ui.tickClock(dt);
    // Particles are fully hidden behind the pause menu / a section panel /
    // the dev room, so there's no point painting them then — skip to save
    // a full-viewport canvas clear+fill on those frames.
    if (!uiBlocked) ETI.particles.tick(dt);

    if (!document.hidden) requestAnimationFrame(frame);
    else _loopStopped = true;   // resume via visibilitychange
  }

  let _loopStopped = false;
  requestAnimationFrame(frame);

  // When the tab is backgrounded, the browser already throttles rAF, but we
  // also reset the clock on return so `dt` doesn't jump after a long pause.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && _loopStopped) {
      _loopStopped = false;
      last = performance.now();
      requestAnimationFrame(frame);
    }
  });

  // tapping the boot screen starts too, but only on touch devices —
  // desktop/mouse users must press E.
  bootEl.addEventListener("click", () => {
    if (document.body.classList.contains("touch")) startFromBoot();
  });
})();