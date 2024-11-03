import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vitest/config"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import svgr from "vite-plugin-svgr"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), TanStackRouterVite(), svgr()],
	base: "/tic-tac-woah/",
	test: {
		environment: "happy-dom",
	},
	appType: "spa",
	server: {
		open: true,
	},
})
