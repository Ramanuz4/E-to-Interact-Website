/* ============================================================
   E TO INTERACT — dialogue.js
   The mascot's speech box. Typewriter text.
   - blocking dialogue: player advances with E / Enter
   - toast dialogue: shows briefly, auto-hides (shortcut travel)
   ============================================================ */
(function () {
  const box = document.getElementById("dialogue");
  const textEl = document.getElementById("dialogue-text");
  const nextEl = document.getElementById("dialogue-next");

  let queue = [];
  let typing = false;
  let charTimer = null;
  let current = "";
  let onDone = null;
  let blocking = false;
  let toastTimer = null;
  let speed = 22; // ms per char (Settings can change)

  function typeLine(line) {
    typing = true;
    nextEl.style.visibility = "hidden";
    textEl.textContent = "";
    current = line;
    let i = 0;
    clearInterval(charTimer);
    charTimer = setInterval(() => {
      i++;
      textEl.textContent = line.slice(0, i);
      if (i >= line.length) {
        clearInterval(charTimer);
        typing = false;
        if (blocking) nextEl.style.visibility = "visible";
      }
    }, speed);
  }

  function showNext() {
    if (queue.length === 0) {
      hide();
      const cb = onDone; onDone = null;
      if (cb) cb();
      return;
    }
    typeLine(queue.shift());
  }

  function hide() {
    box.classList.add("hidden");
    blocking = false;
    clearInterval(charTimer);
  }

  ETI.dialogue = {
    /** Blocking dialogue: array of lines, advanced with E. */
    say(lines, done) {
      clearTimeout(toastTimer);
      queue = lines.slice();
      onDone = done || null;
      blocking = true;
      box.classList.remove("hidden");
      showNext();
    },

    /** Non-blocking toast (e.g. "Traveling... → Games"). */
    toast(line, ms) {
      clearTimeout(toastTimer);
      queue = [];
      onDone = null;
      blocking = false;
      box.classList.remove("hidden");
      typeLine(line);
      toastTimer = setTimeout(hide, ms || 2200);
    },

    /** Called by input when E/Enter pressed. Returns true if consumed. */
    advance() {
      if (box.classList.contains("hidden") || !blocking) return false;
      if (typing) {
        // fast-forward the current line
        clearInterval(charTimer);
        textEl.textContent = current;
        typing = false;
        nextEl.style.visibility = "visible";
      } else {
        showNext();
      }
      return true;
    },

    get isBlocking() { return blocking && !box.classList.contains("hidden"); },
    setSpeed(msPerChar) { speed = msPerChar; },
    hide
  };
})();