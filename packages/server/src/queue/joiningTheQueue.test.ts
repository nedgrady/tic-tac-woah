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

ticTacWoahTest("One player joins the queue", async ({ setup: { startAndConnect } }) => {
	const queue = new TicTacWoahQueue()
	const startCtx = await startAndConnect(server =>
		server.use(identifyAllSocketsAsTheSameUser()).use(addConnectionToQueue(queue))
	)

	await startCtx.clientSocket.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect(queue.users.size).toBe(1))
})

ticTacWoahTest("The same user joining the queue twice only gets added once", async ({ setup: { startAndConnect } }) => {
	const queue = new TicTacWoahQueue()

	const startCtx = await startAndConnect(server =>
		server.use(identifyAllSocketsAsTheSameUser()).use(addConnectionToQueue(queue))
	)

	await startCtx.clientSocket.emitWithAck("joinQueue", {})
	await startCtx.clientSocket2.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect(queue.users.size).toBe(1))
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

	await vi.waitFor(() => expect(queue.users).toContain(uniqueIdentifier))
})

ticTacWoahTest("Two users joining the queue are added to the queue", async ({ setup: { startAndConnect } }) => {
	const queue = new TicTacWoahQueue()

	const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = ["User 1", "User 2"]

	const startCtx = await startAndConnect(server =>
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
	)

	startCtx.clientSocket.connect()
	startCtx.clientSocket2.connect()

	await startCtx.clientSocket.emitWithAck("joinQueue", {})
	await startCtx.clientSocket2.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect([...queue.users]).toEqual(expect.arrayContaining(twoUsers)))
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
			expect(queue.users.size).toBe(1)
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

		const { done, clientSocket, clientSocket2, serverSocket, serverSocket2 } = await startAndConnect(preConfigure)

		await clientSocket.emitWithAck("joinQueue", {})
		await clientSocket2.emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(queue.users.size).toBe(2)
		})

		await vi.waitFor(() => {
			expect(serverSocket.emit).toHaveBeenCalledWith("gameStart", expect.anything())
			expect(serverSocket2.emit).toHaveBeenCalledWith("gameStart", expect.anything())
		})

		return done()
	}
)

export function matchmaking(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	return (socket, next) => {
		socket.on("joinQueue", () => {
			if (queue.users.size === 2) socket.emit("gameStart", { id: "TODO", players: [] })
		})
		next()
	}
}
