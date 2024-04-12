import { TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifyAllSocketsAsTheSameUser } from "auth/socketIdentificationStrategies"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { removeConnectionFromQueueWhenRequested } from "../../removeConnectionFromQueueWhenRequested"

describe("it", () => {
	const queue = new TicTacWoahQueue()

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(identifyAllSocketsAsTheSameUser())
			.use(removeConnectionFromQueueWhenRequested(queue))
			.use(addConnectionToQueue(queue))
	}

	const testLifetime = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testLifetime.start()

		await testLifetime.clientSocket.emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(1)
		})

		testLifetime.clientSocket.emit("leaveQueue")

		return testLifetime.done
	})

	it("removes the user from the queue", async () => {
		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(0)
		})
	})
})
