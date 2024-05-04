import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vitest/config"
import { TanStackRouterVite } from "@tanstack/router-vite-plugin"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), TanStackRouterVite()],
	base: "/tic-tac-woah/",
	test: {
		environment: "happy-dom",
	},
	appType: "spa",
	server: {
		open: true,
	},
})
