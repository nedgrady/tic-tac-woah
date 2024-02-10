import { identifyAllSocketsAsTheSameUser, identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { ticTacWoahTest } from "ticTacWoahTest"
import { vi, expect } from "vitest"
import { TicTacWoahQueue, addConnectionToQueue } from "./addConnectionToQueue"
import { ActiveUser } from "TicTacWoahSocketServer"
import { faker } from "@faker-js/faker"

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
