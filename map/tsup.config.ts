import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  banner: { js: '"use client";' },
  external: [
    "react",
    "react-dom",
    "next-themes",
  ],
  noExternal: ["@amap/amap-jsapi-loader", "lucide-react", "clsx", "tailwind-merge"],
  clean: true,
  splitting: false,
});