# E to Interact — Website

One tall game world instead of a webpage. Spawn is at the bottom; hold **W** to walk up through the Forest (About), Castle (Games), Studio (Team), Space Station (Posts) and Sky Temple (Contact), with a unique crossing between every level — a forest trail, an old misty bridge, torchlit tower stairs, a launch elevator, and a sky bridge.

## Run it

No build step, no dependencies. Either:

- Open `index.html` directly in a browser, **or**
- Serve the folder (recommended, so fonts and future sprite sheets load cleanly):

```bash
cd e-to-interact
python3 -m http.server 8000
# then open http://localhost:8000
```

## Project structure

```
index.html          Page structure, HUD, menus, section content templates
css/style.css       All styling: biome skies, mascot, dialogue, menus, decor
js/config.js        ← Everything you'll tweak: links, world, ANIMATIONS
js/particles.js     Biome-aware particle system (leaves, embers, stars...)
js/dialogue.js      Typewriter dialogue box (blocking + toast modes)
js/mascot.js        Mascot state machine (idle/walking/running)
js/world.js         Builds the world, biome detection, sky crossfade
js/ui.js            Pause menu, settings, rotating clock, panels, dev room
js/main.js          Boot sequence, input, camera, travel, secret code
assets/mascot/      Drop your sprite sheets here later
assets/brand/       Logo + favicons (logo.png, favicon.ico, favicon-*.png)
```

Load order matters: `config → particles → dialogue → mascot → world → ui → main` (already set in `index.html`).

## Controls

| Key | Action |
|---|---|
| W / S | Walk up / down the world |
| A / D | Sidestep |
| Shift | Sprint |
| E | Interact / advance dialogue |
| H / G / T / P / C | Travel to Home / Games / Team / Posts / Contact |
| Esc | Pause menu |

**On phones and tablets** the keyboard becomes on-screen controls: an analog joystick (with W/A/S/D labels) moves Vaugn, a big E keycap interacts, SHIFT latches sprint, ESC opens the pause menu, MAP opens a fast-travel sheet, and H/G/T/P/C shortcut keycaps travel directly. The secret code works on touch too — push the stick in each direction, returning to centre between pushes.

The clock (top-right) slowly rotates and drives the day/night cycle. Click it to spin to the next half — the sky, stars, lighting and particles all change.

## Adding Vaugn's animations

The mascot is **Vaugn**. His **idle** animation is already wired up (`assets/mascot/idle.gif`). Two more states — **walking** (when moving) and **running** (when moving while holding Shift) — currently borrow the idle GIF (with a gentle rocking cue and a `[walking]`/`[running]` label) until you provide them.

Two formats work — set them in `ANIMATIONS` in `js/config.js`:

```js
// Animated GIF (easiest): the browser plays it by itself
walking: { src: "assets/mascot/walking.gif", gif: true, dispW: 78, dispH: 128 },
running: { src: "assets/mascot/running.gif", gif: true, dispW: 78, dispH: 128 },

// Or a sprite strip PNG (frames side by side in one image)
up:   { src: "assets/mascot/up.png", frames: 6, fps: 10, frameW: 64, frameH: 96 },
```

`dispW`/`dispH` (or `frameW`/`frameH` for strips) sets the on-screen size. Drop the files in `assets/mascot/`, fill in `src`, and the engine switches over automatically.

**Left / right can share one GIF:** give either `left` or `right` a `src` and leave the other `null` — the engine mirrors the art for the opposite direction. To add new states (wave, lantern, etc.), add an entry and call `ETI.mascot.setState("wave")`.

## Other things to fill in

- **Developer Room video** — in `js/config.js`, set `devVideoURL` to your unlisted YouTube link. (Reached via the secret code: `W W S S A D A D`.)
- **Posts feed** — the Space Station section is driven by the `POSTS` array at the top of `js/config.js`. Add new entries at the top of the array; three types are supported:
  - `{ type: "video", youtube: "VIDEO_ID", title, date, text }` — embeds the YouTube video (use just the ID from the URL)
  - `{ type: "image", src: "assets/posts/file.png", title, date, text }` — drop image files into `assets/posts/`
  - `{ type: "text", title, date, text }` — plain announcement
- **Section content** — the About / Games / Team / Contact text lives in `<template>` blocks at the bottom of `index.html`.
- **Timings & speeds** — walk/sprint speed and the day/night cycle length are at the top of `js/config.js`.
