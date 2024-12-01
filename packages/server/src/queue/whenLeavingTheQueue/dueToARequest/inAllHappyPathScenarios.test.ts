import { expect, beforeAll, describe, it, vi } from "vitest"
import { identifyAllSocketsAsTheSameUser } from "../../../auth/socketIdentificationStrategies"
import { joinQueueRequestFactory } from "../../../testingUtilities/factories"
import { StartAndConnectLifetime } from "../../../testingUtilities/serverSetup/ticTacWoahTest"
import { TicTacWoahSocketServer } from "../../../TicTacWoahSocketServer"
import { TicTacWoahQueue, addConnectionToQueue } from "../../addConnectionToQueue"
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

		testLifetime.clientSocket.emit("joinQueue", joinQueueRequestFactory.build())

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

	it("removes the queue item from the queue", async () => {
		await vi.waitFor(() => {
			expect(queue.items).toHaveLength(0)
		})
	})
})
