import { createContext, useContext } from "react"
import { useEffectOnce } from "react-use"
import { io } from "socket.io-client"
import { PropsWithChildren } from "react"

const webSocketUrl = `${import.meta.env.VITE_WEBSOCKET_URL}:${import.meta.env.VITE_WEBSOCKET_PORT}`
const socket = io(webSocketUrl, {
	autoConnect: false,
})

const SocketContext = createContext(socket)

export function useTicTacWoahSocket() {
	return useContext(SocketContext)
}

export function SocketProvider({ children }: PropsWithChildren) {
	socket.on("connect", () => console.log("Connected to TicTacWoah server!"))
	socket.on("disconnect", () => console.log("Disconnected"))

	useEffectOnce(() => {
		socket.connect()

		return () => {
			socket.disconnect()
		}
	})

	return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}
