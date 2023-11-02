import axios from "axios"
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { useEffectOnce } from "react-use"
import { io } from "socket.io-client"
import { CoordinatesDtoSchema, MoveDtoSchema, QueueResponse, QueueSchema } from "types"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useAppDispatch, useAppSelector } from "./redux/hooks"
import { Move, newMove, selectBoardState } from "./redux/boardSlice"
import { CoordinatesDto } from "types"

const webSocketUrl = `${import.meta.env.VITE_WEBSOCKET_URL}:${import.meta.env.VITE_WEBSOCKET_PORT}`

export const socket = io(webSocketUrl, {
	autoConnect: false,
})

const queryClient = new QueryClient()

function useQueue() {
	const query = useQuery({
		queryKey: ["queue"],
		queryFn: () =>
			axios
				.get<QueueResponse>("http://localhost:8080/queue")
				.then(response => {
					return QueueSchema.parse(response.data)
				})
				.catch(error => console.log(error)),
		refetchInterval: 5000,
	})

	return { ...query, queue: query.data }
}

function App() {
	useEffectOnce(() => {
		socket.connect()

		socket.on("game start", args => {
			console.log(JSON.stringify(args))
		})
		socket.on("move", args => {
			console.log(args)
			const move = MoveDtoSchema.parse(args)

			dispatch(newMove(move))
		})

		return () => {
			socket.disconnect()
		}
	})

	const dispatch = useAppDispatch()

	return (
		<QueryClientProvider client={queryClient}>
			<button
				onClick={() => {
					const coordinates: CoordinatesDto = {
						x: Math.floor(Math.random() * 20),
						y: Math.floor(Math.random() * 20),
					}
					socket.emit("move", JSON.stringify(coordinates))
				}}
			>
				Clik me
			</button>
			<Queue />
			<hr />
			<Game />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	)
}

function Game() {
	const thing = useAppSelector(selectBoardState)

	return <>{JSON.stringify(thing)}</>
}

function Queue() {
	//const { queue } = useQueue()

	//return <>Currently {queue?.depth ?? "?"} people in the queue...</>
	return <></>
}

export default App
