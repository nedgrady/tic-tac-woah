import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import { execSync } from "child_process"

const commitHash = process.env.RENDER_GIT_COMMIT ?? "Unknown Commit"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: "/tic-tac-woah/",
	define: {
		__COMMIT_HASH__: JSON.stringify(commitHash),
	},
})
