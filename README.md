# vladcherry.github.io

The landing page at <https://vladcherry.github.io/> — a small store of the apps
hosted under this account, plus the desktop ones released on GitHub. It is itself
a PWA: installable, and the catalogue works offline once visited.

## Adding an app

Everything on the page is generated from [`apps.json`](apps.json). A web app:

```json
{
  "slug": "my-app",
  "name": "My App",
  "tagline": "One sentence on what it does.",
  "category": "Tools",
  "langs": ["EN", "ES"],
  "accent": "#5c7cfa",
  "icon": "icons/apps/my-app.png",
  "kind": "web",
  "url": "/my-app/",
  "repo": "https://github.com/vladcherry/my-app",
  "pwa": true
}
```

A desktop app distributed through GitHub releases — `url` is the binary, `release`
is the page the card itself links to:

```json
{
  "slug": "my-tool",
  "name": "My Tool",
  "tagline": "One sentence on what it does.",
  "category": "Tools",
  "langs": ["EN"],
  "accent": "#5763ef",
  "icon": "icons/apps/my-tool.png",
  "kind": "desktop",
  "platform": "Windows",
  "version": "1.0.0",
  "size": "240 KB",
  "url": "https://github.com/vladcherry/my-tool/releases/latest/download/my-tool.exe",
  "release": "https://github.com/vladcherry/my-tool/releases/latest",
  "repo": "https://github.com/vladcherry/my-tool",
  "pwa": false
}
```

Then:

1. Drop a 192×192 icon at `icons/apps/my-app.png` (copy it from the app's own manifest).
2. Add that icon path to `SHELL` in [`sw.js`](sw.js) and bump `VERSION`, so it is
   precached and the old cache is dropped.
3. For a web app, add the URL to [`sitemap.xml`](sitemap.xml) if you care about
   search engines. Download links stay out of the sitemap.

`category` values drive the filter chips automatically — a new one just appears.
`pwa: false` marks a web app that has no manifest, so it shows a plain **Web** badge
instead of **Installable**.

`langs` lists every language the app's own interface offers, as one badge. **The
first code is the language the app opens in** — take it from that app's
`<html lang>`, which is what its author set as the default. Ukrainian is written
`UA` rather than the ISO `UK`, because `UK` next to `EN` reads as the United
Kingdom; `VA` is Valencian. Adding a language to an app means editing this list
too — nothing here is read from the apps at runtime.

Clicking a desktop card goes to its release page, never straight to the binary —
only the explicit **Download** button fetches the file. Keep it that way; a stray
click on a card should not start a download.

Bump `version` and `size` here when a desktop app gets a new release; the card
shows them but does not read them from GitHub.

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
