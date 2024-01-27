import { identifyAllSocketsAsTheSameUser, identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { ticTacWoahTest } from "ticTacWoahTest"
import { vi, expect } from "vitest"
import { TicTacWoahQueue, addConnectionToQueue } from "./addConnectionToQueue"
import { ActiveUser, TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"
import e from "express"

ticTacWoahTest("One player leaves the queue", async ({ ticTacWoahTestContext }) => {
	const queue = new TicTacWoahQueue()
	const queueLeaver: ActiveUser = {
		connections: new Set(),
		uniqueIdentifier: "Some active user",
	}

	queue.add(queueLeaver)

	ticTacWoahTestContext.serverIo.use(identifyAllSocketsAsTheSameUser(queueLeaver))
	ticTacWoahTestContext.serverIo.use(removeConnectionFromQueue(queue))

	ticTacWoahTestContext.clientSocket.connect()

	await vi.waitFor(() => expect(ticTacWoahTestContext.clientSocket.connected).toBe(true))

	ticTacWoahTestContext.clientSocket.disconnect()

	await vi.waitFor(() => expect(queue.users.size).toBe(0))
})

ticTacWoahTest(
	"One player leaves the queue that is populated with a second user",
	async ({ ticTacWoahTestContext }) => {
		const queue = new TicTacWoahQueue()
		const queueLeaver: ActiveUser = {
			connections: new Set(),
			uniqueIdentifier: "Some leaving user",
		}

		const staysInQueue: ActiveUser = {
			connections: new Set(),
			uniqueIdentifier: "Some reamaing user",
		}

		queue.add(staysInQueue)
		queue.add(queueLeaver)

		ticTacWoahTestContext.serverIo.use(identifyAllSocketsAsTheSameUser(queueLeaver))
		ticTacWoahTestContext.serverIo.use(removeConnectionFromQueue(queue))

		ticTacWoahTestContext.clientSocket.connect()

		await vi.waitFor(() => expect(ticTacWoahTestContext.clientSocket.connected).toBe(true))

		ticTacWoahTestContext.clientSocket.disconnect()

		await vi.waitFor(() => expect(queue.users.size).toBe(1))
		await vi.waitFor(() => expect([...queue.users]).toEqual(expect.arrayContaining([staysInQueue])))
	}
)

function removeConnectionFromQueue(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	return (socket, next) => {
		socket.on("disconnect", () => {
			queue.remove(socket.data.activeUser)
		})
		next()
	}
}
