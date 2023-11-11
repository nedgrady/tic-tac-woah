import { useSuspenseQuery } from "@tanstack/react-query"
import { QueueResponse, QueueSchema } from "types"
import axios from "axios"

const baseUrl = new URL(import.meta.env.VITE_API_URL)
baseUrl.port = import.meta.env.VITE_API_PORT

axios.defaults.baseURL = baseUrl.toString()

export function useQueue() {
	const query = useSuspenseQuery({
		queryKey: ["queue"],
		queryFn: () =>
			axios
				// TODO: use env variable
				.get<QueueResponse>("/queue")
				.then(response => {
					return QueueSchema.parse(response.data)
				})
				.catch(console.log),
		refetchInterval: 5000,
	})

	return { ...query, queue: query.data }
}
