// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: ["**/dist", "**/coverage"],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		rules: {
			"@typescript-eslint/explicit-member-accessibility": "error",
		},
	},
);
