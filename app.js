(() => {
  const cfg = window.LANDING_CONFIG || {};
  const operator = document.getElementById('operator-name');
  const license = document.getElementById('license-info');
  if (operator && cfg.operatorName) operator.textContent = cfg.operatorName;
  if (license && cfg.licenseInfo) license.textContent = cfg.licenseInfo;

  const passthrough = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','yclid'];
  const current = new URLSearchParams(location.search);

  function outboundUrl(extra = {}) {
    let url;
    try { url = new URL(cfg.affiliateUrl || '', location.href); }
    catch { return '#'; }
    passthrough.forEach(key => {
      const value = current.get(key);
      if (value && !url.searchParams.has(key)) url.searchParams.set(key, value);
    });
    Object.entries(extra).forEach(([key,value]) => value && url.searchParams.set(key,value));
    return url.toString();
  }

  document.querySelectorAll('.js-offer').forEach(btn => {
    btn.addEventListener('click', () => {
      const sport = btn.dataset.sport || '';
      const href = outboundUrl(sport ? {lp_sport:sport} : {});
      if (!href || href === '#') return;
      if (typeof window.ym === 'function' && cfg.yandexMetrikaId) {
        try { window.ym(cfg.yandexMetrikaId, 'reachGoal', 'offer_click'); } catch (_) {}
      }
      location.href = href;
    });
  });

  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.12}) : null;
  document.querySelectorAll('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  const sticky = document.getElementById('stickyCta');
  if (sticky) {
    const update = () => sticky.classList.toggle('show', window.scrollY > 420);
    update(); addEventListener('scroll', update, {passive:true});
  }

  if (cfg.yandexMetrikaId) {
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
    window.ym(cfg.yandexMetrikaId,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false});
  }
})();
