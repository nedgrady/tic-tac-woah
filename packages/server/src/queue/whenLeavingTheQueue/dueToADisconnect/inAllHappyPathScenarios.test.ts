import { ActiveUser, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifyAllSocketsAsTheSameUser } from "auth/socketIdentificationStrategies"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { removeConnectionFromQueueOnDisconnect } from "queue/removeConnectionFromQueueOnDisconnect"
import { faker } from "@faker-js/faker"

describe("it", () => {
	const queue = new TicTacWoahQueue()

	const queueLeaver: ActiveUser = {
		uniqueIdentifier: faker.string.uuid(),
		connections: new Set(),
	}

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(identifyAllSocketsAsTheSameUser(queueLeaver))
			.use(removeConnectionFromQueueOnDisconnect(queue))
			.use(addConnectionToQueue(queue))
	}

	const testLifetime = new StartAndConnectLifetime(preConfigure, 1)

	beforeAll(async () => {
		queue.add(queueLeaver)
		await testLifetime.start()

		await testLifetime.clientSocket.emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(1)
		})

		testLifetime.clientSocket.disconnect()

		return testLifetime.done
	})

	it("removes the user from the queue", async () => {
		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(0)
		})
	})
})
