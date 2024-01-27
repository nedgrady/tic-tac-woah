import { identifyAllSocketsAsTheSameUser, identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { ticTacWoahTest } from "ticTacWoahTest"
import { vi, expect } from "vitest"
import { TicTacWoahQueue, addConnectionToQueue } from "./addConnectionToQueue"
import { ActiveUser } from "TicTacWoahSocketServer"

ticTacWoahTest("One player joins the queue", async ({ ticTacWoahTestContext }) => {
	const queue = new TicTacWoahQueue()
	ticTacWoahTestContext.serverIo.use(identifyAllSocketsAsTheSameUser())
	ticTacWoahTestContext.serverIo.use(addConnectionToQueue(queue))

	ticTacWoahTestContext.clientSocket.connect()
	await ticTacWoahTestContext.clientSocket.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect(queue.users.size).toBe(1))
})

ticTacWoahTest("One player joins the queue has their connection populated", async ({ ticTacWoahTestContext }) => {
	const queue = new TicTacWoahQueue()
	ticTacWoahTestContext.serverIo.use(identifyAllSocketsAsTheSameUser())
	ticTacWoahTestContext.serverIo.use(addConnectionToQueue(queue))

	ticTacWoahTestContext.clientSocket.connect()
	await ticTacWoahTestContext.clientSocket.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect(queue.users.size).toBe(1))

	const newUser = [...queue.users][0]
	expect(newUser.connections).toContainEqual(expect.objectContaining({ id: ticTacWoahTestContext.clientSocket.id }))
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

ticTacWoahTest(
	"The queue captures the same activeUser object as the identification middleware",
	async ({ ticTacWoahTestContext }) => {
		const queue = new TicTacWoahQueue()

		const someActiveUser: ActiveUser = {
			connections: new Set(),
			uniqueIdentifier: "Some active user",
		}

		ticTacWoahTestContext.serverIo.use(identifyAllSocketsAsTheSameUser(someActiveUser))
		ticTacWoahTestContext.serverIo.use(addConnectionToQueue(queue))

		ticTacWoahTestContext.clientSocket.connect()

		await ticTacWoahTestContext.clientSocket.emitWithAck("joinQueue", {})

		await vi.waitFor(() => expect(queue.users).toContain(someActiveUser))
	}
)

ticTacWoahTest("Two users joining the queue are added to the queue", async ({ ticTacWoahTestContext }) => {
	const queue = new TicTacWoahQueue()

	const twoUsers: [ActiveUser, ActiveUser] = [
		{
			connections: new Set(),
			uniqueIdentifier: "User 1",
		},
		{
			connections: new Set(),
			uniqueIdentifier: "User 2",
		},
	]

	ticTacWoahTestContext.serverIo.use(identifySocketsInSequence(twoUsers))
	ticTacWoahTestContext.serverIo.use(addConnectionToQueue(queue))

	ticTacWoahTestContext.clientSocket.connect()
	ticTacWoahTestContext.clientSocket2.connect()

	await ticTacWoahTestContext.clientSocket.emitWithAck("joinQueue", {})
	await ticTacWoahTestContext.clientSocket2.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect([...queue.users]).toEqual(expect.arrayContaining(twoUsers)))
})
