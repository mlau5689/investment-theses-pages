/* Shared site script: theme toggle + floating nav. Loaded by every thesis page. */
(function () {
  "use strict";
  var root = document.documentElement;

  /* ---------- theme ---------- */
  var KEY = "thesis-theme";
  function systemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function storedTheme() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function currentTheme() {
    return root.getAttribute("data-theme") || storedTheme() || systemTheme();
  }
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.4 14.2A8.5 8.5 0 0 1 9.8 3.6a8.5 8.5 0 1 0 10.6 10.6z"/></svg>';
  var HOME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/></svg>';

  var toggleBtn = null;
  function paintToggle() {
    if (!toggleBtn) return;
    var dark = currentTheme() === "dark";
    toggleBtn.innerHTML = dark ? SUN : MOON;
    toggleBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    toggleBtn.title = dark ? "Light mode" : "Dark mode";
  }
  function setTheme(t) {
    if (t === "dark" || t === "light") {
      root.setAttribute("data-theme", t);
      try { localStorage.setItem(KEY, t); } catch (e) {}
    } else {
      root.removeAttribute("data-theme");
      try { localStorage.removeItem(KEY); } catch (e) {}
    }
    paintToggle();
  }
  window.__toggleTheme = function () {
    setTheme(currentTheme() === "dark" ? "light" : "dark");
  };
  /* If the OS theme changes and the user never picked, follow it live */
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function () { if (!storedTheme()) paintToggle(); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ---------- scroll reveals (iOS rise-in) ---------- */
  document.documentElement.classList.add("js");
  (function initReveals() {
    var targets = document.querySelectorAll(".glass.metric, .table-card, .callout, section .glass.card");
    if (!targets.length) return;
    function revealNow(el) { el.classList.add("reveal"); el.classList.add("in"); }
    if (!("IntersectionObserver" in window)) {
      for (var k = 0; k < targets.length; k++) revealNow(targets[k]);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) { entries[i].target.classList.add("in"); io.unobserve(entries[i].target); }
      }
    }, { threshold: 0.06, rootMargin: "0px 0px -6% 0px" });
    for (var j = 0; j < targets.length; j++) {
      targets[j].classList.add("reveal");
      var r = targets[j].getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) targets[j].classList.add("in");
      else io.observe(targets[j]);
    }
  })();

  /* ---------- floating nav ---------- */
  // Derive the site root from this script's own URL, so links work at any depth.
  var scriptSrc = (document.currentScript && document.currentScript.src) || "";
  var siteRoot = scriptSrc.replace(/site\.js(\?.*)?(#.*)?$/, "");
  var PAGES = [
    { slug: "spcx/",   label: "SPCX" },
    { slug: "tsla/",   label: "TSLA" },
    { slug: "usar/",   label: "USAR" },
    { slug: "rivian/", label: "RIVN" },
    { slug: "asml/",   label: "ASML" },
    { slug: "spacex-tesla-merger/", label: "Merger" },
    { slug: "terafab/", label: "Terafab" },
    { slug: "rocket-lab/", label: "RKLB" }
  ];
  function currentSlug() {
    try {
      var rootPath = new URL(siteRoot, location.href).pathname.replace(/\/+$/, "");
      var curPath = location.pathname.replace(/\/+$/, "");
      var rel = curPath.slice(rootPath.length).replace(/^\/+/, "");
      var first = rel.split("/")[0];
      return first ? first + "/" : "";
    } catch (e) {
      return "";
    }
  }

  function centerActive(links) {
    /* Keep the current page's link centered in the scrollable strip,
       so the bar never resets to a position that hides where you are. */
    var active = links.querySelector("a.nav-link.active");
    if (!active) return;
    var lr = links.getBoundingClientRect();
    var ar = active.getBoundingClientRect();
    links.scrollLeft += (ar.left + ar.width / 2) - (lr.left + lr.width / 2);
  }

  function buildNav() {
    var slug = currentSlug();
    var nav = document.createElement("nav");
    nav.className = "site-nav";
    nav.setAttribute("aria-label", "Theses");
    /* Pinned home button: icon only, locked in place outside the scroll area */
    var home = document.createElement("a");
    home.className = "nav-home" + (slug === "" ? " active" : "");
    home.href = siteRoot;
    home.innerHTML = HOME;
    home.setAttribute("aria-label", "All theses");
    if (slug === "") home.setAttribute("aria-current", "page");
    nav.appendChild(home);
    var div0 = document.createElement("div");
    div0.className = "nav-divider";
    nav.appendChild(div0);
    var links = document.createElement("div");
    links.className = "nav-links";
    PAGES.forEach(function (p) {
      var a = document.createElement("a");
      a.className = "nav-link" + (p.slug === slug ? " active" : "");
      a.href = siteRoot + p.slug;
      a.textContent = p.label;
      if (p.slug === slug) a.setAttribute("aria-current", "page");
      links.appendChild(a);
    });
    nav.appendChild(links);
    var div = document.createElement("div");
    div.className = "nav-divider";
    nav.appendChild(div);
    toggleBtn = document.createElement("button");
    toggleBtn.className = "theme-toggle";
    toggleBtn.type = "button";
    toggleBtn.addEventListener("click", window.__toggleTheme);
    nav.appendChild(toggleBtn);
    document.body.insertBefore(nav, document.body.firstChild);
    paintToggle();
    centerActive(links);
    if (window.requestAnimationFrame) window.requestAnimationFrame(function () { centerActive(links); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildNav);
  } else {
    buildNav();
  }

  /* ---------- recent updates (living log): iMessage-style paged scroll ---------- */
  (function initUpdates() {
    var sec = document.getElementById("updates");
    if (!sec) return;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var PAGE = 20;

    var DATA = [];
    try {
      var dataEl = sec.querySelector("script.upd-data");
      DATA = JSON.parse(dataEl.textContent);
    } catch (e) { DATA = []; }

    var list = sec.querySelector("[data-upd-list]");
    var sentinel = sec.querySelector("[data-upd-sentinel]");
    var sort = "new", filt = "all", tickFilt = "", shown = 0;

    /* section collapse */
    var head = sec.querySelector("[data-upd-toggle]");
    if (head) head.addEventListener("click", function () {
      var closed = sec.classList.toggle("closed");
      head.setAttribute("aria-expanded", closed ? "false" : "true");
    });

    var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    function esc(t) {
      return String(t == null ? "" : t).replace(/&/g,"&amp;").replace(/</g,"&lt;")
        .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }
    function fmtDate(d) {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || "");
      return m ? MON[+m[2] - 1] + " " + (+m[3]) + ", " + m[1] : (d || "");
    }
    function cap(t) { t = String(t || "").trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Update"; }

    var SVG_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    var SVG_DN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>';
    var SVG_DASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>';
    var SVG_CHEV = '<svg class="upd-chev-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

    var SLUGS = { SPCX: "spcx", TSLA: "tsla", USAR: "usar", RIVN: "rivian",
      ASML: "asml", Merger: "spacex-tesla-merger", Terafab: "terafab", RKLB: "rocket-lab" };

    function rowHTML(u) {
      var bc = u.sentiment === "positive" ? "pos" : u.sentiment === "negative" ? "neg" : "neu";
      var bi = u.sentiment === "positive" ? SVG_UP : u.sentiment === "negative" ? SVG_DN : SVG_DASH;
      var tick = u.ticker ? '<span class="upd-tick">' + esc(u.ticker) + '</span>' : "";
      var inner = '<span class="upd-badge ' + bc + '" aria-hidden="true">' + bi + '</span>' +
        '<span class="upd-main"><span class="upd-t">' + tick + esc(u.title) + '</span>' +
        '<span class="upd-meta"><span class="upd-d">' + esc(fmtDate(u.date)) + ' \u00b7 ' + esc(cap(u.source)) + '</span></span></span>';
      var open = '<div class="upd" id="' + esc(u.id) + '" data-sent="' + esc(u.sentiment) + '">';
      if (u.ticker) {
        var slug = SLUGS[u.ticker] || "";
        return open + '<a class="upd-row" href="' + slug + '/#' + esc(u.id) + '">' + inner + '</a></div>';
      }
      var body = "";
      if (u.summary) body += "<p>" + esc(u.summary) + "</p>";
      if (u.detail && !(u.summary && u.detail.indexOf(u.summary) === 0)) body += "<p>" + esc(u.detail) + "</p>";
      return open + '<button class="upd-row" data-upd-row aria-expanded="false">' + inner + SVG_CHEV + '</button>' +
        '<div class="upd-detail"><div class="upd-detail-in"><div>' + body + '</div></div></div></div>';
    }

    function visible() {
      var v = DATA.filter(function (u) {
        return (filt === "all" || u.sentiment === filt) && (!tickFilt || u.ticker === tickFilt);
      });
      return sort === "new" ? v : v.slice().reverse();
    }
    function renderMore() {
      var v = visible();
      var next = v.slice(shown, shown + PAGE);
      if (!next.length) return false;
      var tmp = document.createElement("div");
      var frag = document.createDocumentFragment();
      next.forEach(function (u) { tmp.innerHTML = rowHTML(u); frag.appendChild(tmp.firstChild); });
      list.insertBefore(frag, sentinel);
      shown += next.length;
      return shown < v.length;
    }
    function reset() {
      var olds = list.querySelectorAll(".upd");
      for (var i = 0; i < olds.length; i++) olds[i].parentNode.removeChild(olds[i]);
      shown = 0;
      renderMore();
    }

    /* row expand (event delegation; landing rows are links and navigate) */
    list.addEventListener("click", function (ev) {
      var btn = ev.target.closest ? ev.target.closest("[data-upd-row]") : null;
      if (!btn) return;
      var r = btn.parentNode;
      var open = r.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    /* page in older entries as the user scrolls, like iOS Messages */
    var io = null;
    function watch() {
      if (!("IntersectionObserver" in window)) return;
      if (io) io.disconnect();
      io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) { renderMore(); }
        }
      }, { root: list, rootMargin: "240px" });
      io.observe(sentinel);
    }

    function segWire(el, fn) {
      if (!el) return;
      var btns = el.querySelectorAll("button");
      for (var i = 0; i < btns.length; i++) (function (b) {
        b.addEventListener("click", function () {
          for (var j = 0; j < btns.length; j++) btns[j].classList.remove("on");
          b.classList.add("on");
          fn(b.getAttribute("data-v"));
        });
      })(btns[i]);
    }
    segWire(sec.querySelector("[data-upd-sort]"), function (v) { sort = v; reset(); });
    segWire(sec.querySelector("[data-upd-filter]"), function (v) { filt = v; reset(); });

    /* thesis chips (landing only) */
    (function () {
      var bar = sec.querySelector("[data-upd-theses]");
      if (!bar) return;
      var btns = bar.querySelectorAll("button");
      for (var i = 0; i < btns.length; i++) (function (b) {
        b.addEventListener("click", function () {
          for (var j = 0; j < btns.length; j++) btns[j].classList.remove("on");
          b.classList.add("on");
          tickFilt = b.getAttribute("data-t");
          reset();
        });
      })(btns[i]);
    })();

    reset();
    watch();

    /* deep link: slug/#upd-id renders enough pages, expands the entry */
    (function deepLink() {
      var h = location.hash || "";
      if (h.indexOf("#upd-") !== 0) return;
      var id = h.slice(1);
      var v = visible(), at = -1;
      for (var i = 0; i < v.length; i++) if (v[i].id === id) { at = i; break; }
      if (at < 0) return;
      while (shown <= at) { if (!renderMore()) break; }
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.add("open");
      var rb = el.querySelector("[data-upd-row]");
      if (rb) rb.setAttribute("aria-expanded", "true");
      setTimeout(function () {
        el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      }, 80);
    })();
  })();

/* ---------- scroll to top ---------- */
  (function initToTop() {
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var b = document.createElement("button");
    b.className = "to-top";
    b.setAttribute("aria-label", "Scroll to top");
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    b.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
    document.body.appendChild(b);
    var tick = false;
    function onScroll() {
      if (tick) return; tick = true;
      (window.requestAnimationFrame || function (f) { f(); })(function () {
        tick = false;
        b.classList.toggle("show", window.scrollY > 600);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

})();
