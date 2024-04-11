import { TicTacWoahSocketServer, ActiveUser } from "TicTacWoahSocketServer"
import { identifyAllSocketsAsTheSameUser } from "auth/socketIdentificationStrategies"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"

describe("it", () => {
	const queue = new TicTacWoahQueue()

	const queueingActiveUser: ActiveUser = {
		connections: new Set(),
		uniqueIdentifier: faker.string.uuid(),
	}

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server.use(identifyAllSocketsAsTheSameUser(queueingActiveUser)).use(addConnectionToQueue(queue))
	}

	const testContext = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testContext.start()

		await testContext.clientSocket.emitWithAck("joinQueue", {})
		await testContext.clientSocket2.emitWithAck("joinQueue", {})

		return testContext.done
	})

	it("Only adds the user once", async () => {
		// well this could also pass if the assertion runs
		// before the second joinQueue request is processed :/
		await vi.waitFor(() => expect(queue.users).toHaveLength(1))
	})
})
