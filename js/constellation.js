/* ==========================================================================
   Signal Constellation
   The site's signature motif: nodes drifting in space, quietly connecting
   when they pass near one another — a neural net rendering itself.
   Reused (smaller/quieter) as the connective idea behind the hero portrait.
   ========================================================================== */

(function () {
  const canvas = document.querySelector('[data-constellation]');
  if (!canvas) return;

  // Disable the decorative constellation effect for a cleaner, faster hero experience.
  return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let nodes = [];
  let raf = null;

  const NODE_COUNT = 26;
  const LINK_DIST = 110;
  const COLOR_A = '79,70,229';   // accent
  const COLOR_B = '34,211,238';  // accent-2

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeNodes() {
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.4 + 0.8
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.5;
          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(0, `rgba(${COLOR_A},${alpha})`);
          grad.addColorStop(1, `rgba(${COLOR_B},${alpha})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR_B},0.85)`;
      ctx.fill();
    }

    raf = requestAnimationFrame(step);
  }

  function init() {
    resize();
    makeNodes();
    if (!reduceMotion) {
      if (raf) cancelAnimationFrame(raf);
      step();
    } else {
      // draw a single static frame
      step();
      cancelAnimationFrame(raf);
    }
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 200);
  });

  // Pause when off-screen to save battery/CPU
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!raf && !reduceMotion) step();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
  }, { threshold: 0 });
  io.observe(canvas);

  init();
})();
