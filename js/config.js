/* ============================================================
   E TO INTERACT — config.js
   Everything you'll want to tweak lives here.
   ============================================================ */
window.ETI = window.ETI || {};

ETI.CONFIG = {

  /* ---------- YOUR LINKS ---------- */
  // The unlisted YouTube video opened from the Developer Room:
  devVideoURL: "https://youtu.be/YOUR_UNLISTED_VIDEO_ID",

  /* ============================================================
     POSTS — the Space Station feed
     ------------------------------------------------------------
     Add new posts at the TOP of this array. Three types:

     Video (YouTube):
       { type: "video", date: "2026-07-01", title: "Gameplay reveal",
         youtube: "dQw4w9WgXcQ",            // just the video ID
         text: "Optional caption." }

     Image:
       { type: "image", date: "2026-06-20", title: "New key art",
         src: "assets/posts/keyart.png",     // drop files in assets/posts/
         text: "Optional caption." }

     Text / announcement:
       { type: "text", date: "2026-06-01", title: "Devlog #1",
         text: "Anything you want to say." }
     ============================================================ */
  POSTS: [
    { type: "video", date: "2026-07-01", title: "Project Lantern — first look",
      youtube: "YOUR_VIDEO_ID",
      text: "Two minutes of raw gameplay from the cave levels. More soon." },
    { type: "image", date: "2026-06-18", title: "Skybound key art",
      src: "assets/posts/example.png",
      text: "Concept art for the floating islands. (Replace this image in assets/posts/.)" },
    { type: "text", date: "2026-06-02", title: "The station is online",
      text: "This is our posts feed. Trailers, devlogs, screenshots and upcoming-game news will all land here first." }
  ],

  /* ---------- SECRET CODE (W W S S A D A D) ---------- */
  secretCode: ["w", "w", "s", "s", "a", "d", "a", "d"],

  /* ---------- MOVEMENT ---------- */
  walkSpeed: 240,     // px per second
  sprintSpeed: 470,

  /* ---------- DAY / NIGHT ---------- */
  cycleSeconds: 120,  // one full clock rotation (auto cycle)
  timeTransitionSeconds: 2.8,  // sky/atmosphere ease duration on manual toggle

  /* ---------- WORLD NPCs — ambient storytellers (sparse, one per land) ---------- */
  NPCS: [
    /* — Spawn — */
    { id: "camper", zone: "spawn", x: -195, y: 0.56, name: "Camper", kind: "hiker",
      lines: [
        "First climb? The trail above leads into the Forest.",
        "That clock in the corner flips the whole world between day and night. Try it.",
        "I come down here to reset. The campfire never goes out.",
        "At night the stars come out. Worth stopping to look up."
      ] },

    /* — Forest — */
    { id: "forager", zone: "forest", x: 210, y: 0.74, name: "Forager", kind: "ranger",
      lines: [
        "Quiet steps — the mushrooms here only glow after dark.",
        "The Forest sign up ahead tells our story. Worth a read.",
        "I've walked this treeline a hundred times. Still find something new.",
        "At night the fireflies come out. If you flip the clock, you'll see them."
      ] },
    { id: "scout", zone: "forest", x: -190, y: 0.44, name: "Scout", kind: "scout",
      lines: [
        "I map these woods in all weathers. Day and night look like different worlds.",
        "Castle's above the tree line. Just follow the trail.",
        "See that fallen log? I've used it as a seat for three seasons now."
      ] },

    /* — Castle — */
    { id: "guard", zone: "castle", x: -175, y: 0.58, name: "Guard", kind: "guard",
      lines: [
        "Halt... oh, it's you. The Games vault is through the gate.",
        "The banners only look still. Wind off the river keeps them honest.",
        "Night watch is longer, but the torches make fine company.",
        "Press G anywhere to jump straight back here."
      ] },
    { id: "merchant", zone: "castle", x: 200, y: 0.66, name: "Merchant", kind: "merchant",
      lines: [
        "Everything's on display. Nothing's for sale yet.",
        "Games need time to cook. These are still in the oven.",
        "Come back after we ship. The vault fills up quick."
      ] },

    /* — Studio — */
    { id: "dev", zone: "studio", x: 175, y: 0.48, name: "Dev", kind: "coder",
      lines: [
        "Ship day or ship night — we compile either way.",
        "The arcade cabinet? Yeah, it still boots. Barely.",
        "Whiteboard's out of date. The code isn't.",
        "Night shift hits different. The monitors glow brighter when everything else goes dark."
      ] },
    { id: "designer", zone: "studio", x: -180, y: 0.62, name: "Designer", kind: "scholar",
      lines: [
        "Every pixel placed on purpose. Mostly.",
        "The poster up there? I painted it at 2am. Best work I've done.",
        "Press T if you want to meet the whole team properly.",
        "Day mode's great for design. Night mode's great for everything else."
      ] },

    /* — Space — */
    { id: "pilot", zone: "space", x: -160, y: 0.54, name: "Pilot", kind: "pilot",
      lines: [
        "Orbit's quiet. Good place to broadcast what we're building.",
        "That planet drifts by every few hours. I still wave.",
        "Console lights blink whether it's day or night up here. Spooky.",
        "Press P to see everything we've posted so far."
      ] },

    /* — Temple — */
    { id: "keeper", zone: "temple", x: 140, y: 0.62, name: "Keeper", kind: "mystic",
      lines: [
        "Few make the whole climb. You did.",
        "The floating isles below? They're not decoration. They're old foundations.",
        "At night the orbs hum louder. Listen when the clock turns.",
        "The contact sign is just ahead. We actually read everything."
      ] },

    /* — Crossings — */
    { id: "angler", zone: "bridge", x: 165, y: 0.42, name: "Angler", kind: "angler",
      lines: [
        "Mist off the river. Fish don't mind.",
        "Lamps on the bridge stay lit when the clock says night.",
        "Castle's just past here. Mind the planks — they're older than they look.",
        "On a clear night you can see the stars reflected in the water."
      ] }
  ],

  /* ============================================================
     VAUGN'S ANIMATIONS
     ------------------------------------------------------------
     Three states: idle, walking (when moving), running (moving + Shift).
     Two formats are supported per state:

     Animated GIF (easiest — what idle uses now):
       walking: { src: "assets/mascot/walking.gif", gif: true,
                  dispW: 78, dispH: 128 }        // display size in px

     Horizontal sprite strip ([frame1][frame2]... side by side):
       walking: { src: "assets/mascot/walking.png", frames: 6, fps: 10,
                  frameW: 64, frameH: 96 }

     A state without a src falls back to the idle GIF (with a little
     rocking motion) — so drop in walking.gif / running.gif whenever
     they're ready and fill in src.
     ============================================================ */
  ANIMATIONS: {
    idle:    { src: "assets/mascot/idle.gif", gif: true, dispW: 78, dispH: 128 },
    walking: { src: null, gif: true, dispW: 78, dispH: 128 },
    running: { src: null, gif: true, dispW: 78, dispH: 128 }
    // Add more states here (e.g. wave, lantern) and call
    // ETI.mascot.setState("wave") from anywhere.
  },

  /* ============================================================
     THE WORLD — bottom to top
     Spawn sits at the bottom; W walks you upward.
     ============================================================ */
  sectionHeight: 1600,
  transitionHeight: 560,
  spawnHeight: 1100,

  // Order here is TOP → BOTTOM (how it's laid out in the page).
  sections: [
    { id: "temple", icon: "☁", biome: "temple", title: "Sky Temple",    sub: "Contact",      content: "content-contact",
      enterLine: "The Sky Temple. Top of the world. Not many make the whole climb." },
    { id: "space",  icon: "🏙", biome: "space",  title: "Space Station", sub: "Posts",        content: "content-posts",
      enterLine: "The station. This is where we broadcast everything we're working on." },
    { id: "studio", icon: "🏠", biome: "studio", title: "The Studio",    sub: "Meet the Team", content: "content-team",
      enterLine: "This is where we actually work. Mind the cables." },
    { id: "castle", icon: "🏰", biome: "castle", title: "The Castle",    sub: "Games",        content: "content-games",
      enterLine: "The Castle. Every game we've ever built is kept in here." },
    { id: "forest", icon: "🌲", biome: "forest", title: "The Forest",    sub: "About Us",     content: "content-about",
      enterLine: "Ah, the Forest. Our story starts here." }
    // Spawn is added automatically at the bottom.
  ],

  /* ---------- TRANSITIONS between sections (top -> bottom) ----------
     Each crossing between two lands is unique. Order matches the
     gaps between the sections above:
     temple<->space, space<->studio, studio<->castle,
     castle<->forest, forest<->spawn                              */
  transitions: [
    { id: "skybridge", name: "Sky Bridge",      line: "Hold on — it gets windy up here on the sky bridge." },
    { id: "elevator",  name: "Launch Elevator", line: "Going up. Next stop: orbit." },
    { id: "stairs",    name: "Tower Stairs",    line: "Old tower stairs. Watch your step — I'll light a torch.", dark: true },
    { id: "bridge",    name: "The Old Bridge",  line: "The old bridge. Mist rolls in off the river all day." },
    { id: "trail",     name: "Forest Trail",    line: "This trail leads up into the woods. Come on." }
  ],

  /* ---------- SKIES (day / night gradients per biome) ---------- */
  skies: {
    spawn:  { day: "linear-gradient(#5fb2d4, #b9dfe9 70%, #9fd4ac)",
              night: "linear-gradient(#0b1030, #1d2b52 70%, #16324a)" },
    forest: { day: "linear-gradient(#6fbfe6, #aedcb4 75%, #86c791)",
              night: "linear-gradient(#0a0f2c, #14324a 75%, #0f2e26)" },
    castle: { day: "linear-gradient(#98a9c4, #d3c4a4 80%, #b3a186)",
              night: "linear-gradient(#141327, #2a2050 80%, #1c1637)" },
    studio: { day: "linear-gradient(#e6c48c, #dcae72 80%, #c58c52)",
              night: "linear-gradient(#241a33, #3a2b52 80%, #2a1d40)" },
    space:  { day: "linear-gradient(#0d0a26, #241a4d 70%, #131034)",
              night: "linear-gradient(#05030f, #140f33 70%, #0a0720)" },
    temple: { day: "linear-gradient(#f0b9d3, #aacdf0 70%, #93c6ef)",
              night: "linear-gradient(#170f33, #33265c 70%, #1f1a4a)" },
    trail:  { day: "linear-gradient(#6aa974, #93c493 70%, #79b083)",
              night: "linear-gradient(#0c2418, #14402a 70%, #0f3322)" },
    bridge: { day: "linear-gradient(#8fa8bd, #bccdd6 60%, #7fa3b8)",
              night: "linear-gradient(#0d1526, #1d3348 60%, #12283a)" },
    stairs: { day: "linear-gradient(#1c1722, #2a2333)",
              night: "linear-gradient(#120f18, #1e1926)" },
    elevator:{ day: "linear-gradient(#3a4454, #5a6a80 50%, #2e3644)",
              night: "linear-gradient(#232b38, #3a4656 50%, #1d232e)" },
    skybridge:{ day: "linear-gradient(#7fa9d9, #b3cdea 60%, #93b9e2)",
              night: "linear-gradient(#0f1233, #22265c 60%, #171a44)" }
  },

  /* ---------- PARTICLES per biome ---------- */
  particles: {
    spawn:  { count: 26, colors: ["#ffd24a", "#ff9a3d"], size: [2, 4], vy: [-40, -14], vx: [-8, 8],  fade: true  },
    forest: { count: 42, colors: ["#9fd6a8", "#e6c86e", "#6ee7a8"], size: [3, 6], vy: [12, 34],  vx: [-22, 6], fade: false },
    forestNight: { count: 30, colors: ["#d8ffb0", "#fff7a0"], size: [2, 3], vy: [-8, 8], vx: [-12, 12], glow: true },
    castle: { count: 30, colors: ["#ff9a3d", "#ffd24a"], size: [2, 4], vy: [-46, -18], vx: [-6, 6],  fade: true  },
    studio: { count: 24, colors: ["#f5efdc", "#d9c9a0"], size: [1, 3], vy: [-6, 6],   vx: [-10, 10], fade: false },
    space:  { count: 60, colors: ["#ffffff", "#b78bff", "#8fd3f4"], size: [1, 3], vy: [4, 14], vx: [-30, -8], fade: false },
    temple: { count: 34, colors: ["#ffb8d8", "#e8d0ff", "#fff0b8"], size: [3, 6], vy: [8, 22],  vx: [-14, 14], fade: false },
    trail:  { count: 28, colors: ["#cfe36e", "#ffd24a", "#8fd3a0"], size: [3, 5], vy: [-14, 10], vx: [-20, 20], fade: false },
    bridge: { count: 20, colors: ["#e8eef2", "#cdd8de"], size: [6, 11], vy: [-4, 4],  vx: [10, 32],  fade: true  },
    stairs: { count: 16, colors: ["#ff9a3d", "#ffd24a"], size: [2, 3], vy: [-42, -16], vx: [-5, 5],  fade: true  },
    elevator:{ count: 34, colors: ["#8fd3f4", "#e8f4ff"], size: [2, 3], vy: [90, 170], vx: [0, 0],   fade: false },
    skybridge:{ count: 34, colors: ["#ffffff", "#cfe2ff"], size: [2, 4], vy: [-6, 6],  vx: [-70, -28], fade: false }
  }
};