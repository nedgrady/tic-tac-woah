import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	test: {
		watch: false,
		testTimeout: 20000,
	},
	plugins: [tsconfigPaths()],
})
