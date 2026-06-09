// ============================================================
// Scroll reveal — staggered cards
// ============================================================
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
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
  if (glow) glow.style.display = "none";
}

// ============================================================
// AmoebaX Particle Animation
// ============================================================
const canvas = document.getElementById("particleCanvas");

if (canvas) {
  const xWrapper = canvas.closest(".x-wrapper");
  const xLetter = document.querySelector(".x-letter");
  const amoebaText = document.getElementById("amoebaText");

  // ── Size canvas to wrapper ────────────────────────────────
  // We give the canvas 2× the wrapper so the sphere has
  // room to breathe — then we offset it so its center aligns
  // with the wrapper center.
  const W = xWrapper ? xWrapper.offsetWidth : 160;
  const H = xWrapper ? xWrapper.offsetHeight : 160;

  // Canvas is 2.4× the wrapper so the sphere overflows naturally
  const MULT = 2.4;
  const C = Math.round(W * MULT);

  canvas.width = C;
  canvas.height = C;
  // Keep it centered on the wrapper via CSS
  canvas.style.width = C + "px";
  canvas.style.height = C + "px";

  const ctx = canvas.getContext("2d");
  const cx = C / 2;
  const cy = C / 2;

  // Scale everything relative to the wrapper width
  // (treat W=160 as the design baseline)
  const scale = W / 160;

  const colors = [
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#00ffd0",
    "#33e6ff",
    "#7f6fff",
  ];

  // ── Build X glyph target points ──────────────────────────
  const xGlyphSize = Math.round(W * 0.95); // glyph fills ~95% of wrapper
  const tCanvas = document.createElement("canvas");
  tCanvas.width = xGlyphSize;
  tCanvas.height = xGlyphSize;
  const tCtx = tCanvas.getContext("2d");
  tCtx.fillStyle = "white";
  tCtx.font = `bold ${Math.round(xGlyphSize * 0.78)}px Inter, system-ui, sans-serif`;
  tCtx.textAlign = "center";
  tCtx.textBaseline = "middle";
  tCtx.fillText("X", xGlyphSize / 2, xGlyphSize / 2);

  const imageData = tCtx.getImageData(0, 0, xGlyphSize, xGlyphSize);
  const targets = [];
  const step = Math.max(1, Math.round(1.8 * scale));

  for (let py = 0; py < xGlyphSize; py += step) {
    for (let px = 0; px < xGlyphSize; px += step) {
      const i = (py * xGlyphSize + px) * 4;
      if (imageData.data[i + 3] > 100) {
        targets.push({
          x: cx + px - xGlyphSize / 2,
          y: cy + py - xGlyphSize / 2,
        });
      }
    }
  }

  // ── Sphere radius: big enough to look like a globe ───────
  // Use 1.1× the canvas half-width so it really fills the space
  const baseRadius = C * 0.42;

  // Perspective: scale with canvas size for consistent depth feel
  const PERSP = C * 3.5;

  const particles = [];
  targets.forEach((target) => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = baseRadius * (0.88 + Math.random() * 0.24);

    particles.push({
      theta,
      phi,
      radius: r,
      rotationSpeed: 0.003 + Math.random() * 0.005,
      x: cx,
      y: cy,
      depth: 1,
      targetX: target.x,
      targetY: target.y,
      baseSize: (0.8 + Math.random() * 0.6) * scale,
      size: 0.5 * scale,
      alpha: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  });

  // ── Slide distance calculation ────────────────────────────
  // After animation the X letter sits inside the wrapper.
  // We want "Amoeba" to end up touching the X, with just the
  // natural letter-spacing gap. So we slide it by the full
  // wrapper half-width, which closes the gap completely.
  const slideAmount = Math.round(W / 2);

  const start = performance.now();
  let slideDone = false;
  let xDone = false;

  function animate(now) {
    const t = now - start;
    ctx.clearRect(0, 0, C, C);

    for (const p of particles) {
      // ── Phase 1: rotating sphere (0–2.5 s) ──────────────
      if (t < 2500) {
        p.theta += p.rotationSpeed;
        const x3 = p.radius * Math.sin(p.phi) * Math.cos(p.theta);
        const y3 = p.radius * Math.cos(p.phi);
        const z3 = p.radius * Math.sin(p.phi) * Math.sin(p.theta);
        const d = PERSP / (PERSP + z3);
        p.depth = d;
        p.x = cx + x3 * d;
        p.y = cy + y3 * d;
        p.size = Math.max(0.2 * scale, p.baseSize * d * 1.3);
      }
      // ── Phase 2: implosion (2.5–4.5 s) ──────────────────
      else if (t < 4500) {
        p.theta += 0.16;
        p.radius *= 0.977;
        const x3 = p.radius * Math.sin(p.phi) * Math.cos(p.theta);
        const y3 = p.radius * Math.cos(p.phi);
        const z3 = p.radius * Math.sin(p.phi) * Math.sin(p.theta);
        const d = PERSP / (PERSP + z3);
        p.depth = d;
        p.x = cx + x3 * d;
        p.y = cy + y3 * d;
      }
      // ── Phase 3: converge to X (4.5 s+) ─────────────────
      else {
        p.x += (p.targetX - p.x) * 0.1;
        p.y += (p.targetY - p.y) * 0.1;
        p.depth = 1;
      }

      // Fade out (6.3 s+)
      if (t > 6300) p.alpha = Math.max(0, p.alpha - 0.014);

      ctx.globalAlpha = Math.max(0, p.alpha) * p.depth;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.15, p.size), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Slide "Amoeba" — closes to the X
    if (t > 4500 && !slideDone) {
      amoebaText.style.transform = `translateX(-${slideAmount}px)`;
      slideDone = true;
    }

    // Reveal X letter
    if (t > 5000 && !xDone) {
      xLetter.style.opacity = "1";
      xLetter.style.transform = "scale(1)";
      xDone = true;
    }

    if (t < 8500) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
