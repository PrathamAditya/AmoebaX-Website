// ============================================================
// Scroll reveal — staggered cards
// ============================================================
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target); // fire once
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
);

document
  .querySelectorAll(".reveal-card")
  .forEach((el) => revealObserver.observe(el));

// ============================================================
// Cursor glow (desktop only)
// ============================================================
const glow = document.querySelector(".cursor-glow");
if (window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
} else {
  glow.style.display = "none";
}

// ============================================================
// AmoebaX Particle Animation
// ============================================================
const canvas = document.getElementById("particleCanvas");

if (canvas) {
  const xWrapper = canvas.closest(".x-wrapper");

  // Read the wrapper's rendered size — use offsetWidth for integer pixels
  const wrapperSize = xWrapper ? xWrapper.offsetWidth : 160;
  const C = Math.max(wrapperSize, 80); // canvas dimension

  // Set canvas resolution to match the wrapper exactly
  canvas.width = C;
  canvas.height = C;
  canvas.style.width = C + "px";
  canvas.style.height = C + "px";

  const ctx = canvas.getContext("2d");
  const cx = C / 2; // center
  const cy = C / 2;

  // Scale factor: the original design was sized for a 160px wrapper
  const scale = C / 160;

  const colors = [
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#00ffd0",
    "#33e6ff",
    "#7f6fff",
  ];

  const amoebaText = document.getElementById("amoebaText");
  const xLetter = document.querySelector(".x-letter");

  // ── Build X shape at correct scale ──────────────────────────
  const xGlyphSize = Math.round(160 * scale);
  const tCanvas = document.createElement("canvas");
  tCanvas.width = xGlyphSize;
  tCanvas.height = xGlyphSize;
  const tCtx = tCanvas.getContext("2d");
  tCtx.fillStyle = "white";
  tCtx.font = `bold ${Math.round(124 * scale)}px Inter, system-ui`;
  tCtx.textAlign = "center";
  tCtx.textBaseline = "middle";
  tCtx.fillText("X", xGlyphSize / 2, xGlyphSize / 2);

  const imageData = tCtx.getImageData(0, 0, xGlyphSize, xGlyphSize);
  const targets = [];
  const step = Math.max(1, Math.round(2 * scale));

  for (let y = 0; y < xGlyphSize; y += step) {
    for (let x = 0; x < xGlyphSize; x += step) {
      const i = (y * xGlyphSize + x) * 4;
      if (imageData.data[i + 3] > 100) {
        targets.push({
          x: cx + x - xGlyphSize / 2,
          y: cy + y - xGlyphSize / 2,
        });
      }
    }
  }

  // ── Spawn particles ──────────────────────────────────────────
  const baseRadius = 90 * scale;
  const particles = [];

  targets.forEach((target) => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = baseRadius * (0.85 + Math.random() * 0.3);

    particles.push({
      theta,
      phi,
      radius: r,
      rotationSpeed: 0.004 + Math.random() * 0.006,
      x: cx,
      y: cy,
      depth: 1,
      targetX: target.x,
      targetY: target.y,
      baseSize: (Math.random() * 0.5 + 0.2) * scale,
      size: 0.3 * scale,
      alpha: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  });

  const start = performance.now();
  let slideDone = false;
  let xDone = false;

  function animate(now) {
    const t = now - start;
    ctx.clearRect(0, 0, C, C);

    for (const p of particles) {
      // Phase 1 — rotating sphere (0–2.5 s)
      if (t < 2500) {
        p.theta += p.rotationSpeed;
        const x3 = p.radius * Math.sin(p.phi) * Math.cos(p.theta);
        const y3 = p.radius * Math.cos(p.phi);
        const z3 = p.radius * Math.sin(p.phi) * Math.sin(p.theta);
        const persp = 900 / (900 + z3);
        p.depth = persp;
        p.x = cx + x3 * persp;
        p.y = cy + y3 * persp;
        p.size = Math.max(0.1 * scale, p.baseSize * persp * 1.2);
      }
      // Phase 2 — implosion (2.5–4.5 s)
      else if (t < 4500) {
        p.theta += 0.18;
        p.radius *= 0.979;
        const x3 = p.radius * Math.sin(p.phi) * Math.cos(p.theta);
        const y3 = p.radius * Math.cos(p.phi);
        const z3 = p.radius * Math.sin(p.phi) * Math.sin(p.theta);
        const persp = 900 / (900 + z3);
        p.depth = persp;
        p.x = cx + x3 * persp;
        p.y = cy + y3 * persp;
      }
      // Phase 3 — converge to X (4.5 s+)
      else {
        p.x += (p.targetX - p.x) * 0.11;
        p.y += (p.targetY - p.y) * 0.11;
        p.depth = 1;
      }

      // Fade out (6.2 s+)
      if (t > 6200) p.alpha = Math.max(0, p.alpha - 0.015);

      ctx.globalAlpha = Math.max(0, p.alpha) * p.depth;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 14;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Slide "Amoeba" left — distance = half the wrapper width
    if (t > 4500 && !slideDone) {
      const slide = Math.round(C * 0.52);
      amoebaText.style.transform = `translateX(-${slide}px)`;
      slideDone = true;
    }

    // Reveal X letter
    if (t > 5100 && !xDone) {
      xLetter.style.opacity = "1";
      xLetter.style.transform = "scale(1)";
      xDone = true;
    }

    if (t < 8000) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
