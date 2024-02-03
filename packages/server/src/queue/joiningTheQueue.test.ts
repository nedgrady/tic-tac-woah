import { identifyAllSocketsAsTheSameUser, identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { ticTacWoahTest } from "ticTacWoahTest"
import { vi, expect } from "vitest"
import { TicTacWoahQueue, addConnectionToQueue } from "./addConnectionToQueue"
import { ActiveUser, TicTacWoahUserHandle } from "TicTacWoahSocketServer"
import { fa, faker } from "@faker-js/faker"

ticTacWoahTest("One player joins the queue", async ({ ticTacWoahTestContext }) => {
	const queue = new TicTacWoahQueue()
	ticTacWoahTestContext.serverIo.use(identifyAllSocketsAsTheSameUser())
	ticTacWoahTestContext.serverIo.use(addConnectionToQueue(queue))

	ticTacWoahTestContext.clientSocket.connect()
	await ticTacWoahTestContext.clientSocket.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect(queue.users.size).toBe(1))
})

ticTacWoahTest("The same user joining the queue twice only gets added once", async ({ ticTacWoahTestContext }) => {
	const queue = new TicTacWoahQueue()

	ticTacWoahTestContext.serverIo.use(identifyAllSocketsAsTheSameUser())
	ticTacWoahTestContext.serverIo.use(addConnectionToQueue(queue))

	ticTacWoahTestContext.clientSocket.connect()
	ticTacWoahTestContext.clientSocket2.connect()

	await ticTacWoahTestContext.clientSocket.emitWithAck("joinQueue", {})
	await ticTacWoahTestContext.clientSocket.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect(queue.users.size).toBe(1))
})

ticTacWoahTest("The queue captures the correct user handle", async ({ ticTacWoahTestContext }) => {
	const queue = new TicTacWoahQueue()

	const uniqueIdentifier = faker.string.uuid()
	const someActiveUser: ActiveUser = {
		connections: new Set(),
		uniqueIdentifier: uniqueIdentifier,
	}

	ticTacWoahTestContext.serverIo.use(identifyAllSocketsAsTheSameUser(someActiveUser))
	ticTacWoahTestContext.serverIo.use(addConnectionToQueue(queue))

	ticTacWoahTestContext.clientSocket.connect()

	await ticTacWoahTestContext.clientSocket.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect(queue.users).toContain(uniqueIdentifier))
})

ticTacWoahTest("Two users joining the queue are added to the queue", async ({ ticTacWoahTestContext }) => {
	const queue = new TicTacWoahQueue()

	const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = ["User 1", "User 2"]

	ticTacWoahTestContext.serverIo.use(
		identifySocketsInSequence(
			twoUsers.map(handle => ({
				connections: new Set(),
				uniqueIdentifier: handle,
			}))
		)
	)
	ticTacWoahTestContext.serverIo.use(addConnectionToQueue(queue))

	ticTacWoahTestContext.clientSocket.connect()
	ticTacWoahTestContext.clientSocket2.connect()

	await ticTacWoahTestContext.clientSocket.emitWithAck("joinQueue", {})
	await ticTacWoahTestContext.clientSocket2.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect([...queue.users]).toEqual(expect.arrayContaining(twoUsers)))
})
