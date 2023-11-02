/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_WEBSOCKET_URL: string
	readonly VITE_WEBSOCKET_PORT: string
	// more env variables...
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
