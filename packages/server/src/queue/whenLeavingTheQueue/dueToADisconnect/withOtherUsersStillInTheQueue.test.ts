import { expect, beforeAll, describe, it, vi } from "vitest"
import { identifyAllSocketsAsTheSameUser } from "../../../auth/socketIdentificationStrategies"
import { joinQueueRequestFactory, queueItemFactory } from "../../../testingUtilities/factories"
import { StartAndConnectLifetime } from "../../../testingUtilities/serverSetup/ticTacWoahTest"
import { ActiveUser, TicTacWoahSocketServer } from "../../../TicTacWoahSocketServer"
import { TicTacWoahQueue, QueueItem, addConnectionToQueue } from "../../addConnectionToQueue"
import { removeConnectionFromQueueOnDisconnect } from "../../removeConnectionFromQueueOnDisconnect"

describe("it", () => {
	const queue = new TicTacWoahQueue()

	const remainsInQueue: ActiveUser = {
		uniqueIdentifier: "Some remaining user",
		connections: new Set(),
	}

	const queueLeaver: ActiveUser = {
		uniqueIdentifier: "Some leaving user",
		connections: new Set(),
	}

	const joinQueueRequest = joinQueueRequestFactory.build()
	const remainsInQueueItem: QueueItem = queueItemFactory.build({ queuer: remainsInQueue })

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

		console.log(remainsInQueueItem.queuer.uniqueIdentifier)
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
		await vi.waitFor(() => expect(queue.users).toContainSingleActiveUser(remainsInQueueItem.queuer))
	})

	it("Leaves the correct queue item in the queue", async () => {
		await vi.waitFor(() => expect(queue.items[0].queuer).toBeActiveUser(remainsInQueue))
	})
})
