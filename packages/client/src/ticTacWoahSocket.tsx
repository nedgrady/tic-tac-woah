import { createContext, useContext } from "react"
import { useEffectOnce } from "react-use"
import { io } from "socket.io-client"
import { PropsWithChildren } from "react"
import { useTicTacWoahAuth } from "./auth/UsernameMustBePresent"
import { TicTacWoahClientSocket } from "@tic-tac-woah/types"
import { StrongMap } from "./StrongMap"
import { TicTacWoahClientToServerEventMap } from "./eventTypes"

const webSocketUrl = `${import.meta.env.VITE_WEBSOCKET_URL}:${import.meta.env.VITE_WEBSOCKET_PORT}`
const socket: TicTacWoahClientSocket = io(webSocketUrl, {
	autoConnect: false,
	query: {
		thing: "thing",
	},
})

const SocketContext = createContext(socket)

export function useTicTacWoahSocket() {
	return useContext(SocketContext)
}

export function SocketProvider({ children }: PropsWithChildren) {
	socket.on("connect", () => console.log("Connected to TicTacWoah server!"))
	socket.on("disconnect", () => console.log("Disconnected"))
	const clientToServerEvents = new StrongMap<TicTacWoahClientToServerEventMap>()

	socket.onAnyOutgoing((eventName, ...args) => {
		clientToServerEvents.add(eventName, args[0])
	})

	const auth = useTicTacWoahAuth()

	useEffectOnce(() => {
		socket.auth = {
			token: auth,
			type: "tic-tac-woah-username",
		}

		socket.connect()

		return () => {
			socket.off()
			socket.disconnect()
		}
	})

	return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}

const clientToServerEvents = new StrongMap<TicTacWoahClientToServerEventMap>()
const SocketHistoryContext = createContext(clientToServerEvents)

export function SocketHistoryProvider({ children }: PropsWithChildren) {
	socket.onAnyOutgoing((eventName, ...args) => {
		clientToServerEvents.add(eventName, args[0])
	})

	return <SocketHistoryContext.Provider value={clientToServerEvents}>{children}</SocketHistoryContext.Provider>
}

export function useSocketHistory<TEvent extends keyof TicTacWoahClientToServerEventMap>(event: TEvent) {
	const events = useContext(SocketHistoryContext)
	return events.get(event)
}
