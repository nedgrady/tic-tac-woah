import { faker } from "@faker-js/faker"
import { identifyByTicTacWoahUsername } from "auth/socketIdentificationStrategies"
import { StartAndConnectLifetime } from "ticTacWoahTest"
import { beforeAll, expect, vi, describe, it } from "vitest"

describe("it", () => {
	const testLifetime = new StartAndConnectLifetime(server => server.use(identifyByTicTacWoahUsername), 1)

	const userName = faker.internet.userName()

	beforeAll(async () => {
		testLifetime.configureSocket(socket => {
			socket.auth = {
				token: userName,
				type: "tic-tac-woah-username",
			}
		})

		await testLifetime.start()
		return testLifetime.done
	})

	it("Captures the username", async () => {
		const serverSocket = (await testLifetime.serverIo.fetchSockets())[0]
		expect(serverSocket.data.activeUser.uniqueIdentifier).toBe(userName)
	})

	it("Captures the connection against the active user", async () => {
		const activeSockets = await testLifetime.serverIo.fetchSockets()
		const activeUserConnections = activeSockets[0].data.activeUser.connections
		expect(activeUserConnections).toContainEqual(expect.objectContaining({ id: testLifetime.clientSocket.id }))
	})
})
