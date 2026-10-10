# Teara landing page

The public website for Teara.

## Preview locally

From the landing-page directory:

```sh
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

## Sync the app status

Run this before publishing a website update:

```sh
npm run sync:teara
```

The command reuses the existing secure App Store Connect sync in the sibling
`guy-portfolio` project. It updates the App Store review status, version, and build shown in the roadmap
badge without copying credentials into this repository.
