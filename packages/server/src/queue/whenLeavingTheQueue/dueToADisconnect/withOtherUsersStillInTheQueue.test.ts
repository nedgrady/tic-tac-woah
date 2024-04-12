import { ActiveUser, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifyAllSocketsAsTheSameUser } from "auth/socketIdentificationStrategies"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { removeConnectionFromQueueOnDisconnect } from "queue/removeConnectionFromQueueOnDisconnect"
import { faker } from "@faker-js/faker"

describe("it", () => {
	const queue = new TicTacWoahQueue()

	const remainsInQueue: ActiveUser = {
		uniqueIdentifier: "Some leaving user",
		connections: new Set(),
	}
	const queueLeaver: ActiveUser = {
		uniqueIdentifier: "Some reamaing user",
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
		queue.add(remainsInQueue)
		await testLifetime.start()

		await testLifetime.clientSocket.emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(2)
		})

		testLifetime.clientSocket.disconnect()

		return testLifetime.done
	})

	it("Removes a user from the queue", async () => {
		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(1)
		})
	})

	it("Leaves the correct user in the queue", async () => {
		await vi.waitFor(() => expect(queue.users).toContainActiveUser(remainsInQueue))
	})
})
