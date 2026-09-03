import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const staticDir = path.join(root, ".next", "static");
const publicDir = path.join(root, "public");

// Nomes de chunks antigos ainda referenciados pelo HTML cacheado da CDN na home (/).
const LEGACY_CHUNK_ALIASES = [
  "1bzdo2dfkmwng.css",
  "0_c2407o29jr2.css",
  "2covhv5z0gyz.css",
  "02fh7_m5mrih8.js",
  "08jsjg9cd529h.js",
  "11pxbv08d7b0-.js",
  "22i43cg414-dg.js",
  "25ze6k7b5__ty.js",
  "310vm2bl3xxpt.js",
  "3-6o-vohoz3k-.js",
  "3fntmmi971322.js",
  "turbopack-35dzwqk2lye5l.js",
];

function findPrimaryCss(chunksDir) {
  if (!existsSync(chunksDir)) return null;

  const cssFiles = readdirSync(chunksDir)
    .filter((file) => file.endsWith(".css"))
    .filter((file) => !LEGACY_CHUNK_ALIASES.includes(file))
    .sort();

  return cssFiles[0] ?? null;
}

function findPrimaryJs(chunksDir) {
  if (!existsSync(chunksDir)) return null;

  const jsFiles = readdirSync(chunksDir)
    .filter(
      (file) =>
        file.endsWith(".js") &&
        !file.startsWith("turbopack-") &&
        !file.includes("webpack") &&
        !LEGACY_CHUNK_ALIASES.includes(file)
    )
    .sort((a, b) => b.length - a.length);

  return jsFiles[0] ?? null;
}

function createLegacyAliases(chunksDir) {
  if (!existsSync(chunksDir)) return null;

  const primaryCss = findPrimaryCss(chunksDir);
  const primaryJs = findPrimaryJs(chunksDir);
  const turbopackJs = readdirSync(chunksDir).find((file) =>
    file.startsWith("turbopack-")
  );

  for (const alias of LEGACY_CHUNK_ALIASES) {
    let source = null;

    if (alias.endsWith(".css")) source = primaryCss;
    else if (alias.startsWith("turbopack-")) source = turbopackJs;
    else source = primaryJs;

    if (!source) continue;

    const sourcePath = path.join(chunksDir, source);
    const aliasPath = path.join(chunksDir, alias);

    if (!existsSync(sourcePath) || alias === source) continue;

    cpSync(sourcePath, aliasPath);
  }

  console.log(
    `Aliases legados criados em ${chunksDir} (css=${primaryCss ?? "n/a"}).`
  );

  return primaryCss;
}

function upsertEnvVar(envPath, key, value) {
  let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const pattern = new RegExp(`^${key}=.*$`, "m");

  if (pattern.test(content)) {
    content = content.replace(pattern, `${key}=${value}`);
  } else {
    content = `${content.trimEnd()}${content ? "\n" : ""}${key}=${value}\n`;
  }

  writeFileSync(envPath, content, "utf8");
}

if (!existsSync(standaloneDir)) {
  console.log("Build standalone não encontrado; pulando cópia de assets.");
  process.exit(0);
}

const targetStatic = path.join(standaloneDir, ".next", "static");
const targetPublic = path.join(standaloneDir, "public");

mkdirSync(path.dirname(targetStatic), { recursive: true });
cpSync(staticDir, targetStatic, { recursive: true });
cpSync(publicDir, targetPublic, { recursive: true });

const primaryCss = createLegacyAliases(path.join(staticDir, "chunks"));
createLegacyAliases(path.join(targetStatic, "chunks"));

if (primaryCss) {
  upsertEnvVar(path.join(standaloneDir, ".env"), "PRIMARY_CSS_CHUNK", primaryCss);
  console.log(`PRIMARY_CSS_CHUNK=${primaryCss}`);
}

console.log("Standalone pronto: .next/static e public copiados.");
