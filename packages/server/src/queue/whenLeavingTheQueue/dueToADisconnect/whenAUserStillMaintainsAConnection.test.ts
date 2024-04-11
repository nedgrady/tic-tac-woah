import { ActiveUser, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifyAllSocketsAsTheSameUser, removeConnectionFromActiveUser } from "auth/socketIdentificationStrategies"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { removeConnectionFromQueueOnDisconnect } from "queue/removeConnectionFromQueueOnDisconnect"
import { faker } from "@faker-js/faker"

describe("it", () => {
	const queue = new TicTacWoahQueue()

	const remainsInQueue: ActiveUser = {
		connections: new Set(),
		uniqueIdentifier: "Some leaving user",
	}

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(identifyAllSocketsAsTheSameUser(remainsInQueue))
			.use(addConnectionToQueue(queue))
			.use(removeConnectionFromQueueOnDisconnect(queue))
			.use(removeConnectionFromActiveUser)
	}

	const testLifetime = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testLifetime.start()

		await testLifetime.clientSocket.emitWithAck("joinQueue", {})
		await testLifetime.clientSocket2.emitWithAck("joinQueue", {})

		testLifetime.clientSocket.disconnect()

		await vi.waitFor(async () => expect(await testLifetime.serverIo.fetchSockets()).toHaveLength(1))

		return testLifetime.done
	})

	it("Does not remove a user from the queue", async () => {
		await vi.waitFor(() => expect(queue.users).toHaveLength(1))
	})

	it("Leaves the correct user in the queue", async () => {
		await vi.waitFor(() => expect(queue.users).toContainActiveUser(remainsInQueue))
	})
})
