import { ActiveUser, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifyAllSocketsAsTheSameUser } from "auth/socketIdentificationStrategies"
import { QueueItem, TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { removeConnectionFromQueueOnDisconnect } from "queue/removeConnectionFromQueueOnDisconnect"
import { joinQueueRequestFactory } from "testingUtilities/factories"

describe("it", () => {
	const queue = new TicTacWoahQueue()

	const remainsInQueue: ActiveUser = {
		uniqueIdentifier: "Some reamaing user",
		connections: new Set(),
	}

	const queueLeaver: ActiveUser = {
		uniqueIdentifier: "Some leaving user",
		connections: new Set(),
	}

	const joinQueueRequest = joinQueueRequestFactory.build()
	const remainsInQueueItem: QueueItem = {
		queuer: remainsInQueue,
		humanCount: joinQueueRequest.humanCount,
		consecutiveTarget: joinQueueRequest.consecutiveTarget,
	}

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(identifyAllSocketsAsTheSameUser(queueLeaver))
			.use(removeConnectionFromQueueOnDisconnect(queue))
			.use(addConnectionToQueue(queue))
	}

	const testLifetime = new StartAndConnectLifetime(preConfigure, 1)

	beforeAll(async () => {
		queue.addItem(remainsInQueueItem)
		await testLifetime.start()

		testLifetime.clientSocket.emit("joinQueue", joinQueueRequest)

		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(2)
			expect(queue.items).toHaveLength(2)
		})

		testLifetime.clientSocket.disconnect()

		return testLifetime.done
	})

	it("Removes a user from the queue", async () => {
		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(1)
		})
	})

	it("Removes an item from the queue", async () => {
		await vi.waitFor(() => {
			expect(queue.items).toHaveLength(1)
		})
	})

	it("Leaves the correct user in the queue", async () => {
		await vi.waitFor(() => expect(queue.users).toContainActiveUser(remainsInQueue))
	})

	it("Leaves the correct queue item in the queue", async () => {
		await vi.waitFor(() =>
			expect(queue.items).toContainSingle<QueueItem>(expect.objectContaining(joinQueueRequest))
		)
	})
})
