(() => {
  const cfg = window.LANDING_CONFIG || {};
  let selectedBonus = "freebet";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const setText = (selector, value) => {
    const el = $(selector);
    if (el && value) el.textContent = value;
  };

  setText("#heroTitle", cfg.bonus?.heroTitle);
  setText("#heroSubtitle", cfg.bonus?.heroSubtitle);
  setText("#startBonusText", cfg.bonus?.startBonus);
  setText("#fastPayoutText", cfg.bonus?.fastPayout);
  setText("#freebetText", cfg.bonus?.freebet);
  setText("#welcomeText", cfg.bonus?.welcome);
  setText("#stickyBonus", cfg.bonus?.freebet);
  setText("#operatorName", cfg.operatorName);
  setText("#licenseText", cfg.licenseText);
  setText("#year", new Date().getFullYear());

  const trackedParams = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "yclid", "gclid"];
  const incoming = new URLSearchParams(location.search);

  function getOfferUrl(source) {
    const raw = cfg.offerUrl || "#";
    if (raw === "#") return "#";
    try {
      const url = new URL(raw, location.href);
      trackedParams.forEach(k => {
        const v = incoming.get(k);
        if (v && !url.searchParams.has(k)) url.searchParams.set(k, v);
      });
      url.searchParams.set("lp_source", source || "unknown");
      url.searchParams.set("lp_bonus", selectedBonus);
      return url.toString();
    } catch {
      return raw;
    }
  }

  function trackGoal(name, params = {}) {
    const id = cfg.yandexMetrikaId;
    if (id && typeof window.ym === "function") {
      window.ym(Number(id), "reachGoal", name, params);
    }
  }

  $$(".js-offer").forEach(link => {
    link.addEventListener("click", e => {
      const url = getOfferUrl(link.dataset.source);
      if (url === "#") {
        e.preventDefault();
        alert("Укажите партнёрскую ссылку в файле config.js");
        return;
      }
      trackGoal("offer_click", { source: link.dataset.source || "unknown", bonus: selectedBonus });
      link.href = url;
    });
  });

  const bonusCards = $$(".bonus-card");
  bonusCards.forEach(card => card.addEventListener("click", () => {
    selectedBonus = card.dataset.bonus;
    bonusCards.forEach(c => {
      const active = c === card;
      c.classList.toggle("is-active", active);
      c.setAttribute("aria-checked", active ? "true" : "false");
    });
    const text = selectedBonus === "freebet" ? (cfg.bonus?.freebet || "Фрибет") : (cfg.bonus?.welcome || "Приветственный бонус");
    setText("#stickyBonus", text);
    setText("#bonusCtaText", selectedBonus === "freebet" ? "ВЫБРАТЬ ФРИБЕТ" : "ВЫБРАТЬ БОНУС +100%");
    trackGoal("bonus_select", { bonus: selectedBonus });
  }));

  const proof = Array.isArray(cfg.liveProof) ? cfg.liveProof.filter(x => x?.name && x?.amount) : [];
  const proofSection = $("#liveProof");
  const liveTrack = $("#liveTrack");
  if (proof.length && proofSection && liveTrack) {
    const items = [...proof, ...proof];
    liveTrack.innerHTML = items.map(item => `
      <div class="live-item">
        <div><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.event || "Спорт")}</small></div>
        <strong>${escapeHtml(item.amount)}</strong>
      </div>`).join("");
    proofSection.hidden = false;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
  }

  const revealEls = $$(".perk,.bonus-card,.final-cta,.legal");
  revealEls.forEach(el => el.classList.add("reveal"));
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
    }), { threshold: .12 });
    revealEls.forEach(el => io.observe(el));
  } else revealEls.forEach(el => el.classList.add("is-visible"));

  if (cfg.yandexMetrikaId) {
    const id = Number(cfg.yandexMetrikaId);
    window.ym = window.ym || function(){ (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://mc.yandex.ru/metrika/tag.js";
    document.head.appendChild(script);
    window.ym(id, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
  }
})();
