import { identifyAllSocketsAsTheSameUser, identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { ticTacWoahTest } from "ticTacWoahTest"
import { vi, expect } from "vitest"
import { TicTacWoahQueue, addConnectionToQueue } from "./addConnectionToQueue"
import {
	ActiveUser,
	ServerToClientEvents,
	TicTacWoahServerSocket,
	TicTacWoahSocketServer,
	TicTacWoahSocketServerMiddleware,
	TicTacWoahUserHandle,
} from "TicTacWoahSocketServer"
import { faker } from "@faker-js/faker"
import { io } from "socket.io-client"
import { Socket } from "socket.io"
import { GameStartDto } from "types"

ticTacWoahTest("One player joins the queue", async ({ setup: { startAndConnect } }) => {
	const queue = new TicTacWoahQueue()
	const startCtx = await startAndConnect(server =>
		server.use(identifyAllSocketsAsTheSameUser()).use(addConnectionToQueue(queue))
	)

	await startCtx.clientSocket.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect(queue.users).toHaveLength(1))
})

ticTacWoahTest("The same user joining the queue twice only gets added once", async ({ setup: { startAndConnect } }) => {
	const queue = new TicTacWoahQueue()

	const startCtx = await startAndConnect(server =>
		server.use(identifyAllSocketsAsTheSameUser()).use(addConnectionToQueue(queue))
	)

	await startCtx.clientSocket.emitWithAck("joinQueue", {})
	await startCtx.clientSocket2.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect(queue.users).toHaveLength(1))
})

ticTacWoahTest("The queue captures the correct user handle", async ({ setup: { startAndConnect } }) => {
	const queue = new TicTacWoahQueue()

	const uniqueIdentifier = faker.string.uuid()
	const someActiveUser: ActiveUser = {
		connections: new Set(),
		uniqueIdentifier: uniqueIdentifier,
	}

	const startCtx = await startAndConnect(server =>
		server.use(identifyAllSocketsAsTheSameUser(someActiveUser)).use(addConnectionToQueue(queue))
	)

	await startCtx.clientSocket.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect(queue.users).toContainSingleActiveUser(someActiveUser))
})

ticTacWoahTest("Two users joining the queue are added to the queue", async ({ setup: { startAndConnect } }) => {
	const queue = new TicTacWoahQueue()

	const twoUsers: ActiveUser[] = ["User 1", "User 2"].map(handle => ({
		connections: new Set(),
		uniqueIdentifier: handle,
	}))

	const startCtx = await startAndConnect(server =>
		server.use(identifySocketsInSequence(twoUsers)).use(addConnectionToQueue(queue))
	)

	startCtx.clientSocket.connect()
	startCtx.clientSocket2.connect()

	await startCtx.clientSocket.emitWithAck("joinQueue", {})
	await startCtx.clientSocket2.emitWithAck("joinQueue", {})

	await vi.waitFor(() => {
		expect(queue.users).toOnlyContainActiveUsers(...twoUsers)
	})
})

ticTacWoahTest(
	"With a game size of 2, one user joining the queue does not create a game",
	async ({ setup: { startAndConnect } }) => {
		const queue = new TicTacWoahQueue()
		const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = ["User 1", "User 2"]

		const preConfigure = (server: TicTacWoahSocketServer) => {
			server
				.use(
					identifySocketsInSequence(
						twoUsers.map(handle => ({
							connections: new Set(),
							uniqueIdentifier: handle,
						}))
					)
				)
				.use(addConnectionToQueue(queue))
				.use(matchmaking(queue))
		}
		const startCtx = await startAndConnect(preConfigure)
		await startCtx.clientSocket.emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(1)
		})

		expect(startCtx.serverSocket.emit).not.toHaveBeenCalled()
	}
)

ticTacWoahTest(
	"With a game size of 2, two users joining the queue are matched into a game",
	async ({ setup: { startAndConnect } }) => {
		const queue = new TicTacWoahQueue()
		const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = [faker.string.uuid(), faker.string.uuid()]

		const preConfigure = (server: TicTacWoahSocketServer) => {
			server
				.use(
					identifySocketsInSequence(
						twoUsers.map(handle => ({
							connections: new Set(),
							uniqueIdentifier: handle,
						}))
					)
				)
				.use(addConnectionToQueue(queue))
				.use(matchmaking(queue))
		}

		const { clientSocket, clientSocket2, serverSocket, serverSocket2 } = await startAndConnect(preConfigure)

		await clientSocket.emitWithAck("joinQueue", {})
		await clientSocket2.emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(serverSocket.emit).toHaveBeenCalledWith<["gameStart", GameStartDto]>("gameStart", {
				id: expect.any(String),
				players: twoUsers,
			})
			expect(serverSocket2.emit).toHaveBeenCalledWith<["gameStart", GameStartDto]>("gameStart", {
				id: expect.any(String),
				players: twoUsers,
			})

			expect(queue.users).toHaveLength(0)
		})
	}
)

ticTacWoahTest("All active clients are notified of the game start", async ({ setup: { startAndConnectCount } }) => {
	const queue = new TicTacWoahQueue()
	const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = ["User A", "User B"]

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(
				identifySocketsInSequence(
					twoUsers.map(handle => ({
						connections: new Set(),
						uniqueIdentifier: handle,
					}))
				)
			)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue))
	}

	const { serverSockets, clientSockets } = await startAndConnectCount(4, preConfigure)

	clientSockets.forEach(socket => socket.emitWithAck("joinQueue", {}))

	await vi.waitFor(() => {
		serverSockets.forEach((serverSocket, socketIndex) => {
			expect(serverSocket.emit, `socket index ${socketIndex}`).toHaveBeenCalledWith<["gameStart", GameStartDto]>(
				"gameStart",
				{
					id: expect.any(String),
					players: twoUsers,
				}
			)
		})
	})
})

export function matchmaking(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	queue.onAdded(users => {
		if (users.length === 2) {
			const participants = users.map(user => user.uniqueIdentifier)
			users.forEach(user => {
				user.connections.forEach(connection => {
					connection.emit("gameStart", { id: "TODO", players: participants })
				})
			})

			queue.remove(users[0])
			queue.remove(users[1])
		}
	})
	return (socket, next) => {
		next()
	}
}
