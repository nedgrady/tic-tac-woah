import { identifyAllSocketsAsTheSameUser } from "auth/socketIdentificationStrategies"
import { ticTacWoahTest } from "ticTacWoahTest"
import { vi, expect } from "vitest"
import { TicTacWoahQueue, addConnectionToQueue } from "./addConnectionToQueue"
import { ActiveUser, TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"
import { removeConnectionFromActiveUser } from "removeConnectionFromActiveUser"

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

		const remainsInQueue: ActiveUser = {
			connections: new Set(),
			uniqueIdentifier: "Some reamaing user",
		}

		queue.add(remainsInQueue)
		queue.add(queueLeaver)

		ticTacWoahTestContext.serverIo.use(identifyAllSocketsAsTheSameUser(queueLeaver))
		ticTacWoahTestContext.serverIo.use(removeConnectionFromQueue(queue))

		ticTacWoahTestContext.clientSocket.connect()

		await vi.waitFor(() => expect(ticTacWoahTestContext.clientSocket.connected).toBe(true))

		ticTacWoahTestContext.clientSocket.disconnect()

		await vi.waitFor(() => expect(queue.users.size).toBe(1))
		await vi.waitFor(() => expect([...queue.users]).toEqual(expect.arrayContaining([remainsInQueue])))
	}
)

ticTacWoahTest(
	"Leaving the queue does not remove the user from the queue if they have multiple connections",
	async ({ ticTacWoahTestContext }) => {
		const queue = new TicTacWoahQueue()

		const remainsInQueue: ActiveUser = {
			connections: new Set(),
			uniqueIdentifier: "Some leaving user",
		}

		ticTacWoahTestContext.serverIo
			.use(identifyAllSocketsAsTheSameUser(remainsInQueue))
			.use(addConnectionToQueue(queue))
			.use(removeConnectionFromQueue(queue))
			.use(removeConnectionFromActiveUser)

		ticTacWoahTestContext.clientSocket.connect()
		ticTacWoahTestContext.clientSocket2.connect()

		await ticTacWoahTestContext.clientSocket.emitWithAck("joinQueue", {})
		await ticTacWoahTestContext.clientSocket2.emitWithAck("joinQueue", {})

		ticTacWoahTestContext.clientSocket.disconnect()

		await vi.waitFor(async () => expect(await ticTacWoahTestContext.serverIo.fetchSockets()).toHaveLength(1))

		await vi.waitFor(() => expect(queue.users.size).toBe(1))
		await vi.waitFor(() => expect([...queue.users]).toEqual(expect.arrayContaining([remainsInQueue])))
	}
)

function removeConnectionFromQueue(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	return (socket, next) => {
		socket.on("disconnect", () => {
			if (socket.data.activeUser.connections.size === 1) {
				queue.remove(socket.data.activeUser)
			}
		})

		next()
	}
}
