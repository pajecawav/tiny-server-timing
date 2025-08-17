import { defineConfig } from "tsup";

export default defineConfig({
	target: "es2021",
	entry: ["src/index.ts"],
	outDir: "dist",
	format: "esm",
	clean: true,
	sourcemap: true,
	minify: false,
	dts: true,
});
