import request from "supertest"
import { expect, vi } from "vitest"
import { ActiveUser } from "index"
import { faker } from "@faker-js/faker"
import {
	identifyAllSocketsAsTheSameUser,
	identifyByTicTacWoahUsername,
	identifySocketsInSequence,
} from "./identifyByTicTacWoahUsername"
import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"
import { ticTacWoahTest } from "./ticTacWoahTest"

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

	vi.waitFor(() => expect([...queue.users]).toBe(expect.arrayContaining(twoUsers)))
})

class TicTacWoahQueue {
	#queue: Set<ActiveUser> = new Set<ActiveUser>()

	add(user: ActiveUser) {
		this.#queue.add(user)
	}

	remove(user: ActiveUser) {}

	get users() {
		return this.#queue
	}
}

function addConnectionToQueue(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	return (socket, next) => {
		socket.on("joinQueue", (joinQueueRequest, callback) => {
			queue.add(socket.data.activeUser)
			callback && callback(0)
		})
		next()
	}
}
