import request from "supertest"
import { expect, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { ticTacWoahTest } from "./ticTacWoahTest"
import { identifyAllSocketsAsTheSameUser, identifyByTicTacWoahUsername } from "auth/socketIdentificationStrategies"
import { ActiveUser } from "TicTacWoahSocketServer"
import { removeConnectionFromActiveUser } from "auth/socketIdentificationStrategies"

// ticTacWoahTest("Health returns 200", async ({ setup: { startServer } }) => {
// 	const startCtx = await startServer()

// 	request(startCtx.httpServer).get("/health").expect(200)
// })

// ticTacWoahTest("Active user uniqueIdentifier is populated", async ({ setup: { startServer } }) => {
// 	const userName = faker.internet.userName()

// 	const startCtx = await startServer(server => server.use(identifyByTicTacWoahUsername))

// 	startCtx.clientSocket.auth = {
// 		token: userName,
// 		type: "tic-tac-woah-username",
// 	}

// 	startCtx.clientSocket.connect()

// 	await vi.waitFor(async () => {
// 		expect(await startCtx.serverIo.fetchSockets()).toHaveLength(1)
// 		const serverSocket = (await startCtx.serverIo.fetchSockets())[0]
// 		expect(serverSocket.data.activeUser.uniqueIdentifier).toBe(userName)
// 	})
// })

// ticTacWoahTest("When the token is numerical, it is converted to a string", async ({ setup: { startServer } }) => {
// 	const startCtx = await startServer(server => server.use(identifyByTicTacWoahUsername))

// 	startCtx.clientSocket.auth = {
// 		token: 1,
// 		type: "tic-tac-woah-username",
// 	}

// 	startCtx.clientSocket.connect()

// 	await vi.waitFor(async () => {
// 		expect(await startCtx.serverIo.fetchSockets()).toHaveLength(1)
// 		const serverSocket = (await startCtx.serverIo.fetchSockets())[0]
// 		expect(serverSocket.data.activeUser.uniqueIdentifier).toBe("1")
// 	})
// })

// ticTacWoahTest("Active user connection is populated", async ({ setup: { startServer } }) => {
// 	const startCtx = await startServer(server => server.use(identifyByTicTacWoahUsername))

// 	startCtx.clientSocket.auth = {
// 		token: "Any Username",
// 		type: "tic-tac-woah-username",
// 	}
// 	startCtx.clientSocket.connect()

// 	await vi.waitFor(async () => {
// 		const activeSockets = await startCtx.serverIo.fetchSockets()
// 		expect(activeSockets).toHaveLength(1)

// 		const activeUserConnections = activeSockets[0].data.activeUser.connections
// 		expect(activeUserConnections).toContainEqual(expect.objectContaining({ id: startCtx.clientSocket.id }))
// 	})
// })

// ticTacWoahTest("Two users connecting active user connection are populated", async ({ setup: { startServer } }) => {
// 	const startCtx = await startServer(server => server.use(identifyByTicTacWoahUsername))

// 	startCtx.clientSocket.auth = {
// 		token: "any username",
// 		type: "tic-tac-woah-username",
// 	}

// 	startCtx.clientSocket2.auth = {
// 		token: "any username 2",
// 		type: "tic-tac-woah-username",
// 	}

// 	startCtx.clientSocket.connect()
// 	startCtx.clientSocket2.connect()

// 	await vi.waitFor(async () => {
// 		const activeSockets = await startCtx.serverIo.fetchSockets()
// 		expect(activeSockets).toHaveLength(2)

// 		const activeUserConnections = activeSockets.flatMap(socket =>
// 			[...socket.data.activeUser.connections].map(c => c.id)
// 		)

// 		expect(activeUserConnections).toContain(startCtx.clientSocket.id)
// 		expect(activeUserConnections).toContain(startCtx.clientSocket2.id)
// 	})
// })

// ticTacWoahTest(
// 	"Two connections with the same username are captured on the same active user.",
// 	async ({ setup: { startServer } }) => {
// 		const startCtx = await startServer(server => server.use(identifyByTicTacWoahUsername))

// 		startCtx.clientSocket.auth = {
// 			token: "Same username",
// 			type: "tic-tac-woah-username",
// 		}

// 		startCtx.clientSocket2.auth = {
// 			token: "Same username",
// 			type: "tic-tac-woah-username",
// 		}

// 		startCtx.clientSocket.connect()
// 		startCtx.clientSocket2.connect()

// 		await vi.waitFor(async () => {
// 			const activeSockets = await startCtx.serverIo.fetchSockets()
// 			expect(activeSockets).toHaveLength(2)

// 			const activeUserFromConnection1 = activeSockets[0].data.activeUser
// 			expect(activeUserFromConnection1.connections).toHaveLength(2)

// 			const activeUserFromConnection2 = activeSockets[1].data.activeUser

// 			expect(activeUserFromConnection1.uniqueIdentifier).toBe(activeUserFromConnection2.uniqueIdentifier)
// 		})
// 	}
// )

// ticTacWoahTest(
// 	"Two connections with diffrent usernames are captured on diffrent active users.",
// 	async ({ setup: { startServer } }) => {
// 		const startCtx = await startServer(server => server.use(identifyByTicTacWoahUsername))

// 		startCtx.clientSocket.auth = {
// 			token: "Different username 1",
// 			type: "tic-tac-woah-username",
// 		}

// 		startCtx.clientSocket2.auth = {
// 			token: "Different username 2",
// 			type: "tic-tac-woah-username",
// 		}

// 		startCtx.clientSocket.connect()
// 		startCtx.clientSocket2.connect()

// 		await vi.waitFor(async () => {
// 			const activeSockets = await startCtx.serverIo.fetchSockets()
// 			expect(activeSockets).toHaveLength(2)

// 			const activeUserFromConnection1 = activeSockets[0].data.activeUser
// 			const activeUserFromConnection2 = activeSockets[1].data.activeUser

// 			expect(activeUserFromConnection1).not.toBe(activeUserFromConnection2)
// 			expect(activeUserFromConnection1.connections).toHaveLength(1)
// 			expect(activeUserFromConnection2.connections).toHaveLength(1)
// 		})
// 	}
// )

ticTacWoahTest(
	"Disconnecting a socket removes it from the active user's connections",
	async ({ setup: { startAndConnect } }) => {
		const activeUser: ActiveUser = {
			connections: new Set(),
			uniqueIdentifier: "Some active user",
		}

		const startCtx = await startAndConnect(server =>
			server.use(identifyAllSocketsAsTheSameUser(activeUser)).use(removeConnectionFromActiveUser)
		)

		startCtx.clientSocket.disconnect()

		await vi.waitFor(async () => {
			const activeSockets = await startCtx.serverIo.fetchSockets()
			expect(activeSockets).toHaveLength(1)

			expect(activeUser.connections).toHaveLength(1)
			expect(activeUser.connections).toContain(activeSockets[0])
		})
	}
)

ticTacWoahTest(
	"The same user connecting twice gets the same active user attatched to each socket",
	async ({ setup: { startServer } }) => {
		const startCtx = await startServer(server => server.use(identifyByTicTacWoahUsername))

		startCtx.clientSocket.auth = {
			token: "Same username",
			type: "tic-tac-woah-username",
		}

		startCtx.clientSocket2.auth = {
			token: "Same username",
			type: "tic-tac-woah-username",
		}

		startCtx.clientSocket.connect()
		startCtx.clientSocket2.connect()

		await vi.waitFor(async () => {
			const activeSockets = await startCtx.serverIo.fetchSockets()
			expect(activeSockets).toHaveLength(2)

			const uniqueIdentifierFromConnection1 = activeSockets[0].data.activeUser.uniqueIdentifier
			const uniqueIdentifierFromConnection2 = activeSockets[1].data.activeUser.uniqueIdentifier

			expect(uniqueIdentifierFromConnection1).toBe(uniqueIdentifierFromConnection2)
		})
	}
)
