import { identifyAllSocketsAsTheSameUser, identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { ticTacWoahTest } from "ticTacWoahTest"
import { vi, expect } from "vitest"
import { TicTacWoahQueue, addConnectionToQueue } from "./addConnectionToQueue"
import {
	ActiveUser,
	TicTacWoahSocketServer,
	TicTacWoahSocketServerMiddleware,
	TicTacWoahUserHandle,
} from "TicTacWoahSocketServer"
import { faker } from "@faker-js/faker"
import { io } from "socket.io-client"

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

		const { clientSocket, clientSocket2, serverSocket, serverSocket2 } = await startAndConnect(preConfigure)

		await clientSocket.emitWithAck("joinQueue", {})
		await clientSocket2.emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(serverSocket.emit).toHaveBeenCalledWith("gameStart", expect.anything())
			expect(serverSocket2.emit).toHaveBeenCalledWith("gameStart", expect.anything())
		})
	}
)

export function matchmaking(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	queue.onAdded(users => {
		if (users.length === 2) {
			users.forEach(user => {
				const connection = [...user.connections][0]
				connection.emit("gameStart", { id: "TODO", players: [] })
			})
		}
	})
	return (socket, next) => {
		next()
	}
}
