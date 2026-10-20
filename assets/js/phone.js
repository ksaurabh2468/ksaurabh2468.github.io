/* ============================================================
   Phone views (below 768px only). Vanilla JS, no dependencies.
   - maps desktop anchors (#build, #how, #contact, #work, ...) to the
     phone sections (#p-*) so every existing link and command lands right;
   - highlights the active bottom tab (scroll position on the home page,
     the path on About / Blog / posts);
   - draws the dots under each swipe carousel and keeps them in sync.
   ============================================================ */
(function () {
  "use strict";
  var mq = window.matchMedia("(max-width: 767px)");
  if (!mq.matches) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MAP = {
    top: "p-top", build: "p-build", how: "p-how", stack: "p-stack", contact: "p-contact",
    about: "p-about", expertise: "p-expertise", process: "p-process", work: "p-work", achievements: "p-work"
  };

  /* ---------- desktop anchors -> phone sections ---------- */
  function jump(hash, smooth) {
    var id = (hash || "").replace(/^#/, "");
    if (!id) return false;
    var target = document.getElementById(MAP[id] || id);
    if (!target || target.offsetParent === null) return false; // hidden (desktop-only) or missing
    // "instant", not "auto": the site sets html { scroll-behavior: smooth }, which "auto" would inherit
    target.scrollIntoView({ behavior: smooth && !reduced ? "smooth" : "instant", block: "start" });
    return true;
  }
  if (location.hash && MAP[location.hash.slice(1)]) {
    // the browser's own hash scroll targets the hidden desktop section and its scroll restore runs late,
    // so jump once the page has fully loaded (and again a moment later, after fonts settle)
    var first = function () { jump(location.hash, false); setTimeout(function () { jump(location.hash, false); }, 120); };
    if (document.readyState === "complete") first(); else window.addEventListener("load", first, { once: true });
  }
  window.addEventListener("hashchange", function () { jump(location.hash, true); });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href*='#']");
    if (!a) return;
    var url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    if (jump(url.hash, true)) {
      e.preventDefault();
      history.replaceState(null, "", url.hash);
    }
  });

  /* ---------- active bottom tab ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".p-tabs a"));
  function setTab(key) {
    tabs.forEach(function (t) { t.classList.toggle("on", t.getAttribute("data-tab") === key); });
  }
  var path = location.pathname.replace(/\/+$/, "/");
  if (/\/about\/$/.test(path)) setTab("about");
  else if (/\/blog\//.test(path)) setTab("blog");
  else {
    setTab("p-top");
    var spy = ["p-how", "p-build", "p-top"].map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var onScroll = function () {
      var y = window.scrollY + window.innerHeight * 0.35;
      for (var i = 0; i < spy.length; i++) {
        if (spy[i].offsetTop <= y) { setTab(spy[i].id); return; }
      }
      setTab("p-top");
    };
    // past "How I work" the Process tab stays lit (the rest of the page belongs to it)
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- carousel dots ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-swipe]"), function (track) {
    var dots = track.parentElement.querySelector("[data-dots]");
    if (!dots) return;
    var items = track.children;
    for (var i = 0; i < items.length; i++) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show item " + (i + 1) + " of " + items.length);
      b.innerHTML = "<i></i>";
      (function (idx) {
        b.addEventListener("click", function () {
          track.scrollTo({ left: items[idx].offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft || "0"), behavior: reduced ? "auto" : "smooth" });
        });
      })(i);
      dots.appendChild(b);
    }
    dots.removeAttribute("aria-hidden");
    var btns = dots.children;
    var sync = function () {
      var step = items[0] ? items[0].getBoundingClientRect().width + 12 : 1;
      var idx = Math.max(0, Math.min(items.length - 1, Math.round(track.scrollLeft / step)));
      for (var j = 0; j < btns.length; j++) btns[j].setAttribute("aria-current", j === idx ? "true" : "false");
    };
    track.addEventListener("scroll", sync, { passive: true });
    sync();
  });
})();
