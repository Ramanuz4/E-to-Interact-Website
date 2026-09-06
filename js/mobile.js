/* ============================================================
   E TO INTERACT — mobile.js
   A separate, generic stepper UI for phones and small screens.
   No free-roam movement and no page scrolling: the ▲ / ▼ controls
   (or Arrow/W/S keys) move one section at a time. Vaugn "appears" with
   a brief above each new section (his idle art + a line of dialogue,
   fading in on arrival); that section's own content scrolls
   independently underneath. The navbar lives inside the hamburger menu.

   Reuses desktop's config data and <template> content (world.js's
   free-roam geometry is skipped entirely) so both experiences always
   show the same sections, team, games and posts.
   ============================================================ */
(function () {
  const C = ETI.CONFIG;
  const bpQuery = window.matchMedia("(max-width:1023px), (max-height:420px)");

  let initialized = false;

  function initMobile() {
    if (initialized) return;   // set up once, never twice
    initialized = true;

  const appEl        = document.getElementById("mobile-app");
  const briefEl       = document.getElementById("mob-brief");
  const briefTextEl   = document.getElementById("mob-brief-text");
  const biomeEl       = document.getElementById("mob-biome");
  const titleEl       = document.getElementById("mob-title");
  const bodyEl        = document.getElementById("mob-body");
  const dotsEl        = document.getElementById("mob-dots");
  const upBtn         = document.getElementById("mob-up");
  const downBtn       = document.getElementById("mob-down");
  const hamburgerBtn  = document.getElementById("mob-hamburger");
  const drawerEl      = document.getElementById("mob-navdrawer");
  const scrimEl       = document.getElementById("mob-nav-scrim");
  const logoEl        = document.getElementById("mob-logo");
  if (!appEl || !bodyEl) return;

  /* ---------- the world, flattened into one bottom-to-top list ----------
     Spawn (Home) first, then every C.sections entry in reverse — config
     lists lands top-to-bottom (temple, space, studio, castle, forest); the
     world itself runs bottom-to-top, so reversing gives the true walking
     order: forest, castle, studio, space, temple. Six stops total. About
     Us (forest) has no direct nav-menu entry, exactly like on desktop —
     it's only reached by stepping through it. */
  const SECTIONS = [
    { id: "spawn", biome: "spawn", title: "Spawn", sub: "Welcome", content: "content-spawn",
      enterLine: "Hey, I'm Vaugn! This is Spawn — home base. Use the arrows below to move between areas." }
  ].concat(C.sections.slice().reverse());

  let index = 0;
  let briefTimer = null;

  /* ---------- progress dots ---------- */
  SECTIONS.forEach(() => {
    const dot = document.createElement("span");
    dot.className = "mob-dot";
    dotsEl.appendChild(dot);
  });
  function updateDots() {
    const kids = dotsEl.children;
    for (let i = 0; i < kids.length; i++) kids[i].classList.toggle("on", i === index);
  }

  /* ---------- Vaugn's brief — an in-flow bar above the section card,
     so it never fights the bottom nav controls for screen space. Fades
     in on arrival and quietly tucks itself away after a few seconds
     (tapping ▲/▼ again brings the next one straight back). ---------- */
  function showBrief(line) {
    if (!line) { briefEl.classList.remove("show"); return; }
    clearTimeout(briefTimer);
    briefTextEl.textContent = line;
    briefEl.classList.add("show");
    briefTimer = setTimeout(() => briefEl.classList.remove("show"), 4200);
  }

  /* ---------- render the current section ---------- */
  function render(opts) {
    opts = opts || {};
    const sec = SECTIONS[index];
    biomeEl.textContent = (sec.title || "").toUpperCase();
    titleEl.textContent = sec.sub || sec.title || "";
    if (ETI.renderSectionInto) ETI.renderSectionInto(bodyEl, sec);
    // The shared templates carry desktop-only key hints ("Press G anywhere
    // in the world to travel back here"). They mean nothing on the mobile
    // stepper, so drop any .fine line that mentions pressing a key.
    bodyEl.querySelectorAll(".fine").forEach(el => {
      if (/press\s+[a-z]\b/i.test(el.textContent)) el.remove();
    });
    bodyEl.scrollTop = 0;
    updateDots();
    upBtn.disabled = index === 0;
    downBtn.disabled = index === SECTIONS.length - 1;
    // highlight the matching hamburger link, if this stop has one
    const navBtns = drawerEl.querySelectorAll("[data-shortcut]");
    navBtns.forEach(b => b.classList.toggle("current", b.dataset.shortcut === sec.id));
    if (!opts.silent) showBrief(sec.enterLine);
  }

  function goTo(i) {
    i = Math.max(0, Math.min(SECTIONS.length - 1, i));
    if (i === index) return;
    index = i;
    render();
  }

  upBtn.addEventListener("click", () => goTo(index - 1));
  downBtn.addEventListener("click", () => goTo(index + 1));

  /* ---------- hamburger nav — same destinations as the desktop navbar --- */
  function openDrawer() {
    drawerEl.classList.add("open");
    scrimEl.classList.add("show");
    hamburgerBtn.setAttribute("aria-expanded", "true");
    hamburgerBtn.classList.add("is-open");
  }
  function closeDrawer() {
    drawerEl.classList.remove("open");
    scrimEl.classList.remove("show");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    hamburgerBtn.classList.remove("is-open");
  }
  hamburgerBtn.addEventListener("click", () => {
    if (drawerEl.classList.contains("open")) closeDrawer(); else openDrawer();
  });
  scrimEl.addEventListener("click", closeDrawer);

  drawerEl.querySelectorAll("[data-shortcut]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.shortcut;
      const i = SECTIONS.findIndex(s => s.id === target);
      closeDrawer();
      if (i >= 0) goTo(i);
    });
  });

  if (logoEl) {
    logoEl.addEventListener("click", (e) => { e.preventDefault(); closeDrawer(); goTo(0); });
  }

  /* ---------- keyboard — handy when testing mobile widths on a desktop -- */
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") { closeDrawer(); return; }
    if (drawerEl.classList.contains("open")) return; // don't step while menu is open
    if (ev.key === "ArrowUp" || ev.key === "w" || ev.key === "W") { ev.preventDefault(); goTo(index - 1); }
    else if (ev.key === "ArrowDown" || ev.key === "s" || ev.key === "S") { ev.preventDefault(); goTo(index + 1); }
  });

  /* ---------- block page-level touch scrolling/rubber-banding, but let
     the section body and the nav drawer scroll normally ---------- */
  document.addEventListener("touchmove", (ev) => {
    if (ev.target.closest("#mob-body") || ev.target.closest("#mob-navdrawer")) return;
    ev.preventDefault();
  }, { passive: false });

    render({ silent: true });
    // first-visit greeting, slightly delayed so it doesn't fire before layout settles
    setTimeout(() => showBrief(SECTIONS[0].enterLine), 500);
  } // end initMobile

  /* ---------- decide which experience runs ----------
     If the viewport is mobile-sized at load, set up the mobile UI now.
     If it starts at desktop size, main.js runs the free-roam game instead;
     but if the window is later dragged narrow across the breakpoint, spin
     the mobile UI up on the spot (no reload needed) — this is what fixes the
     "empty shell, dead buttons" state when resizing a desktop window down.
     Going the other way (mobile → desktop) can't hot-swap the game back in,
     so that one direction reloads once to hand control to main.js. */
  if (bpQuery.matches) initMobile();

  bpQuery.addEventListener("change", (e) => {
    if (e.matches) {
      initMobile();                       // became mobile-sized → start mobile UI
    } else if (initialized) {
      location.reload();                  // mobile → desktop → reload into the game
    }
  });
})();

