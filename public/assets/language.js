// Equivalent-page links remain usable without JavaScript.
(() => {
  const language = document.documentElement.lang.startsWith('de') ? 'de' : 'en';
  const key = 'mb-site-language';
  const links = document.querySelectorAll('[data-site-language]');
  for (const link of links) {
    const target = new URL(link.getAttribute('href'), location.href);
    target.search = location.search;
    target.hash = location.hash;
    link.href = target.href;
    link.addEventListener('click', () => {
      try { localStorage.setItem(key, link.dataset.siteLanguage); } catch (_) {}
    });
  }
  // Remember a deliberate selection when returning to the homepage.
  try {
    const isHome = /\/(?:index\.html)?$/.test(location.pathname);
    if (language === 'en' && isHome && localStorage.getItem(key) === 'de') {
      const german = document.querySelector('[data-site-language="de"]');
      if (german) { location.replace(german.href); return; }
    }
    localStorage.setItem(key, language);
  } catch (_) {}
})();
