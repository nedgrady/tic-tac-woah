import { identifyByTicTacWoahUsername } from "auth/socketIdentificationStrategies"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { beforeAll, expect, describe, it } from "vitest"

describe("it", () => {
	const testLifetime = new StartAndConnectLifetime(server => server.use(identifyByTicTacWoahUsername), 2)

	beforeAll(async () => {
		testLifetime.configureSocket(socket => {
			socket.auth = {
				token: "Same Username",
				type: "tic-tac-woah-username",
			}
		})

		await testLifetime.start()
		return testLifetime.done
	})

	it("Two connections are present", async () => {
		const activeSockets = await testLifetime.serverIo.fetchSockets()
		expect(activeSockets).toHaveLength(2)
	})

	it.each([0, 1])("Connection %i's active user contains two connections", async socketIndex => {
		const activeSockets = await testLifetime.serverIo.fetchSockets()

		const activeUserFromConnection = activeSockets[socketIndex].data.activeUser
		expect(activeUserFromConnection.connections).toHaveLength(2)
	})

	it("Both connections are associated with the same active user", async () => {
		const activeSockets = await testLifetime.serverIo.fetchSockets()

		const activeUserFromConnection1 = activeSockets[0].data.activeUser
		const activeUserFromConnection2 = activeSockets[1].data.activeUser
		expect(activeUserFromConnection1.uniqueIdentifier).toBe(activeUserFromConnection2.uniqueIdentifier)
	})
})
