import { identifyByTicTacWoahUsername } from "auth/socketIdentificationStrategies"
import { StartAndConnectLifetime } from "ticTacWoahTest"
import { beforeAll, expect, vi, describe, it } from "vitest"

describe("it", () => {
	const testLifetime = new StartAndConnectLifetime(server => server.use(identifyByTicTacWoahUsername))

	beforeAll(async () => {
		testLifetime.configureSocket(socket => {
			socket.auth = {
				token: 1,
				type: "tic-tac-woah-username",
			}
		})

		await testLifetime.start()
		return testLifetime.done
	})

	it("Captures the username", async () => {
		await vi.waitFor(async () => {
			const serverSocket = (await testLifetime.serverIo.fetchSockets())[0]
			expect(serverSocket.data.activeUser.uniqueIdentifier).toBe("1")
		})
	})
})
