import { faker } from "@faker-js/faker"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { identifyAllSocketsAsTheSameUser } from "../../auth/socketIdentificationStrategies"
import { joinQueueRequestFactory } from "../../testingUtilities/factories"
import { StartAndConnectLifetime } from "../../testingUtilities/serverSetup/ticTacWoahTest"
import { ActiveUser, TicTacWoahSocketServer } from "../../TicTacWoahSocketServer"
import { TicTacWoahQueue, addConnectionToQueue } from "../addConnectionToQueue"

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

		testContext.clientSocket.emit("joinQueue", joinQueueRequestFactory.build())
		testContext.clientSocket2.emit("joinQueue", joinQueueRequestFactory.build())

		return testContext.done
	})

	it("Only adds the user once", async () => {
		// well this could also pass if the assertion runs
		// before the second joinQueue request is processed :/
		await vi.waitFor(() => expect(queue.users).toHaveLength(1))
	})
})
