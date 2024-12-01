import { expect, beforeAll, describe, it, vi } from "vitest"
import { identifySocketsInSequence } from "../../auth/socketIdentificationStrategies"
import { joinQueueRequestFactory } from "../../testingUtilities/factories"
import { StartAndConnectLifetime } from "../../testingUtilities/serverSetup/ticTacWoahTest"
import { ActiveUser, TicTacWoahSocketServer } from "../../TicTacWoahSocketServer"
import { TicTacWoahQueue, addConnectionToQueue, QueueItem } from "../addConnectionToQueue"

describe("it", () => {
	const queue = new TicTacWoahQueue()

	const twoQueueingUsers: ActiveUser[] = ["User 1", "User 2"].map(handle => ({
		connections: new Set(),
		uniqueIdentifier: handle,
	}))

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server.use(identifySocketsInSequence(twoQueueingUsers)).use(addConnectionToQueue(queue))
	}

	const testContext = new StartAndConnectLifetime(preConfigure)

	const joinQueueRequests = joinQueueRequestFactory.buildList(2)

	beforeAll(async () => {
		await testContext.start()

		testContext.clientSocket.emit("joinQueue", joinQueueRequests[0])
		testContext.clientSocket2.emit("joinQueue", joinQueueRequests[1])

		return testContext.done
	})

	it("Adds both players to the queue", async () => {
		await vi.waitFor(() => {
			expect(queue.users).toOnlyContainActiveUsers(...twoQueueingUsers)
		})
	})

	it.each(joinQueueRequests)("Captures game configuration %#", async joinQueueRequest => {
		await vi.waitFor(() => {
			expect(queue.items).toContainEqual<QueueItem>(expect.objectContaining(joinQueueRequest))
		})
	})
})
