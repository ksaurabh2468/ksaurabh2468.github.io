/* ============================================================
   Kumar Saurabh — interactions
   Vanilla JS, no dependencies. Respects prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------- Sticky header shrink ---------- */
  const header = $(".site-header");
  const onScrollHeader = () => header && header.classList.toggle("scrolled", window.scrollY > 24);
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Scroll progress bar ---------- */
  const bar = $(".scroll-progress");
  if (bar) {
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------- Mobile nav ---------- */
  const toggle = $(".nav-toggle");
  const links = $(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", links).forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Active nav link on scroll (sections on home) ---------- */
  const sectionLinks = $$('.nav-links a[href*="#"]').filter((a) => {
    const href = a.getAttribute("href") || "";
    return href.includes("#") && document.getElementById(href.split("#")[1] || "");
  });
  if (sectionLinks.length) {
    const map = new Map();
    sectionLinks.forEach((a) => {
      const id = (a.getAttribute("href") || "").split("#")[1];
      const sec = document.getElementById(id);
      if (sec) map.set(sec, a);
    });
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            sectionLinks.forEach((l) => l.classList.remove("active"));
            const a = map.get(e.target);
            if (a) a.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    map.forEach((_, sec) => spy.observe(sec));
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$("[data-reveal]");
  if (reduced) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else if (revealEls.length) {
    const ro = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => ro.observe(el));
  }

  /* ---------- Animated counters ---------- */
  const counters = $$("[data-count]");
  if (counters.length) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const dur = 1400;
      if (reduced) { el.textContent = target + suffix; return; }
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target % 1 === 0 ? Math.round(target * eased) : (target * eased).toFixed(1);
        el.textContent = val + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const co = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => co.observe(el));
  }

  /* ---------- Card spotlight (cursor-follow gradient) ---------- */
  if (!isTouch) {
    $$(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  /* ---------- 3D tilt (cards + work rows) ---------- */
  if (!isTouch && !reduced) {
    const addTilt = (el, max, lift) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = "transform .08s linear";
        el.style.transform =
          "translateY(" + lift + "px) rotateX(" + (-py * max).toFixed(2) + "deg) rotateY(" + (px * max).toFixed(2) + "deg)";
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform .5s cubic-bezier(0.22,1,0.36,1)";
        el.style.transform = "";
      });
    };
    $$(".card").forEach((el) => addTilt(el, 7, -6));
    $$(".work").forEach((el) => addTilt(el, 3.5, -4));
  }

  /* ---------- Magnetic buttons ---------- */
  if (!isTouch && !reduced) {
    $$(".magnetic").forEach((el) => {
      const strength = 0.32;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + (x * strength).toFixed(1) + "px," + (y * strength).toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Hero parallax (content drift + fade on scroll) ---------- */
  const heroInner = $(".hero-inner");
  if (heroInner && !reduced) {
    let ticking = false;
    const apply = () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroInner.style.transform = "translateY(" + (y * 0.14).toFixed(1) + "px)";
        heroInner.style.opacity = String(Math.max(0, 1 - y / 620));
      }
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(apply); ticking = true; }
    }, { passive: true });
  }

  /* ---------- Custom cursor glow ---------- */
  if (!isTouch && !reduced) {
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);
    let x = window.innerWidth / 2, y = window.innerHeight / 2, tx = x, ty = y;
    window.addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const loop = () => {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      glow.style.transform = "translate(" + x + "px," + y + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    };
    loop();
    const hoverables = "a, button, .card, .work, .post-card, .socials a";
    document.addEventListener("pointerover", (e) => {
      if (e.target.closest(hoverables)) glow.classList.add("is-hover");
    });
    document.addEventListener("pointerout", (e) => {
      if (e.target.closest(hoverables)) glow.classList.remove("is-hover");
    });
  }

  /* ---------- Hero particle / constellation canvas ---------- */
  const canvas = $(".hero-canvas");
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, particles, raf;
    const COUNT = () => Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 16000));
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const seed = () => {
      particles = Array.from({ length: COUNT() }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }));
    };
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        // link nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 16000) {
            const a = (1 - d2 / 16000) * 0.22;
            ctx.strokeStyle = "rgba(34,211,238," + a + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        // mouse glow link
        const mdx = p.x - mouse.x, mdy = p.y - mouse.y, md2 = mdx * mdx + mdy * mdy;
        if (md2 < 26000) {
          const a = (1 - md2 / 26000) * 0.5;
          ctx.strokeStyle = "rgba(124,92,255," + a + ")";
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = "rgba(180,225,255,0.75)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => { resize(); seed(); cancelAnimationFrame(raf); tick(); };
    start();
    window.addEventListener("resize", () => { resize(); seed(); });
    canvas.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.addEventListener("pointerleave", () => { mouse.x = -9999; mouse.y = -9999; });
    // pause when tab hidden (save battery)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else tick();
    });
  }

  /* ---------- Footer year ---------- */
  const yr = $("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
