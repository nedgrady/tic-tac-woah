import { faker } from "@faker-js/faker"
import { ActiveUser } from "TicTacWoahSocketServer"
import { identifyAllSocketsAsTheSameUser, removeConnectionFromActiveUser } from "auth/socketIdentificationStrategies"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { beforeAll, expect, describe, it, vi } from "vitest"

describe("it", () => {
	const activeUser: ActiveUser = {
		connections: new Set(),
		uniqueIdentifier: "Some active user",
	}

	const testLifetime = new StartAndConnectLifetime(
		server => server.use(identifyAllSocketsAsTheSameUser(activeUser)).use(removeConnectionFromActiveUser),
		2
	)

	beforeAll(async () => {
		await testLifetime.start()

		testLifetime.clientSocket.disconnect()

		await vi.waitFor(async () => {
			const activeSockets = await testLifetime.serverIo.fetchSockets()
			expect(activeSockets).toHaveLength(1)
		})

		return testLifetime.done
	})

	it("Removes a connection from the active user", async () => {
		expect(activeUser.connections).toHaveLength(1)
	})

	it("Leaves the open connection against the active user", async () => {
		const activeSockets = await testLifetime.serverIo.fetchSockets()
		expect(activeUser.connections).toContain(activeSockets[0])
	})
})
