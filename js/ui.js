/* ============================================================
   E TO INTERACT — ui.js
   Pause menu, settings, the rotating clock (day/night),
   section panels, developer room, star field.
   ============================================================ */
(function () {
  const C = ETI.CONFIG;

  /* ============================================================
     STARS
     ============================================================ */
  (function makeStars() {
    const wrap = document.getElementById("stars");
    for (let i = 0; i < 140; i++) {
      const s = document.createElement("div");
      s.className = "star";
      const size = Math.random() < 0.85 ? 2 : 3;
      s.style.width = s.style.height = size + "px";
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.animationDelay = (Math.random() * 3) + "s";
      wrap.appendChild(s);
    }
  })();

  /* ============================================================
     RELOAD BUTTON — reloads the whole page. Works the same way
     on desktop and touch since it lives in the always-visible HUD.
     ============================================================ */
  (function initReloadButton() {
    const btn = document.getElementById("reload-btn");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      location.reload();
    });
  })();

  /* ============================================================
     CLOCK — the icon slowly rotates; its angle IS the time.
     0°–180° = day face up, 180°–360° = night face up.
     Clicking spins it to the next half.
     ============================================================ */
  const dial = document.getElementById("clock-dial");
  const clockBtn = document.getElementById("clock");
  const timeBadge = document.getElementById("time-badge");
  const timeFlash = document.getElementById("time-flash");
  let angle = 0;            // degrees
  let spinTo = null;        // target angle when clicked
  let autoCycle = true;
  let manualSpin = false;
  let flashTimer = null;

  function timeFromAngle(a) {
    return ((a % 360) + 360) % 360 < 180 ? "day" : "night";
  }

  function updateClockChrome(t) {
    clockBtn.dataset.timeActive = t;
    if (timeBadge) {
      timeBadge.textContent = t === "night" ? "NIGHT" : "DAY";
      timeBadge.dataset.time = t;
    }
    clockBtn.setAttribute("aria-label",
      (t === "night" ? "Night mode — click for day" : "Day mode — click for night"));
  }

  function flashTime(t) {
    if (!timeFlash) return;
    timeFlash.dataset.time = t;
    timeFlash.classList.add("on");
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => timeFlash.classList.remove("on"), 720);
  }

  // Day/night toast messages — one is picked at random each time for variety
  const nightToasts = [
    "Night falls — stars wake up and lanterns flicker on.",
    "The clock turns to night. Find the fireflies in the Forest.",
    "Dark skies. The orbs at the temple glow brighter now.",
    "Night mode. The world gets quieter — and a little more alive."
  ];
  const dayToasts = [
    "Sun rises — the world brightens.",
    "Daytime. Birds are back, smoke drifts from the campfire.",
    "Morning. The sky clears and the trees come alive.",
    "Back to day. The clock keeps turning."
  ];

  function applyTime(t, opts) {
    opts = opts || {};
    if (document.body.dataset.time !== t) {
      document.body.dataset.time = t;
      updateClockChrome(t);
      if (opts.flash) flashTime(t);
      if (opts.toast && ETI.dialogue) {
        const pool = t === "night" ? nightToasts : dayToasts;
        const msg = pool[Math.floor(Math.random() * pool.length)];
        ETI.dialogue.toast(msg, 2600);
      }
      if (timeBadge) {
        timeBadge.classList.remove("pulse");
        void timeBadge.offsetWidth;
        timeBadge.classList.add("pulse");
      }
      if (ETI.world && ETI.world.onTimeChange) ETI.world.onTimeChange(t, !!opts.manual);
    }
  }

  updateClockChrome(document.body.dataset.time || "day");

  clockBtn.addEventListener("click", () => {
    const base = Math.floor(angle / 180) * 180;
    const next = timeFromAngle(base + 180);
    spinTo = base + 180 + 90;
    manualSpin = true;
    clockBtn.classList.add("is-spinning");
    applyTime(next, { flash: true, toast: true, manual: true });
  });

  function tickClock(dt) {
    if (spinTo !== null) {
      const ease = manualSpin ? 7.5 : 5;
      angle += (spinTo - angle) * Math.min(1, dt * ease);
      if (Math.abs(spinTo - angle) < 0.5) {
        angle = spinTo;
        spinTo = null;
        clockBtn.classList.remove("is-spinning");
        manualSpin = false;
      }
    } else if (autoCycle) {
      angle += (360 / C.cycleSeconds) * dt;
    }
    dial.style.transform = `rotate(${angle}deg)`;
    applyTime(timeFromAngle(angle));
  }

  /* ============================================================
     SETTINGS
     ============================================================ */
  const settings = {
    autocycle: { values: ["On", "Off"], i: 0, apply(v) { autoCycle = v === "On"; } },
    particles: { values: ["High", "Low", "Off"], i: 0, apply(v) {
      ETI.particles.setDensity(v === "High" ? 1 : v === "Low" ? 0.4 : 0);
    }},
    textspeed: { values: ["Normal", "Fast"], i: 0, apply(v) {
      ETI.dialogue.setSpeed(v === "Fast" ? 8 : 22);
    }},
    motion: { values: ["Off", "On"], i: 0, apply(v) {
      document.body.classList.toggle("reduce-motion", v === "On");
    }}
  };
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    settings.motion.i = 1;
    settings.motion.apply("On");
  }

  function renderSettings() {
    document.querySelectorAll("#settings-list li").forEach(li => {
      const s = settings[li.dataset.setting];
      li.querySelector(".val").textContent = s.values[s.i];
    });
  }
  renderSettings();

  /* ============================================================
     PAUSE MENU
     ============================================================ */
  const pauseEl = document.getElementById("pause");
  const mainList = document.getElementById("pause-list");
  const panes = {
    controls: document.getElementById("pane-controls"),
    shortcuts: document.getElementById("pane-shortcuts"),
    explore: document.getElementById("pane-explore"),
    konami: document.getElementById("pane-konami"),
    settings: document.getElementById("pane-settings")
  };
  let pauseOpen = false;
  let paneOpen = null;      // key of open pane, or null
  let sel = 0;              // selected index in whatever list is active
  let settingsSel = 0;

  function listItems() { return [...mainList.querySelectorAll("li")]; }
  function settingsItems() { return [...document.querySelectorAll("#settings-list li")]; }

  function highlight() {
    listItems().forEach((li, i) => li.classList.toggle("sel", i === sel && paneOpen === null));
    settingsItems().forEach((li, i) => li.classList.toggle("sel", i === settingsSel && paneOpen === "settings"));
  }

  function openPane(key) {
    paneOpen = key;
    mainList.parentElement.classList.add("hidden");
    panes[key].classList.remove("hidden");
    highlight();
  }
  function closePane() {
    if (paneOpen) panes[paneOpen].classList.add("hidden");
    paneOpen = null;
    mainList.parentElement.classList.remove("hidden");
    highlight();
  }

  function openPause() {
    pauseOpen = true;
    sel = 0;
    closePane();
    pauseEl.classList.remove("hidden");
    highlight();
  }
  function closePause() {
    pauseOpen = false;
    closePane();
    pauseEl.classList.add("hidden");
  }

  function selectMain() {
    const item = listItems()[sel].dataset.item;
    if (item === "resume") { closePause(); return; }
    if (item === "tutorial") {
      closePause();
      if (ETI.replayOnboarding) ETI.replayOnboarding();
      return;
    }
    settingsSel = 0;
    openPane(item);
  }

  function changeSetting(dir) {
    const li = settingsItems()[settingsSel];
    const s = settings[li.dataset.setting];
    s.i = (s.i + dir + s.values.length) % s.values.length;
    s.apply(s.values[s.i]);
    renderSettings();
  }

  // back buttons (touch / mouse) return to the main pause list
  document.querySelectorAll(".pause-pane .back-btn").forEach(b => {
    b.addEventListener("click", closePane);
  });

  // mouse support
  listItems().forEach((li, i) => {
    li.addEventListener("mouseenter", () => { if (!paneOpen) { sel = i; highlight(); } });
    li.addEventListener("click", () => { sel = i; selectMain(); });
  });
  settingsItems().forEach((li, i) => {
    li.addEventListener("mouseenter", () => { settingsSel = i; highlight(); });
    li.addEventListener("click", () => { settingsSel = i; changeSetting(1); });
  });

  /** Returns true if the key was consumed by the pause menu. */
  function pauseKey(k) {
    if (!pauseOpen) return false;
    if (k === "escape") { paneOpen ? closePane() : closePause(); return true; }
    if (paneOpen === "settings") {
      if (k === "w") { settingsSel = Math.max(0, settingsSel - 1); highlight(); }
      if (k === "s") { settingsSel = Math.min(settingsItems().length - 1, settingsSel + 1); highlight(); }
      if (k === "a") changeSetting(-1);
      if (k === "d" || k === "e" || k === "enter") changeSetting(1);
      return true;
    }
    if (paneOpen) { if (k === "e" || k === "enter") closePane(); return true; }
    if (k === "w") { sel = (sel - 1 + listItems().length) % listItems().length; highlight(); }
    if (k === "s") { sel = (sel + 1) % listItems().length; highlight(); }
    if (k === "e" || k === "enter") selectMain();
    return true;
  }

  /* ============================================================
     SECTION PANELS
     ============================================================ */
  const panelEl = document.getElementById("panel");
  let panelOpen = false;

  ETI.openPanel = function (section) {
    document.getElementById("panel-biome").textContent = section.title.toUpperCase();
    document.getElementById("panel-title").textContent = section.sub;
    const body = document.getElementById("panel-body");
    body.innerHTML = "";
    const tpl = document.getElementById(section.content);
    if (tpl) body.appendChild(tpl.content.cloneNode(true));
    const feed = body.querySelector("#posts-feed");
    if (feed) renderPosts(feed);
    panelEl.classList.remove("hidden");
    panelOpen = true;
  };

  function renderPosts(feed) {
    const posts = C.POSTS || [];
    if (!posts.length) {
      feed.innerHTML = '<p class="fine">No transmissions yet. Check back soon.</p>';
      return;
    }
    for (const p of posts) {
      const card = document.createElement("article");
      card.className = "post post-" + p.type;

      let media = "";
      if (p.type === "video" && p.youtube) {
        media = `<div class="post-video"><iframe
          src="https://www.youtube-nocookie.com/embed/${p.youtube}"
          title="${p.title || "Video"}" frameborder="0" loading="lazy"
          allow="accelerometer; encrypted-media; picture-in-picture"
          allowfullscreen></iframe></div>`;
      } else if (p.type === "image" && p.src) {
        media = `<img class="post-img" src="${p.src}" alt="${p.title || "Post image"}" loading="lazy"
                  onerror="this.classList.add('missing')">`;
      }

      card.innerHTML =
        `<header>
           <span class="post-type">${p.type === "video" ? "▶ VIDEO" : p.type === "image" ? "◫ IMAGE" : "✦ POST"}</span>
           <span class="post-date">${p.date || ""}</span>
         </header>
         <h3>${p.title || ""}</h3>
         ${media}
         ${p.text ? `<p>${p.text}</p>` : ""}`;
      feed.appendChild(card);
    }
  }
  function closePanel() { panelEl.classList.add("hidden"); panelOpen = false; }
  panelEl.addEventListener("click", (e) => { if (e.target === panelEl) closePanel(); });
  const panelCloseBtn = document.getElementById("panel-close");
  if (panelCloseBtn) panelCloseBtn.addEventListener("click", (e) => { e.preventDefault(); closePanel(); });

  /* ============================================================
     DEVELOPER ROOM
     ============================================================ */
  const devEl = document.getElementById("devroom");
  const devItems = () => [...document.querySelectorAll("#dev-list li")];
  let devOpen = false;
  let devSel = 0;

  function devHighlight() { devItems().forEach((li, i) => li.classList.toggle("sel", i === devSel)); }
  function openDev() { devOpen = true; devSel = 0; devEl.classList.remove("hidden"); devHighlight(); }
  function closeDev() { devOpen = false; devEl.classList.add("hidden"); }
  function devSelect() {
    const item = devItems()[devSel].dataset.dev;
    if (item === "video") window.open(C.devVideoURL, "_blank", "noopener,noreferrer");
    else closeDev();
  }
  devItems().forEach((li, i) => {
    li.addEventListener("mouseenter", () => { devSel = i; devHighlight(); });
    li.addEventListener("click", () => { devSel = i; devSelect(); });
  });

  function devKey(k) {
    if (!devOpen) return false;
    if (k === "escape") { closeDev(); return true; }
    if (k === "w") { devSel = Math.max(0, devSel - 1); devHighlight(); }
    if (k === "s") { devSel = Math.min(devItems().length - 1, devSel + 1); devHighlight(); }
    if (k === "e" || k === "enter") devSelect();
    return true;
  }

  /* ---------- exports ---------- */
  ETI.ui = {
    tickClock,
    openPause, closePause, pauseKey,
    get pauseOpen() { return pauseOpen; },
    closePanel,
    get panelOpen() { return panelOpen; },
    openDev, devKey,
    get devOpen() { return devOpen; }
  };
})();