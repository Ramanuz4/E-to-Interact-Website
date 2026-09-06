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
     Add new posts at the TOP of this array. Four post types:

     Video (YouTube):
       { type: "video", tab: "videos", date: "2026-07-01", title: "Gameplay reveal",
         youtube: "dQw4w9WgXcQ",            // just the video ID
         text: "Optional caption." }

     Reel (self-hosted vertical video):
       { type: "reel", tab: "reels", date: "2026-07-05", title: "Teaser",
         src: "assets/reels/teaser.mp4",     // drop the .mp4 in assets/reels/
         poster: "assets/reels/teaser.jpg",  // optional thumbnail
         text: "Optional caption." }

     Image:
       { type: "image", tab: "posts", date: "2026-06-20", title: "New key art",
         src: "assets/posts/keyart.png",     // drop images in assets/posts/
         text: "Optional caption." }

     Text / announcement:
       { type: "text", tab: "posts", date: "2026-06-01", title: "Devlog #1",
         text: "Anything you want to say." }

     Media lives in three folders that mirror the tabs:
       assets/posts/   — images for Posts
       assets/reels/   — .mp4 clips for Reels
       assets/videos/  — files for Videos (YouTube posts need no file)

     The feed has three fixed tabs: Posts, Reels, Videos. A post's `tab`
     field ("posts" | "reels" | "videos") decides which tab it appears
     under. If you leave `tab` out: reels fall under Reels, videos under
     Videos, and everything else under Posts.
     ============================================================ */
  POSTS: [
    { type: "reel", tab: "reels", date: "2026-09-06", title: "Meet VAUGN \ud83c\udf00",
      src: "assets/reels/meet-vaugn-reel.mp4",
      text:
        "She took her time, but she\u2019s finally here \ud83c\udf00<br><br>" +
        "Follow us everywhere:<br>" +
        "Founder\u2019s Instagram: <a href=\"https://www.instagram.com/_ramanuz_/\" target=\"_blank\" rel=\"noopener\">@_ramanuz_</a><br>" +
        "Twitter/X: <a href=\"https://twitter.com/etogamestudio\" target=\"_blank\" rel=\"noopener\">etogamestudio</a><br>" +
        "Discord: <a href=\"https://discord.gg/BjpDTVCkFB\" target=\"_blank\" rel=\"noopener\">discord.gg/BjpDTVCkFB</a>" },
    { type: "image", tab: "posts", date: "2026-09-06", title: "Meet VAUGN \ud83c\udf1f",
      src: "assets/posts/meet-vaugn.png",
      text:
        "She\u2019s small, she\u2019s spooky, and she brags about our video games.<br><br>" +
        "Follow us everywhere:<br>" +
        "Founder\u2019s Instagram: <a href=\"https://www.instagram.com/_ramanuz_/\" target=\"_blank\" rel=\"noopener\">@_ramanuz_</a><br>" +
        "Twitter/X: <a href=\"https://twitter.com/etogamestudio\" target=\"_blank\" rel=\"noopener\">etogamestudio</a><br>" +
        "Discord: <a href=\"https://discord.gg/BjpDTVCkFB\" target=\"_blank\" rel=\"noopener\">discord.gg/BjpDTVCkFB</a>" },
    { type: "image", tab: "posts", date: "2026-09-06", title: "Guess Who? Our Mascot \u2b50",
      src: "assets/posts/guess-who-mascot.png",
      text:
        "The silhouette is all you get for now!! But can you figure out who\u2019s hiding behind the mystery? Drop your guess in the comments! \ud83d\udc47<br><br>" +
        "Follow us everywhere:<br>" +
        "Founder\u2019s Instagram: <a href=\"https://www.instagram.com/_ramanuz_/\" target=\"_blank\" rel=\"noopener\">@_ramanuz_</a><br>" +
        "Twitter/X: <a href=\"https://twitter.com/etogamestudio\" target=\"_blank\" rel=\"noopener\">etogamestudio</a><br>" +
        "Discord: <a href=\"https://discord.gg/BjpDTVCkFB\" target=\"_blank\" rel=\"noopener\">discord.gg/BjpDTVCkFB</a><br><br>" +
        "<span class=\"post-tags\">#indiedev #buildingagame #mascot #2dgame #developer</span>" },
  ],

  /* ============================================================
     GAMES — the Castle vault
     ------------------------------------------------------------
     Each game gets its own card in the Games grid and its own
     dedicated detail page. Add/remove entries freely; `id` is what
     POSTS use in their `game` field to link posts to a title.

     `art` reuses one of the .g1 / .g2 / .g3 placeholder art blocks
     from style.css — add more (.g4, .g5...) if you add more games.
     ============================================================ */
  GAMES: [
    // No games listed yet — the Games section shows "Will be uploaded soon."
  ],

  /* ---------- SECRET CODE (W W S S A D A D) ---------- */
  secretCode: ["w", "w", "s", "s", "a", "d", "a", "d"],

  /* ---------- MOVEMENT ---------- */
  walkSpeed: 240,     // px per second
  sprintSpeed: 470,

  /* ---------- DAY / NIGHT ---------- */
  cycleSeconds: 120,  // one full clock rotation (auto cycle)
  timeTransitionSeconds: 2.8,  // sky/atmosphere ease duration on manual toggle

  /* ---------- WORLD NPCs — the team, scattered across the world ----------
     Each slot keeps its original zone / x / y / kind so the costume and
     placement stay exactly as tuned. Only the person and their lines change.
     People are placed where their real job fits the land they're standing in. */
  NPCS: [
    /* — Spawn — Devika (Marketing Lead) greets you at the trailhead. */
    { id: "devika", zone: "spawn", x: -195, y: 0.56, name: "Devika Thapa", kind: "hiker",
      lines: [
        "You made it. I'm Devika — I handle marketing, so meeting people is the job.",
        "First climb? The trail above leads into the Forest. Our story starts there.",
        "That clock in the corner flips the whole world between day and night. Go on, try it.",
        "Everyone reaches the top eventually. The campfire's here when you need a reset."
      ] },

    /* — Forest (About Us) — Anushka leads design; the origin story is hers to tell. */
    { id: "anushka", zone: "forest", x: 210, y: 0.74, name: "Anushka Srivastave", kind: "ranger",
      lines: [
        "Anushka — I lead game design. This forest was the first thing we ever built.",
        "The sign up ahead tells our story properly. Worth a read.",
        "Quiet steps — the mushrooms here only glow after dark. That was deliberate.",
        "Flip the clock and the fireflies come out. Same woods, completely different feeling."
      ] },
    { id: "ayush", zone: "forest", x: -190, y: 0.44, name: "Ayush Roy", kind: "scout",
      lines: [
        "Ayush, design side. I walk every path we make to check it actually feels good.",
        "I mapped these woods in day and in night. They read like two different places.",
        "Castle's above the tree line. Just follow the trail — you can't really get lost.",
        "See that fallen log? I left it in on purpose. Empty space needs somewhere to rest."
      ] },

    /* — Castle (Games) — Bhutesh guards the vault; Sahil explains what's still cooking. */
    { id: "bhutesh", zone: "castle", x: -175, y: 0.58, name: "Bhutesh Mehra", kind: "guard",
      lines: [
        "Halt... ah, it's you. Bhutesh — co-founder. I program, and I mind this gate.",
        "The Games vault is through there. Everything we've built ends up inside.",
        "Banners only look still. The wind off the river keeps them honest.",
        "Press G anywhere in the world to come straight back here."
      ] },
    { id: "sahil", zone: "castle", x: 200, y: 0.66, name: "Sahil Kumar Ekka", kind: "merchant",
      lines: [
        "Sahil, game design. Everything here is on display — nothing's for sale yet.",
        "Games need time to cook. Ours are very much still in the oven.",
        "I'd rather ship one thing that plays well than five that nearly do.",
        "Come back after we launch. This vault fills up quicker than you'd think."
      ] },

    /* — Studio (Meet the Team) — Ramanuz at the keyboard. */
    { id: "ramanuz", zone: "studio", x: 175, y: 0.48, name: "Ramanuz Kashyap", kind: "coder",
      lines: [
        "Ramanuz — I founded this place, and I still write most of the code.",
        "Ship day or ship night, we compile either way.",
        "The whiteboard is out of date. The code isn't. That's the trade.",
        "Night shift hits different. Monitors glow brighter when everything else goes dark."
      ] },

    /* — Space Station (Posts) — Lucio broadcasts what we're making. */
    { id: "lucio", zone: "space", x: -160, y: 0.54, name: "Lucio T", kind: "pilot",
      lines: [
        "Lucio, marketing. If you've seen anything of ours online, it left from this station.",
        "Orbit's quiet. Good place to broadcast what we're building.",
        "Press P from anywhere to see everything we've posted so far.",
        "That planet drifts past every few hours. I still wave. Every time."
      ] },

    /* — Sky Temple (Contact) — Saugata handles sound; the temple hums. */
    { id: "saugata", zone: "temple", x: 140, y: 0.62, name: "Saugata Deb", kind: "mystic",
      lines: [
        "Few make the whole climb. You did. I'm Saugata — sound and SFX.",
        "Stand still a moment. This place has a hum. I tuned it that way.",
        "At night the orbs ring louder. Listen right after the clock turns.",
        "The contact sign is just ahead. Send us something — we actually read all of it."
      ] },

    /* — Bridge crossing — Ashmeet edits; a river is a good place to wait for the cut. */
    { id: "ashmeet", zone: "bridge", x: 165, y: 0.42, name: "Ashmeet Singh", kind: "angler",
      lines: [
        "Ashmeet — I cut the videos. Editing is mostly waiting for the right moment, like this.",
        "Mist off the river, lamps on the planks. That's a shot, whether I film it or not.",
        "Castle's just past here. Mind your step — those boards are older than they look.",
        "On a clear night the stars land in the water. I've never got that on camera properly."
      ] }
  ],

  /* ============================================================
     VAUGN'S ANIMATIONS
     ------------------------------------------------------------
     Vaugn uses a single animation: the idle GIF. It's symmetric, so it
     reads correctly whether he's standing still or moving in any
     direction. The walking/running motion (a gentle bob) is generated
     in code on top of this same idle art — there are no separate
     walk/run image files.

     If you ever add a dedicated animation later, drop the file in
     assets/mascot/ and add an entry here, e.g.:
       walking: { src: "assets/mascot/walking.gif", gif: true, dispW: 99, dispH: 145 }
     then it will be used automatically for that state.
     ============================================================ */
  ANIMATIONS: {
    idle: { src: "assets/mascot/idle.gif", gif: true, dispW: 99, dispH: 145 }
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