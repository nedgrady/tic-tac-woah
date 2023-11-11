import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffectOnce } from "react-use"
import { io } from "socket.io-client"
import { GameStartDtoSchema, MoveDtoSchema } from "types"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useAppDispatch } from "./redux/hooks"
// import { newMove } from "./redux/boardSlice"
import { CoordinatesDto } from "types"
import { ApplicationInsights } from "@microsoft/applicationinsights-web"
import { ReactPlugin, withAITracking } from "@microsoft/applicationinsights-react-js"
import { Game } from "./Game"
import { Coordinate, Move, newMove, startGame } from "./redux/gameSlice"

const webSocketUrl = `${import.meta.env.VITE_WEBSOCKET_URL}:${import.meta.env.VITE_WEBSOCKET_PORT}`

export const socket = io(webSocketUrl, {
	autoConnect: false,
})

const queryClient = new QueryClient()

var reactPlugin = new ReactPlugin()
var appInsights = new ApplicationInsights({
	config: {
		instrumentationKey: "691cf8f7-d5ef-45df-a5ff-385d9429be4b",
		extensions: [reactPlugin],
	},
})

appInsights.addTelemetryInitializer(item => {
	if (!item.tags) item.tags = []
	if (!item.ext) item.ext = []

	item.tags["ai.cloud.role"] = "tic-tac-woah.client"
	item.tags["ai.cloud.roleInstance"] = window.location.hostname
	item.ext["tic-tac-woah.source"] = "default"
	return true
})

appInsights.loadAppInsights()

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
