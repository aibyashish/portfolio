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

  document.querySelectorAll('a[href="#contact"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.getElementById('contact');
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------------- Magnetic buttons ---------------- */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach((el) => {
      const strength = 18;
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${(relX / rect.width) * strength}px, ${(relY / rect.height) * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0,0)';
      });
    });
  }

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
