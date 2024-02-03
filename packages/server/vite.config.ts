import { defineConfig } from "vitest/config"
import path from "path"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	test: {
		environment: "node",
		watch: false,
		setupFiles: ["./testSetup.ts"],
	},
	resolve: {
		alias: {
			domain: `${path.resolve(__dirname, "./src/domain/")}`,
			queue: `${path.resolve(__dirname, "./src/queue/")}`,
			auth: `${path.resolve(__dirname, "./src/auth/")}`,
		},
	},
	plugins: [tsconfigPaths()],
})
