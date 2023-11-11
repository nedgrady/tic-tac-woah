import { useEffectOnce } from "react-use"
import { Socket } from "socket.io-client"
import { useState } from "react"
import { SocketState } from "./App"

export default function useSocketState(socket: Socket) {
	const [socketState, setSocketState] = useState<SocketState>("disconnected")

	useEffectOnce(() => {
		console.log(socket.connected)
		socket.on("connect", () => {
			console.log("connected")
			setSocketState("connected")
		})

		socket.on("disconnect", () => {
			console.log("disconnected")
			setSocketState("disconnected")
		})
	})

	return socketState
}
