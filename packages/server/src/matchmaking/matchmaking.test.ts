import { test } from "vitest"
import { matchmaking } from "./matchmaking"
import { TicTacWoahQueue } from "queue/addConnectionToQueue"
test("Numerical unique ids are returned as strings", () => {
	const queue = new TicTacWoahQueue()

	const matchmakingMiddleware = matchmaking(queue)
})
