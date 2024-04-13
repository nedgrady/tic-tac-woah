import { TicTacWoahSocketServer, ActiveUser } from "TicTacWoahSocketServer"
import { identifyAllSocketsAsTheSameUser } from "auth/socketIdentificationStrategies"
import { QueueItem, TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { joinQueueRequestFactory } from "testingUtilities/factories"

describe("it", () => {
	const queue = new TicTacWoahQueue()

	const queueingActiveUser: ActiveUser = {
		connections: new Set(),
		uniqueIdentifier: faker.string.uuid(),
	}

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server.use(identifyAllSocketsAsTheSameUser(queueingActiveUser)).use(addConnectionToQueue(queue))
	}

	const emittedJoinQueueRequest = joinQueueRequestFactory.build()

	const testContext = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testContext.start()

		testContext.clientSocket.emit("joinQueue", emittedJoinQueueRequest)

		return testContext.done
	})

	it("Adds the player to the queue", async () => {
		await vi.waitFor(() => expect(queue.users).toHaveLength(1))
	})

	it("Captures the active user in the queue", async () => {
		await vi.waitFor(() => expect(queue.users).toContainSingleActiveUser(queueingActiveUser))
	})

	it("Captures a QueueRecord with the requested configuration", () => {
		expect(queue.items).toContainSingle<QueueItem>(expect.objectContaining(emittedJoinQueueRequest))
	})

	it("Captures the active user against the queue record", () => {
		expect(queue.items[0].queuer).toBeActiveUser(queueingActiveUser)
	})
})
