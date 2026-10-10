# Teara landing page (teara.io)

Static marketing site for the Teara iOS app. Plain HTML, CSS and JS. No framework, no build step.

## Ground rules

- Never deploy, promote a Netlify deploy, or push to `main` without Guy's explicit approval for that specific release. Netlify project `tearalp` is linked to this repo, and a push to `main` may publish to teara.io.
- Work on a branch and open a PR. Guy reviews and decides when it goes live.
- Never commit credentials, `.env*` files, or `.netlify/`.
- Copy: direct and specific, no hype, no em dashes or en dashes. Check claims against what the app actually does. Do not mention Gmail sync or TripIt as features.
- Use the device light/dark theme. There is no manual theme toggle, and none should be added back.

## Structure

- `index.html`, `styles.css`, `script.js`: the home page (nav, hero, Features, Roadmap, FAQ, footer).
- `privacy/`, `support/`: secondary pages. They load `script.js` too.
- `assets/`: runtime images, SVGs and the four 60 fps feature MP4s. These are source, not build output.
- `scripts/sync-teara-status.mjs` (`npm run sync:teara`): updates the roadmap status badge from App Store Connect. It depends on the sibling `guy-portfolio` repo and its private `.env.local`, so it only runs on Guy's Mac. Do not run it in a cloud session. Edit the badge text by hand if asked.

## Preview

```sh
python3 -m http.server 8080
```

Then open http://localhost:8080/. Check both mobile and desktop widths and both color schemes.

## Deliberate decisions to preserve

- Apple Watch hero artwork is hidden on purpose, with its layout space kept.
- Official App Store SVG badge; original TestFlight badge and app icon.
- Mobile menu hides only the TestFlight link and shortens the CTA to "Download".
- Feature videos play in sequence when the first one enters the viewport, and replay on hover, focus or click.
- Dotted map and route lines in the hero stay.
- Some exported assets in `assets/` are unused but are live on teara.io. Leave them unless asked to clean up.

## Known open issues (as of Oct 10, 2026)

- `script.js` calls `audioButton.addEventListener` without a null check. Privacy and support have no audio button, so it throws there.
- No `_redirects` / `netlify.toml` here. `/.well-known/apple-app-site-association` and `/join/*` invite links return 404 on teara.io. The old copy in the Teara app repo (`Teara/landing-page`) has proxy rules to `api.teara.io`; review them before porting. Do not copy anything else from that stale copy.
- Netlify publishes from the repo root. `netlify.toml` returns 404 for repo-only files (`README.md`, `CLAUDE.md`, `package.json`, `scripts/`). Add any new non-public file to that list. Cloud sessions cannot reach Netlify's API, so publishing happens by pushing to `main`, only with Guy's approval.
- support@teara.io delivery is unverified.
