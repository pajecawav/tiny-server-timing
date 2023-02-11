module.exports = {
	env: {
		node: true,
		es2020: true,
	},
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
	overrides: [],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		sourceType: "module",
	},
	plugins: ["@typescript-eslint"],
	rules: {},
};
