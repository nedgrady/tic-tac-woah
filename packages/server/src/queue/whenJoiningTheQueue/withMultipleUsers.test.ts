import { TicTacWoahSocketServer, ActiveUser } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"

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

	beforeAll(async () => {
		await testContext.start()

		await testContext.clientSocket.emitWithAck("joinQueue", {})
		await testContext.clientSocket2.emitWithAck("joinQueue", {})

		return testContext.done
	})

	it("Adds both players to the queue", async () => {
		await vi.waitFor(() => {
			expect(queue.users).toOnlyContainActiveUsers(...twoQueueingUsers)
		})
	})
})
