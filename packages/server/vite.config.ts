import { defineConfig } from "vitest/config"
import path from "path"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	test: {
		environment: "node",
		watch: false,
		setupFiles: ["./src/testSetup.ts"],
	},
	resolve: {
		alias: {
			domain: `${path.resolve(__dirname, "./src/domain/")}`,
			queue: `${path.resolve(__dirname, "./src/queue/")}`,
			auth: `${path.resolve(__dirname, "./src/auth/")}`,
			matchmaking: `${path.resolve(__dirname, "./src/matchmaking/")}`,
			utilities: `${path.resolve(__dirname, "./src/utilities/")}`,
			testingUtilities: `${path.resolve(__dirname, "./src/testingUtilities/")}`,
		},
	},
	plugins: [tsconfigPaths()],
})
