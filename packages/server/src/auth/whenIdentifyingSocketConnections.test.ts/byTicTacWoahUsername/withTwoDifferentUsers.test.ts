import { identifyByTicTacWoahUsername } from "auth/socketIdentificationStrategies"
import { StartAndConnectLifetime } from "ticTacWoahTest"
import { beforeAll, expect, describe, it } from "vitest"

describe("it", () => {
	const testLifetime = new StartAndConnectLifetime(server => server.use(identifyByTicTacWoahUsername), 2)

	beforeAll(async () => {
		testLifetime.configureSocket((socket, index) => {
			socket.auth = {
				token: `any username${index}`,
				type: "tic-tac-woah-username",
			}
		})

		await testLifetime.start()
		return testLifetime.done
	})

	it.each([0, 1])("Does a thing %i", async socketIndex => {
		const activeSockets = await testLifetime.serverIo.fetchSockets()

		const activeUserConnections = activeSockets.flatMap(socket =>
			[...socket.data.activeUser.connections].map(c => c.id)
		)

		expect(activeUserConnections).toContain(testLifetime.clientSockets[socketIndex].id)
	})
})
