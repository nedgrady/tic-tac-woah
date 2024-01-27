import { identifyAllSocketsAsTheSameUser, identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { ticTacWoahTest } from "ticTacWoahTest"
import { vi, expect } from "vitest"
import { TicTacWoahQueue, addConnectionToQueue } from "./addConnectionToQueue"
import { ActiveUser, TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"

ticTacWoahTest("One player leaves the queue", async ({ ticTacWoahTestContext }) => {
	const queue = new TicTacWoahQueue()
	const activeUser: ActiveUser = {
		connections: new Set(),
		uniqueIdentifier: "Some active user",
	}

	queue.add(activeUser)

	ticTacWoahTestContext.serverIo.use(identifyAllSocketsAsTheSameUser(activeUser))
	ticTacWoahTestContext.serverIo.use(removeConnectionFromQueue(queue))

	ticTacWoahTestContext.clientSocket.connect()

	await vi.waitFor(() => expect(ticTacWoahTestContext.clientSocket.connected).toBe(true))

	ticTacWoahTestContext.clientSocket.disconnect()

	await vi.waitFor(() => expect(queue.users.size).toBe(0))
})

function removeConnectionFromQueue(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	return (socket, next) => {
		socket.on("disconnect", () => {
			queue.remove(socket.data.activeUser)
		})
		next()
	}
}
