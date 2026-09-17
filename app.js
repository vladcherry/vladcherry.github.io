/* Vlad's Apps — catalogue rendering, filtering, theme, install prompt */

(() => {
  'use strict';

  const grid = document.getElementById('grid');
  const chipsBox = document.getElementById('chips');
  const search = document.getElementById('q');
  const empty = document.getElementById('empty');
  const resetBtn = document.getElementById('reset');

  let apps = [];
  let category = 'All';

  /* ---------- rendering ---------- */

  const PWA_BADGE =
    '<span class="tag installable" title="Installs to your home screen and works offline">' +
    '<svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">' +
    '<path d="M12 3v11m0 0 4-4m-4 4-4-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' +
    '</svg>Installable</span>';

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function card(app) {
    const li = document.createElement('li');
    li.className = 'card';
    li.style.setProperty('--tint', app.accent);
    li.innerHTML = `
      <div class="card__head">
        <img class="card__icon" src="${esc(app.icon)}" width="52" height="52" alt="" loading="lazy" decoding="async">
        <div class="card__id">
          <h2 class="card__name"><a href="${esc(app.url)}">${esc(app.name)}</a></h2>
          <div class="card__meta">
            <span class="tag tag--cat">${esc(app.category)}</span>
            <span class="tag tag--lang">${esc(app.lang)}</span>
            ${app.pwa ? PWA_BADGE : '<span class="tag" title="Runs in the browser, no offline install">Web</span>'}
          </div>
        </div>
      </div>
      <p class="card__text">${esc(app.tagline)}</p>
      <div class="card__foot">
        <a class="card__open" href="${esc(app.url)}">Open</a>
        <a class="card__src" href="${esc(app.repo)}" rel="noopener">Source</a>
      </div>`;
    return li;
  }

  function matches(app) {
    if (category !== 'All' && app.category !== category) return false;
    const q = search.value.trim().toLowerCase();
    if (!q) return true;
    return [app.name, app.tagline, app.category, app.lang, app.slug]
      .join(' ').toLowerCase().includes(q);
  }

  function render() {
    const shown = apps.filter(matches);
    grid.replaceChildren(...shown.map(card));
    empty.hidden = shown.length > 0;
  }

  function buildChips() {
    const cats = ['All', ...[...new Set(apps.map((a) => a.category))].sort()];
    chipsBox.replaceChildren(...cats.map((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = c;
      b.setAttribute('aria-pressed', String(c === category));
      b.addEventListener('click', () => {
        category = c;
        [...chipsBox.children].forEach((n) =>
          n.setAttribute('aria-pressed', String(n.textContent === category)));
        render();
      });
      return b;
    }));
  }

  search.addEventListener('input', render);
  resetBtn.addEventListener('click', () => {
    search.value = '';
    category = 'All';
    buildChips();
    render();
    search.focus();
  });

  fetch('apps.json', { cache: 'no-cache' })
    .then((r) => r.json())
    .then((data) => {
      apps = data.apps;
      buildChips();
      render();
    })
    .catch(() => {
      empty.hidden = false;
      empty.textContent = 'Could not load the app list. Try reloading.';
    });

  /* ---------- theme ---------- */

  const themeBtn = document.getElementById('theme');
  const root = document.documentElement;

  const stored = (() => {
    try { return localStorage.getItem('theme'); } catch { return null; }
  })();
  if (stored === 'light' || stored === 'dark') root.dataset.theme = stored;

  themeBtn.addEventListener('click', () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* private mode */ }
  });

  /* ---------- install the store itself ---------- */

  const installBtn = document.getElementById('install');
  let deferred = null;

  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    installBtn.hidden = false;
  });

  installBtn.addEventListener('click', async () => {
    if (!deferred) return;
    installBtn.disabled = true;
    deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    installBtn.hidden = true;
    installBtn.disabled = false;
  });

  addEventListener('appinstalled', () => {
    deferred = null;
    installBtn.hidden = true;
  });

  /* ---------- service worker ---------- */

  if ('serviceWorker' in navigator) {
    addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline is optional */ });
    });
  }
})();
