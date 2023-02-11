import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	outDir: "dist",
	format: ["esm", "cjs"],
	clean: true,
	minify: true,
	dts: true,
	sourcemap: true,
});
