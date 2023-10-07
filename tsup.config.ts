import { defineConfig } from "tsup";

export default defineConfig({
	target: "es2021",
	entry: ["src/index.ts"],
	outDir: "dist",
	format: ["esm", "cjs"],
	clean: true,
	minify: false,
	dts: true,
});
