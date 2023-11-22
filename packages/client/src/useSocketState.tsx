import { useEffectOnce } from "react-use"
import { Socket } from "socket.io-client"
import { useState } from "react"

export type SocketState = "connected" | "disconnected" | "connecting"

export default function useSocketState(socket: Socket) {
	const [socketState, setSocketState] = useState<SocketState>(socket.connected ? "connected" : "disconnected")

	useEffectOnce(() => {
		socket.on("connect", () => {
			console.log("connected")
			setSocketState("connected")
		})

		socket.on("disconnect", () => {
			console.log("disconnected")
			setSocketState("disconnected")
		})
	})

	// prevent race condition where socket is connected before useEffectOnce runs
	if (socket.connected && socketState == "disconnected") setSocketState("connected")

	return socketState
}
