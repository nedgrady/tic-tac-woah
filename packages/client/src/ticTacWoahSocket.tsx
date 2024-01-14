import { createContext, useContext } from "react"
import { useEffectOnce } from "react-use"
import { io } from "socket.io-client"
import { PropsWithChildren } from "react"
import { useTicTacWoahAuth } from "./auth/UsernameMustBePresent"

const webSocketUrl = `${import.meta.env.VITE_WEBSOCKET_URL}:${import.meta.env.VITE_WEBSOCKET_PORT}`
const socket = io(webSocketUrl, {
	autoConnect: false,
	query: {
		thing: "thing",
	},
})

const SocketContext = createContext(socket)

export function useTicTacWoahSocket() {
	const auth = useTicTacWoahAuth()

	useEffectOnce(() => {
		socket.auth = {
			token: auth,
			type: "tic-tac-woah-username",
		}

		socket.connect()

		// return () => {
		// 	socket.disconnect()
		// }
	})
	return useContext(SocketContext)
}

export function SocketProvider({ children }: PropsWithChildren) {
	socket.on("connect", () => console.log("Connected to TicTacWoah server!"))
	socket.on("disconnect", () => console.log("Disconnected"))

	useEffectOnce(() => {
		return () => {
			socket.disconnect()
		}
	})

	return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}
