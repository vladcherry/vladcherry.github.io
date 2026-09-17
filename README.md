# vladcherry.github.io

The landing page at <https://vladcherry.github.io/> — a small store of the web apps
hosted under this account. It is itself a PWA: installable, and the catalogue works
offline once visited.

## Adding an app

Everything on the page is generated from [`apps.json`](apps.json). Add an entry:

```json
{
  "slug": "my-app",
  "name": "My App",
  "tagline": "One sentence on what it does.",
  "category": "Tools",
  "lang": "EN",
  "accent": "#5c7cfa",
  "icon": "icons/apps/my-app.png",
  "url": "/my-app/",
  "repo": "https://github.com/vladcherry/my-app",
  "pwa": true
}
```

Then:

1. Drop a 192×192 icon at `icons/apps/my-app.png` (copy it from the app's own manifest).
2. Add that icon path to `SHELL` in [`sw.js`](sw.js) and bump `VERSION`, so it is
   precached and the old cache is dropped.
3. Add the URL to [`sitemap.xml`](sitemap.xml) if you care about search engines.

`category` values drive the filter chips automatically — a new one just appears.
`pwa: false` marks an app that has no manifest, so it shows a plain **Web** badge
instead of **Installable**.

## Service worker scope

This worker lives at the root, so its scope (`/`) covers every project page on the
domain. It deliberately answers only for the exact URLs it precached; every other
request falls through to the network and to that app's own service worker. Keep it
that way when editing `sw.js` — a catch-all handler here would intercept the
sub-apps on a visitor's first load.

## Local preview

```sh
npx --yes serve .
```

Links to the apps are absolute (`/bus-radar/`) and will 404 locally; they resolve
once deployed.
