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

  /* ---------- Preloader (once per session) ---------- */
  const pre = $(".preloader");
  const revisit = document.documentElement.classList.contains("revisit");
  if (pre && !revisit && !reduced) {
    document.body.classList.add("is-loading");
    const num = $(".pre-count", pre);
    const t0 = performance.now(), dur = 950;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      pre.classList.add("done");
      document.body.classList.remove("is-loading");
      try { sessionStorage.setItem("ks-visited", "1"); } catch (e) {}
      setTimeout(() => pre.remove(), 900);
    };
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      if (num) num.textContent = Math.round(eased * 100);
      if (p < 1) requestAnimationFrame(step); else setTimeout(finish, 120);
    };
    requestAnimationFrame(step);
    setTimeout(finish, 2600); // safety net
  } else if (pre) {
    pre.remove();
  }

  /* ---------- Split section titles into masked words ---------- */
  if (!reduced) {
    $$(".section-title").forEach((t) => {
      const text = t.textContent.trim();
      if (!text) return;
      t.setAttribute("aria-label", text);
      const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      t.innerHTML = text
        .split(/\s+/)
        .map((w, i) => '<span class="w" aria-hidden="true"><span class="wi" style="--i:' + i + '">' + esc(w) + "</span></span>")
        .join(" ");
    });
  }

  /* ---------- Rotating focus word (hero) ---------- */
  const rotator = $(".rotator");
  if (rotator && !reduced) {
    let words = [];
    try { words = JSON.parse(rotator.dataset.words || "[]"); } catch (e) {}
    const rw = $(".rw", rotator);
    if (rw && words.length > 1) {
      let i = 0;
      setInterval(() => {
        rw.classList.add("out");
        setTimeout(() => {
          i = (i + 1) % words.length;
          rw.textContent = words[i];
          rw.classList.remove("out");
          // restart the enter animation
          void rw.offsetWidth;
        }, 380);
      }, 2600);
    }
  }

  /* ---------- Hero spotlight follows cursor ---------- */
  const heroSpot = $(".hero-spot");
  if (heroSpot && !isTouch && !reduced) {
    const hero = $(".hero");
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      heroSpot.style.setProperty("--sx", ((e.clientX - r.left) / r.width) * 100 + "%");
      heroSpot.style.setProperty("--sy", ((e.clientY - r.top) / r.height) * 100 + "%");
    }, { passive: true });
  }

  /* ---------- Cursor dot (instant partner to the lagging glow) ---------- */
  if (!isTouch && !reduced) {
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.appendChild(dot);
    window.addEventListener("pointermove", (e) => {
      dot.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px) translate(-50%,-50%)";
    }, { passive: true });
  }

  /* ---------- Copy email ---------- */
  $$(".copy-email").forEach((btn) => {
    btn.addEventListener("click", () => {
      const email = btn.dataset.copy || "";
      const done = () => {
        btn.classList.add("copied");
        setTimeout(() => btn.classList.remove("copied"), 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(done);
      } else { done(); }
    });
  });

  /* ---------- Back to top (with progress ring) ---------- */
  const toTop = $(".to-top");
  if (toTop) {
    const ring = $(".ring-fg", toTop);
    const CIRC = 151; // 2πr for r=24 at stroke inset
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      toTop.classList.toggle("show", h.scrollTop > 640);
      if (ring) ring.style.strokeDashoffset = String(CIRC * (1 - p));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));
  }

  /* ---------- Live clock (Pune / IST) ---------- */
  const clock = $("[data-clock]");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
    const tickClock = () => { clock.textContent = "Pune · " + fmt.format(new Date()) + " IST"; };
    tickClock();
    setInterval(tickClock, 1000);
  }

  /* ---------- Command palette (Ctrl/Cmd + K) ---------- */
  const cmdk = $("#cmdk");
  if (cmdk) {
    const body = document.body;
    const email = body.dataset.email || "";
    const onHome = !!document.getElementById("about");
    const go = (hash) => (onHome ? hash : "/" + hash); // from blog pages, jump home first
    const ICONS = {
      section: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 4 8 20M16 4l-2 16M4 9h17M3 15h17"/></svg>',
      page: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
      ext: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/></svg>',
      copy: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    };
    const items = [
      { label: "Home", k: "Go", icon: ICONS.section, run: () => (location.href = go("#top")) },
      { label: "About", k: "Go", icon: ICONS.section, run: () => (location.href = go("#about")) },
      { label: "Expertise", k: "Go", icon: ICONS.section, run: () => (location.href = go("#expertise")) },
      { label: "How I deliver", k: "Go", icon: ICONS.section, run: () => (location.href = go("#process")) },
      { label: "Selected work", k: "Go", icon: ICONS.section, run: () => (location.href = go("#work")) },
      { label: "Awards & credentials", k: "Go", icon: ICONS.section, run: () => (location.href = go("#achievements")) },
      { label: "Contact", k: "Go", icon: ICONS.section, run: () => (location.href = go("#contact")) },
      { label: "Blog", k: "Page", icon: ICONS.page, run: () => (location.href = "/blog/") },
      { label: "Copy email address", k: "Action", icon: ICONS.copy, run: () => { if (navigator.clipboard) navigator.clipboard.writeText(email); } },
      { label: "Email me", k: "Action", icon: ICONS.ext, run: () => (location.href = "mailto:" + email) },
      { label: "LinkedIn", k: "Social", icon: ICONS.ext, run: () => window.open(body.dataset.linkedin, "_blank", "noopener") },
      { label: "GitHub", k: "Social", icon: ICONS.ext, run: () => window.open(body.dataset.github, "_blank", "noopener") },
    ];
    const input = $(".cmdk-input", cmdk);
    const list = $(".cmdk-list", cmdk);
    let filtered = items, sel = 0, lastFocus = null;

    const render = () => {
      if (!filtered.length) {
        list.innerHTML = '<li class="cmdk-empty">No matches — try "work" or "email".</li>';
        return;
      }
      list.innerHTML = filtered
        .map((it, i) => '<li class="cmdk-item' + (i === sel ? " sel" : "") + '" role="option" aria-selected="' + (i === sel) + '" data-i="' + i + '">' + it.icon + "<span>" + it.label + '</span><span class="k">' + it.k + "</span></li>")
        .join("");
    };
    const openPal = () => {
      lastFocus = document.activeElement;
      cmdk.hidden = false;
      input.value = ""; filtered = items; sel = 0; render();
      requestAnimationFrame(() => input.focus());
    };
    const closePal = () => {
      cmdk.hidden = true;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    const runSel = () => {
      const it = filtered[sel];
      if (it) { closePal(); it.run(); }
    };

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      filtered = q ? items.filter((it) => it.label.toLowerCase().includes(q)) : items;
      sel = 0; render();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); render(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
      else if (e.key === "Enter") { e.preventDefault(); runSel(); }
    });
    list.addEventListener("click", (e) => {
      const li = e.target.closest(".cmdk-item");
      if (li) { sel = +li.dataset.i; runSel(); }
    });
    list.addEventListener("pointermove", (e) => {
      const li = e.target.closest(".cmdk-item");
      if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; render(); }
    });
    $$("[data-cmdk-close]", cmdk).forEach((el) => el.addEventListener("click", closePal));
    $$(".cmdk-hint").forEach((el) => el.addEventListener("click", openPal));
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); cmdk.hidden ? openPal() : closePal(); }
      else if (e.key === "Escape" && !cmdk.hidden) closePal();
    });
    // platform-aware hint label
    if (/Mac|iPhone|iPad/.test(navigator.platform)) {
      $$(".cmdk-hint kbd").forEach((k) => { if (k.textContent.toLowerCase() === "ctrl") k.textContent = "⌘"; });
    }
  }

  /* ---------- Footer year ---------- */
  const yr = $("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
