import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffectOnce } from "react-use"
import { io } from "socket.io-client"
import { GameStartDtoSchema, MoveDtoSchema } from "types"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useAppDispatch } from "./redux/hooks"
import { CoordinatesDto } from "types"
import { Game } from "./Game"
import { Coordinate, newMove, startGame } from "./redux/gameSlice"

const webSocketUrl = `${import.meta.env.VITE_WEBSOCKET_URL}:${import.meta.env.VITE_WEBSOCKET_PORT}`

export const socket = io(webSocketUrl, {
	autoConnect: false,
})

const queryClient = new QueryClient()

function App() {
	const dispatch = useAppDispatch()

	useEffectOnce(() => {
		socket.connect()

		socket.on("game start", args => {
			const gameStart = GameStartDtoSchema.parse(args)
			dispatch(startGame(gameStart))
		})

		socket.on("move", args => {
			const move = MoveDtoSchema.parse(args)
			dispatch(newMove(move))
		})

		return () => {
			socket.disconnect()
		}
	})

	function submitMove(coordinates: Coordinate) {
		const coordinatesDto: CoordinatesDto = {
			...coordinates,
		}
		socket.emit("move", JSON.stringify(coordinatesDto))
	}

	return (
		<QueryClientProvider client={queryClient}>
			<Game submitMove={submitMove} />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	)
}

export default App
