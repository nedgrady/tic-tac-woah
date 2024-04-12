import { identifyByTicTacWoahUsername } from "auth/socketIdentificationStrategies"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { beforeAll, expect, describe, it } from "vitest"

describe("it", () => {
	const testLifetime = new StartAndConnectLifetime(server => server.use(identifyByTicTacWoahUsername), 2)

	beforeAll(async () => {
		testLifetime.configureSocket((socket, index) => {
			socket.auth = {
				token: `Different Username ${index}`,
				type: "tic-tac-woah-username",
			}
		})

		await testLifetime.start()
		return testLifetime.done
	})

	it.each([0, 1])("Connection %i's socket is populated with the correct connection", async socketIndex => {
		const activeSockets = await testLifetime.serverIo.fetchSockets()

		const activeUserConnections = activeSockets.flatMap(socket =>
			[...socket.data.activeUser.connections].map(c => c.id)
		)

		expect(activeUserConnections).toContain(testLifetime.clientSockets[socketIndex].id)
	})

	it.each([0, 1])("Connection %i's active user contains a single connection", async socketIndex => {
		const activeSockets = await testLifetime.serverIo.fetchSockets()

		const activeUserFromConnection = activeSockets[socketIndex].data.activeUser
		expect(activeUserFromConnection.connections).toHaveLength(1)
	})

	it("The two active users are different", async () => {
		const [connection1, connection2] = await testLifetime.serverIo.fetchSockets()
		expect(connection1.data.activeUser.uniqueIdentifier).not.toBe(connection2.data.activeUser.uniqueIdentifier)
	})
})
