import axios from "axios"
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { useEffectOnce } from "react-use"
import { io } from "socket.io-client"
import { QueueResponse, QueueSchema } from "types"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

export const socket = io("localhost:8080", {
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

socket.connect()

socket.on("hello", args => {
	alert(args)
})

socket.on("hello", data => {
	console.log(`Received message in room ${data.room}: ${data.message}`)
})

function App() {
	useEffectOnce(() => {
		socket.on("game start", args => {
			alert(args)
		})
		socket.on("move", args => {
			alert(args)
		})
		return () => {
			socket.disconnect()
		}
	})

	return (
		<QueryClientProvider client={queryClient}>
			<Queue />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	)
}

function Queue() {
	const { queue } = useQueue()

	return <>Currently {queue?.depth ?? "?"} people in the queue...</>
}

export default App
