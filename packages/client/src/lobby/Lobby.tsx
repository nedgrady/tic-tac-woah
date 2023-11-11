import { Suspense } from "react"
import { useQueue } from "./useQueue"

export function Lobby() {
	const { queue } = useQueue()

	return (
		<Suspense fallback={<>Loading Queue...</>}>
			<>Currently {queue?.depth} people waiting</>
		</Suspense>
	)
}
