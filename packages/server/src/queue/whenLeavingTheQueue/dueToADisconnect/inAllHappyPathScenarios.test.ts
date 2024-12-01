import { faker } from "@faker-js/faker"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { identifyAllSocketsAsTheSameUser } from "../../../auth/socketIdentificationStrategies"
import { joinQueueRequestFactory } from "../../../testingUtilities/factories"
import { StartAndConnectLifetime } from "../../../testingUtilities/serverSetup/ticTacWoahTest"
import { ActiveUser, TicTacWoahSocketServer } from "../../../TicTacWoahSocketServer"
import { TicTacWoahQueue, addConnectionToQueue } from "../../addConnectionToQueue"
import { removeConnectionFromQueueOnDisconnect } from "../../removeConnectionFromQueueOnDisconnect"

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
		await testLifetime.start()

		testLifetime.clientSocket.emit("joinQueue", joinQueueRequestFactory.build())

		await vi.waitFor(() => {
			expect(queue.items).toHaveLength(1)
		})

		testLifetime.clientSocket.disconnect()

		return testLifetime.done
	})

	it("removes the user from the queue", async () => {
		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(0)
		})
	})

	it("removes the item from the queue", async () => {
		await vi.waitFor(() => {
			expect(queue.items).toHaveLength(0)
		})
	})
})
