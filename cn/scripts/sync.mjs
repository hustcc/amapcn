import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..", "..");
const mapSrc = resolve(root, "map", "src", "map.tsx");
const registryDest = resolve(__dirname, "..", "src", "map.tsx");

const source = readFileSync(mapSrc, "utf-8");

const transformed = source.replace(
  /from\s+["']\.\/utils["']/g,
  'from "@/lib/utils"'
);

mkdirSync(dirname(registryDest), { recursive: true });
writeFileSync(registryDest, transformed, "utf-8");

console.log("Synced map/src/map.tsx → cn/src/map.tsx");