# Teara landing page (teara.io)

Static marketing site for the Teara iOS app. Plain HTML, CSS and JS. No framework, no build step.

## Ground rules

- **Start every session on `staging` yourself.** Before any work, run `git fetch origin && git switch staging` (create it from `origin/staging` if missing) and pull. Never ask Guy to switch or sync branches; handle git yourself.
- **Staging first, always.** Every change, however small, goes to the `staging` branch (directly or through a PR into `staging`). Share the staging preview link with Guy and stop there. Nothing reaches `main` or teara.io until Guy explicitly approves that specific deploy. A request like "fix X and publish" still means staging first, then wait for approval.
- `main` is production. Netlify project `tearalp` builds and publishes teara.io from `main`, so a push or merge to `main` is a deploy. Never push or merge to `main`, run a production deploy, or promote a Netlify deploy without that approval.
- Staging preview: keep one open PR from `staging` into `main` (currently #6). Netlify builds every push to it at https://deploy-preview-<PR number>--tearalp.netlify.app. Open a new PR if none is open. Opening or updating the PR never publishes; only merging does. Branch deploys (staging--tearalp.netlify.app) are not enabled.
- Before promoting, confirm `staging` contains everything on `main` and nothing unapproved. Promote by fast-forwarding `main` to the approved `staging` commit.
- Never commit credentials, `.env*` files, or `.netlify/`.
- Copy: direct and specific, no hype, no em dashes or en dashes. Check claims against what the app actually does. Do not mention TripIt. Gmail import is in development (Google verification pending): describe it only as optional, read-only and processed on the iPhone, matching `privacy/#gmail-import`. Never call it released, a sync, or "verified by Google" until that is true.
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

- Apple Watch mockup (black, `assets/hero-watch.png`, 116px wide) sits over the lower right of the iPhone in the hero, with a "Coming soon to the Apple Watch" tooltip on hover, tap and keyboard focus. Keep the watch and phone screens consistent (same trip, days to go and route).
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
