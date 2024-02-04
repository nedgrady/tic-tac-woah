import { identifyAllSocketsAsTheSameUser } from "auth/socketIdentificationStrategies"
import { ticTacWoahTest } from "ticTacWoahTest"
import { vi, expect } from "vitest"
import { TicTacWoahQueue, addConnectionToQueue } from "./addConnectionToQueue"
import { ActiveUser } from "TicTacWoahSocketServer"
import { removeConnectionFromActiveUser } from "auth/socketIdentificationStrategies"
import { removeConnectionFromQueue } from "./removeConnectionFromQueue"
import { faker } from "@faker-js/faker"

ticTacWoahTest("One player leaves the queue", async ({ setup: { startAndConnectCount } }) => {
	const queue = new TicTacWoahQueue()
	const queueLeaver = faker.string.uuid()

	queue.add(queueLeaver)

	const startCtx = await startAndConnectCount(1, server =>
		server
			.use(identifyAllSocketsAsTheSameUser({ uniqueIdentifier: queueLeaver, connections: new Set() }))
			.use(removeConnectionFromQueue(queue))
	)

	startCtx.clientSockets[0].disconnect()

	await vi.waitFor(() => expect(queue.users.size).toBe(0))

	return startCtx.done()
})

ticTacWoahTest(
	"One player leaves the queue that is populated with a second user",
	async ({ setup: { startAndConnectCount } }) => {
		const queue = new TicTacWoahQueue()
		const remainsInQueue = "Some leaving user"
		const queueLeaver = "Some reamaing user"

		queue.add(remainsInQueue)
		queue.add(queueLeaver)

		const startCtx = await startAndConnectCount(1, server =>
			server
				.use(identifyAllSocketsAsTheSameUser({ uniqueIdentifier: queueLeaver, connections: new Set() }))
				.use(removeConnectionFromQueue(queue))
		)

		startCtx.clientSockets[0].disconnect()

		await vi.waitFor(() => expect(queue.users.size).toBe(1))
		await vi.waitFor(() => expect(queue.users).toContain(remainsInQueue))
	}
)

ticTacWoahTest(
	"Leaving the queue does not remove the user from the queue if they have multiple connections",
	async ({ setup: { startAndConnect } }) => {
		const queue = new TicTacWoahQueue()

		const remainsInQueue: ActiveUser = {
			connections: new Set(),
			uniqueIdentifier: "Some leaving user",
		}

		const startCtx = await startAndConnect(server =>
			server
				.use(identifyAllSocketsAsTheSameUser(remainsInQueue))
				.use(addConnectionToQueue(queue))
				.use(removeConnectionFromQueue(queue))
				.use(removeConnectionFromActiveUser)
		)

		await startCtx.clientSocket.emitWithAck("joinQueue", {})
		await startCtx.clientSocket2.emitWithAck("joinQueue", {})

		startCtx.clientSocket.disconnect()

		await vi.waitFor(async () => expect(await startCtx.serverIo.fetchSockets()).toHaveLength(1))

		await vi.waitFor(() => expect(queue.users.size).toBe(1))
		await vi.waitFor(() => expect(queue.users).toContain(remainsInQueue.uniqueIdentifier))
	}
)
