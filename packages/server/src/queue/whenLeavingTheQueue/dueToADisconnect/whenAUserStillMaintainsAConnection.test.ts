import { expect, beforeAll, describe, it, vi } from "vitest"
import {
	identifyAllSocketsAsTheSameUser,
	removeConnectionFromActiveUser,
} from "../../../auth/socketIdentificationStrategies"
import { joinQueueRequestFactory } from "../../../testingUtilities/factories"
import { StartAndConnectLifetime } from "../../../testingUtilities/serverSetup/ticTacWoahTest"
import { ActiveUser, TicTacWoahSocketServer } from "../../../TicTacWoahSocketServer"
import { TicTacWoahQueue, addConnectionToQueue } from "../../addConnectionToQueue"
import { removeConnectionFromQueueOnDisconnect } from "../../removeConnectionFromQueueOnDisconnect"

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

		testLifetime.clientSocket.emit("joinQueue", joinQueueRequestFactory.build())
		await vi.waitFor(() => expect(queue.users).toHaveLength(1))
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

	it("Does not remove an item from the queue", async () => {
		await vi.waitFor(() => expect(queue.items).toHaveLength(1))
	})
})
