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
})();
