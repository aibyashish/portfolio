/* ==========================================================================
   MAIN — nav behaviour, magnetic buttons, scroll reveal,
   pipeline progress, animated skill bars, current year.
   ========================================================================== */

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Nav scroll state + mobile toggle ---------------- */
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');

  const onScroll = () => {
    if (window.scrollY > 12) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* ---------------- Magnetic buttons ---------------- */
  // Disabled magnetic hover motion for a cleaner, faster experience.

  /* ---------------- Smooth internal scrolling ---------------- */
  const easeOutQuad = (t) => t * (2 - t);
  const smoothScroll = (target, duration = 400) => {
    const startY = window.scrollY;
    const targetRect = target.getBoundingClientRect();
    const targetY = startY + targetRect.top;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const finalY = Math.min(targetY, maxScroll);
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + (finalY - startY) * easeOutQuad(progress));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#' || href.startsWith('#!')) return;
    const targetId = href.slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    link.addEventListener('click', (event) => {
      event.preventDefault();
      smoothScroll(target, 360);
      if (navLinks && navLinks.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
        navToggle?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------- Pipeline progress line + active nodes ---------------- */
  const pipelineRail = document.querySelector('.pipeline__rail');
  const pipelineProgress = document.querySelector('.pipeline__rail-progress');
  const pipelineNodes = document.querySelectorAll('.pipeline__node');
  if (pipelineRail && pipelineProgress) {
    const isVertical = () => window.innerWidth <= 980;
    const pipelineIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (isVertical()) pipelineProgress.style.height = '100%';
            else pipelineProgress.style.width = '92%';
            pipelineNodes.forEach((node, i) => {
              setTimeout(() => node.classList.add('is-active'), i * 130);
            });
            pipelineIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    pipelineIO.observe(pipelineRail);
  }

  /* ---------------- Animated skill bars ---------------- */
  const skillBars = document.querySelectorAll('.skill-bar__fill');
  if (skillBars.length) {
    const skillIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.width = entry.target.dataset.level + '%';
            skillIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    skillBars.forEach((bar) => skillIO.observe(bar));
  }

  /* ---------------- Footer year ---------------- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Contact form submission ---------------- */
  const contactForm = document.querySelector('.contact__form');
  const contactStatus = document.querySelector('.contact__status');
  if (contactForm && contactStatus) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalLabel = submitButton ? submitButton.innerHTML : '';

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending…';
      }

      contactStatus.textContent = '';
      contactStatus.className = 'contact__status';

      try {
        const response = await fetch(contactForm.action, {
          method: contactForm.method,
          headers: { Accept: 'application/json' },
          body: new FormData(contactForm)
        });

        if (response.ok) {
          contactStatus.textContent = 'Thanks for reaching out. Your message is on its way and I’ll get back to you soon.';
          contactStatus.classList.add('is-success');
          contactForm.reset();
        } else {
          const data = await response.json().catch(() => null);
          throw new Error(data?.errors?.[0]?.message || 'Message could not be sent. Please try again.');
        }
      } catch (error) {
        contactStatus.textContent = error.message || 'Message could not be sent. Please try again.';
        contactStatus.classList.add('is-error');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalLabel;
        }
      }
    });
  }
})();




