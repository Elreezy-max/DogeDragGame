$(function () {
  console.log("document ready");

  //
  // AUDIO: small beep using WebAudio API for max score
  //
  let audioCtx = null;
  function playBeep(frequency = 880, duration = 0.08) {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g);
    g.connect(audioCtx.destination);
    o.type = "sine";
    o.frequency.value = frequency;
    g.gain.value = 0.04;
    o.start();
    setTimeout(() => {
      o.stop();
    }, duration * 1000);
  }

  //
  // 1. MAKE DOGE DRAGGABLE
  //
  $("#doge-meme-pic").draggable({
    containment: "#containment-wrapper",
    scroll: false,
    drag: function () {
      calculateWow();   // live scoring as user drags
    },
    stop: function () {
      calculateWow();   // final update
    }
  });

  //
  // 2. SCORING ZONES
  // define zones as rectangles in px relative to the wrapper
  //
  function getZoneRects() {
    const $wrap = $("#containment-wrapper");
    const wrapOffset = $wrap.offset();
    const wrapW = $wrap.width();
    const wrapH = $wrap.height();

    // left zone: 6% from left, 28% width (match CSS)
    const leftX = wrapOffset.left + wrapW * 0.06;
    const leftW = wrapW * 0.28;
    const leftY = wrapOffset.top + wrapH * 0.10;
    const leftH = wrapH * 0.80;

    // right zone: 6% from right
    const rightX = wrapOffset.left + wrapW * (1 - 0.06 - 0.28);
    const rightW = wrapW * 0.28;
    const rightY = leftY;
    const rightH = leftH;

    return {
      left: { x: leftX, y: leftY, w: leftW, h: leftH, multiplier: 2 },
      right: { x: rightX, y: rightY, w: rightW, h: rightH, multiplier: 3 }
    };
  }

  //
  // 3. DOGE SCORE CALCULATION
  //
  function calculateWow() {
    const $doge = $("#doge-meme-pic");
    const $wrap = $("#containment-wrapper");

    // position relative to wrapper
    // position() gives top/left relative to offset parent (wrapper is positioned)
    const pos = $doge.position(); // top/left relative to wrapper
    const dogeW = $doge.outerWidth();
    const dogeH = $doge.outerHeight();

    // compute "base score" as integer using top + left (like before)
    const baseScore = Math.max(0, Math.floor(pos.top + pos.left));

    // compute center coordinates in page coordinates to test zones
    const wrapOffset = $wrap.offset();
    const centerX = wrapOffset.left + pos.left + dogeW / 2;
    const centerY = wrapOffset.top + pos.top + dogeH / 2;

    // determine multiplier from zones
    const zones = getZoneRects();
    let multiplier = 1;

    // check left
    const l = zones.left;
    if (centerX >= l.x && centerX <= l.x + l.w && centerY >= l.y && centerY <= l.y + l.h) {
      multiplier = Math.max(multiplier, l.multiplier);
    }
    // check right
    const r = zones.right;
    if (centerX >= r.x && centerX <= r.x + r.w && centerY >= r.y && centerY <= r.y + r.h) {
      multiplier = Math.max(multiplier, r.multiplier);
    }

    // final score with multiplier
    const score = baseScore * multiplier;

    // update debug output (legacy)
    if (score < 500) {
      $("#wow-output").html('<strong>not much wow </strong>(' + score + ')');
    } else {
      $("#wow-output").html('<strong>so much wow</strong> (' + score + ')');
    }

    // ---- UI UPDATES ----
    $("#score-display").text(score);

    // multiplier badge
    $("#multiplier-badge")
      .text("×" + multiplier)
      .removeClass("badge-secondary badge-success badge-warning")
      .addClass(multiplier === 1 ? "badge-secondary" : multiplier === 2 ? "badge-warning" : "badge-success");

    // progress bar: treat 1000 as max (as before)
    const percent = Math.min((score / 1000) * 100, 100);
    $("#score-progress").css("width", percent + "%");

    // status message (slightly friendlier + mention multiplier)
    let status = "";
    if (score < 300) {
      status = "Doge is warming up...";
    } else if (score < 600) {
      status = "Wow! Doge is gaining power!";
    } else if (score < 900) {
      status = "Much skill. Very drag. Wow.";
    } else {
      status = "MAXIMUM WOW ACHIEVED! 💥🐶";
    }

    if (multiplier > 1) {
      status += " (multiplier ×" + multiplier + ")";
    }

    $("#status-message").text(status);

    // small audio cue when hitting max (>= 1000)
    if (score >= 1000) {
      playBeep(880, 0.10);
    }
  }

  // initial calculation so UI is consistent on load
  calculateWow();
});
