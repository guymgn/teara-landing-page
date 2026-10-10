import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const portfolioCandidates = [
  resolve(projectRoot, "../guy-portfolio"),
  resolve(projectRoot, "../../guy-portfolio"),
];
const portfolioRoot = portfolioCandidates.find((candidate) =>
  existsSync(resolve(candidate, "scripts/sync-teara-status.mjs")),
);

if (!portfolioRoot) {
  throw new Error("Could not find the sibling guy-portfolio status connector.");
}

const sync = spawnSync(
  process.execPath,
  ["--env-file=.env.local", "scripts/sync-teara-status.mjs"],
  { cwd: portfolioRoot, encoding: "utf8" },
);

if (sync.status !== 0) {
  throw new Error("The App Store Connect status sync failed. Check the portfolio connector configuration.");
}

const status = JSON.parse(
  await readFile(resolve(portfolioRoot, "public/teara-status.json"), "utf8"),
);
const version = String(status.version ?? "").trim();
const build = String(status.build ?? "").trim();

if (!/^\d+(?:\.\d+)*$/.test(version) || (build && !/^\d+$/.test(build))) {
  throw new Error("App Store Connect returned an invalid version or build number.");
}

const indexPath = resolve(projectRoot, "index.html");
const current = await readFile(indexPath, "utf8");
const state = String(status.status ?? "").trim();
if (!state) throw new Error("App Store Connect returned an empty status.");
const publicState = state === "Testing in TestFlight" ? "Public TestFlight beta" : state;
const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const label = `${publicState} · V${version}${build ? ` · Build ${build}` : ""}`;
const ariaPattern = /aria-label="Current status: [^"]+"/;
const textPattern = /(<span class="roadmap__status-text">)[^<]*(<\/span>)/;
if (!ariaPattern.test(current) || !textPattern.test(current)) {
  throw new Error("Could not find the roadmap status badge in index.html.");
}
const next = current
  .replace(
    ariaPattern,
    `aria-label="Current status: ${escapeHtml(publicState)}, version ${version}${build ? `, build ${build}` : ""}"`,
  )
  .replace(
    textPattern,
    (_, open, close) => `${open}${escapeHtml(label)}${close}`,
  );

if (next === current) {
  console.log(`Teara website status already current: ${label}`);
} else {
  await writeFile(indexPath, next);
  console.log(`Teara website status synced: ${label}`);
}
