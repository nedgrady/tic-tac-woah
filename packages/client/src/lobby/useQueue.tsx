import { useSuspenseQuery } from "@tanstack/react-query"
import { QueueResponse, QueueSchema } from "types"
import axios from "axios"

export function useQueue() {
	const query = useSuspenseQuery({
		queryKey: ["queue"],
		queryFn: () =>
			axios
				// TODO: use env variable
				.get<QueueResponse>("http://localhost:8080/queue")
				.then(response => {
					return QueueSchema.parse(response.data)
				})
				.catch(console.log),
		refetchInterval: 5000,
	})

	return { ...query, queue: query.data }
}
