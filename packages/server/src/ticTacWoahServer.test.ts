import request from "supertest"
import { expect, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { ticTacWoahTest } from "./ticTacWoahTest"
import { identifyAllSocketsAsTheSameUser, identifyByTicTacWoahUsername } from "auth/socketIdentificationStrategies"
import { ActiveUser } from "TicTacWoahSocketServer"
import { removeConnectionFromActiveUser } from "removeConnectionFromActiveUser"

ticTacWoahTest("Health returns 200", ({ ticTacWoahTestContext }) => {
	return new Promise(done => {
		request(ticTacWoahTestContext.httpServer).get("/health").expect(200, done)
	})
})

ticTacWoahTest("Something web sockets", ({ ticTacWoahTestContext }) => {
	return new Promise(done => {
		ticTacWoahTestContext.clientSocket.on("connect", () => {
			done("pass")
		})

		ticTacWoahTestContext.clientSocket.connect()
	})
})

ticTacWoahTest("Active user uniqueIdentifier is populated", async ({ ticTacWoahTestContext }) => {
	ticTacWoahTestContext.serverIo.use(identifyByTicTacWoahUsername)

	const userName = faker.internet.userName()

	ticTacWoahTestContext.clientSocket.auth = {
		token: userName,
		type: "tic-tac-woah-username",
	}

	ticTacWoahTestContext.clientSocket.connect()

	await vi.waitFor(async () => {
		expect(await ticTacWoahTestContext.serverIo.fetchSockets()).toHaveLength(1)
		const serverSocket = (await ticTacWoahTestContext.serverIo.fetchSockets())[0]
		expect(serverSocket.data.activeUser.uniqueIdentifier).toBe(userName)
	})
})

ticTacWoahTest("Active user connection is populated", async ({ ticTacWoahTestContext }) => {
	ticTacWoahTestContext.serverIo.use(identifyByTicTacWoahUsername)

	ticTacWoahTestContext.clientSocket.auth = {
		token: "any username",
		type: "tic-tac-woah-username",
	}

	ticTacWoahTestContext.clientSocket.connect()

	await vi.waitFor(async () => {
		const activeSockets = await ticTacWoahTestContext.serverIo.fetchSockets()
		expect(activeSockets).toHaveLength(1)

		const activeUserConnections = activeSockets[0].data.activeUser.connections
		expect(activeUserConnections).toContainEqual(
			expect.objectContaining({ id: ticTacWoahTestContext.clientSocket.id })
		)
	})
})

ticTacWoahTest(
	"Two connections with the same username are captured on the same active user.",
	async ({ ticTacWoahTestContext }) => {
		ticTacWoahTestContext.serverIo.use(identifyByTicTacWoahUsername)

		ticTacWoahTestContext.clientSocket.auth = {
			token: "Same username",
			type: "tic-tac-woah-username",
		}

		ticTacWoahTestContext.clientSocket2.auth = {
			token: "Same username",
			type: "tic-tac-woah-username",
		}

		ticTacWoahTestContext.clientSocket.connect()
		ticTacWoahTestContext.clientSocket2.connect()

		await vi.waitFor(async () => {
			const activeSockets = await ticTacWoahTestContext.serverIo.fetchSockets()
			expect(activeSockets).toHaveLength(2)

			const activeUserFromConnection1 = activeSockets[0].data.activeUser
			expect(activeUserFromConnection1.connections).toHaveLength(2)

			const activeUserFromConnection2 = activeSockets[1].data.activeUser

			expect(activeUserFromConnection1).toBe(activeUserFromConnection2)
		})
	}
)

ticTacWoahTest(
	"Two connections with diffrent usernames are captured on diffrent active users.",
	async ({ ticTacWoahTestContext }) => {
		ticTacWoahTestContext.serverIo.use(identifyByTicTacWoahUsername)

		ticTacWoahTestContext.clientSocket.auth = {
			token: "Different username 1",
			type: "tic-tac-woah-username",
		}

		ticTacWoahTestContext.clientSocket2.auth = {
			token: "Different username 2",
			type: "tic-tac-woah-username",
		}

		ticTacWoahTestContext.clientSocket.connect()
		ticTacWoahTestContext.clientSocket2.connect()

		await vi.waitFor(async () => {
			const activeSockets = await ticTacWoahTestContext.serverIo.fetchSockets()
			expect(activeSockets).toHaveLength(2)

			const activeUserFromConnection1 = activeSockets[0].data.activeUser
			const activeUserFromConnection2 = activeSockets[1].data.activeUser

			expect(activeUserFromConnection1).not.toBe(activeUserFromConnection2)
			expect(activeUserFromConnection1.connections).toHaveLength(1)
			expect(activeUserFromConnection2.connections).toHaveLength(1)
		})
	}
)

ticTacWoahTest(
	"Disconnecting a socket removes it from the active user connections",
	async ({ ticTacWoahTestContext }) => {
		const activeUser: ActiveUser = {
			connections: new Set(),
			uniqueIdentifier: "Some active user",
		}

		ticTacWoahTestContext.serverIo
			.use(identifyAllSocketsAsTheSameUser(activeUser))
			.use(removeConnectionFromActiveUser)

		ticTacWoahTestContext.clientSocket.connect()
		ticTacWoahTestContext.clientSocket2.connect()

		await vi.waitFor(async () => {
			const activeSockets = await ticTacWoahTestContext.serverIo.fetchSockets()
			expect(activeSockets).toHaveLength(2)
		})

		ticTacWoahTestContext.clientSocket.disconnect()

		await vi.waitFor(async () => {
			const activeSockets = await ticTacWoahTestContext.serverIo.fetchSockets()
			expect(activeSockets).toHaveLength(1)

			expect(activeUser.connections).toHaveLength(1)
			expect(activeUser.connections).toContain(activeSockets[0])
		})
	}
)
