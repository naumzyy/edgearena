(() => {
  const cfg = window.LANDING_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // --- Подстановка текстов из config.js: <span data-cfg="bonus.amount"> ---
  const get = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), cfg);
  $$("[data-cfg]").forEach(el => {
    const v = get(el.dataset.cfg);
    if (v) el.textContent = v;
  });
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  const erid = $("#erid");
  if (erid && cfg.erid) erid.textContent = " · erid: " + cfg.erid;

  // --- Партнёрская ссылка ---
  const tracked = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "yclid", "gclid"];
  const incoming = new URLSearchParams(location.search);

  function buildUrl(source) {
    const raw = cfg.offerUrl;
    if (!raw || raw === "#") return null;
    try {
      const url = new URL(raw, location.href);
      tracked.forEach(k => {
        const v = incoming.get(k);
        // Параметры из ссылки партнёрки не перезаписываем
        if (v && !url.searchParams.has(k)) url.searchParams.set(k, v);
      });
      return url.toString();
    } catch { return raw; }
  }

  function trackGoal(name, params = {}) {
    const id = cfg.yandexMetrikaId;
    if (id && typeof window.ym === "function") window.ym(Number(id), "reachGoal", name, params);
  }

  // href выставляется сразу при загрузке — работают «открыть в новой вкладке» и копирование ссылки
  $$(".js-offer").forEach(link => {
    const url = buildUrl(link.dataset.source);
    if (url) link.href = url;
    link.rel = "nofollow sponsored noopener";
    link.addEventListener("click", e => {
      if (!url) { e.preventDefault(); console.warn("Укажите offerUrl в config.js"); return; }
      trackGoal("offer_click", { source: link.dataset.source || "unknown" });
    });
  });

  // --- Липкая кнопка: показываем после первого экрана ---
  const sticky = $("#mobileSticky");
  const hero = $(".hero");
  if (sticky && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => sticky.classList.toggle("is-on", !en.isIntersecting), { threshold: 0 }).observe(hero);
  } else if (sticky) sticky.classList.add("is-on");

  // --- Появление блоков ---
  const reveal = $$(".reveal");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    }), { threshold: .12 });
    reveal.forEach(el => io.observe(el));
  } else reveal.forEach(el => el.classList.add("is-visible"));

  // --- Яндекс Метрика ---
  if (cfg.yandexMetrikaId) {
    const id = Number(cfg.yandexMetrikaId);
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    const s = document.createElement("script");
    s.async = true; s.src = "https://mc.yandex.ru/metrika/tag.js";
    document.head.appendChild(s);
    window.ym(id, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true });
  }
})();
