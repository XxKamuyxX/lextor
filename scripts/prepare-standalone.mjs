import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const staticDir = path.join(root, ".next", "static");
const publicDir = path.join(root, "public");

if (!existsSync(standaloneDir)) {
  console.log("Build standalone não encontrado; pulando cópia de assets.");
  process.exit(0);
}

const targetStatic = path.join(standaloneDir, ".next", "static");
const targetPublic = path.join(standaloneDir, "public");

mkdirSync(path.dirname(targetStatic), { recursive: true });
cpSync(staticDir, targetStatic, { recursive: true });
cpSync(publicDir, targetPublic, { recursive: true });

console.log("Standalone pronto: .next/static e public copiados.");
