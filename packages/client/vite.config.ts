import react from "@vitejs/plugin-react-swc"
import { PluginOption } from "vite"
import { defineConfig } from "vitest/config"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: "/tic-tac-woah/",
	test: {
		environment: "happy-dom",
	},
	appType: "spa",
	server: {
		open: true,
	},
})
