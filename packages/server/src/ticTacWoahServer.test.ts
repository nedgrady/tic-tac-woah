import express from "express"
import http, { createServer } from "http"
import request from "supertest"
import { test, beforeEach, afterEach, expect, vi } from "vitest"
import { Server as SocketIoServer, Socket as ServerSocket } from "socket.io"
import { io as clientIo, Socket as ClientSocket } from "socket.io-client"
import { ActiveUser } from "index"
import { faker } from "@faker-js/faker"
import { identifyAllSocketsAsTheSameUser, identifyByTicTacWoahUsername } from "./identifyByTicTacWoahUsername"
import { TicTacWoahSocketServer, TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"
import { JoinQueueRequest } from "types"

export interface ServerToClientEvents {
	noArg: () => void
	basicEmit: (a: number, b: string, c: Buffer) => void
	withAck: (d: string, callback: (e: number) => void) => void
}
type AckCallback = (e: number) => void

export interface ClientToServerEvents {
	joinQueue(joinQueueRequest: JoinQueueRequest, callback?: AckCallback): void
}

export interface InterServerEvents {
	ping: () => void
}

export interface SocketData {
	activeUser: ActiveUser
	sockets: Set<ServerSocket>
}

function createTicTacWoahServer() {
	const app = express()
	const httpServer = createServer(app)

	const io = new SocketIoServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
		httpServer,
		{
			cors: {
				origin: ["https://admin.socket.io", "http://localhost:5173"],
				methods: ["GET", "POST"],
				credentials: true,
			},
		}
	)

	return {
		app,
		httpServer,
		io,
	}
}

let httpServerUnderTest: http.Server
let socketIoServerUnderTest: TicTacWoahSocketServer

let clientSocket: ClientSocket<ServerToClientEvents, ClientToServerEvents> = clientIo("http://localhost:9999", {
	autoConnect: false,
})

let clientSocket2 = clientIo("http://localhost:9999", {
	autoConnect: false,
})

beforeEach(
	() =>
		new Promise<void>(done => {
			const { app, httpServer, io } = createTicTacWoahServer()

			httpServerUnderTest = httpServer
			socketIoServerUnderTest = io

			clientSocket = clientIo("http://localhost:9999", {
				autoConnect: false,
			})

			clientSocket2 = clientIo("http://localhost:9999", {
				autoConnect: false,
			})

			httpServer.listen(9999, done)
		})
)

afterEach(
	() =>
		new Promise<void>(done => {
			clientSocket.close()
			clientSocket2.close()
			socketIoServerUnderTest.close()
			return httpServerUnderTest.close(() => {
				done()
			})
		})
)

test("Health returns 200", () => {
	return new Promise(done => {
		request(httpServerUnderTest).get("/health").expect(200, done)
	})
})

test("Something web sockets", () => {
	return new Promise(done => {
		clientSocket.on("connect", () => {
			done("pass")
		})

		clientSocket.connect()
	})
})

test("One player joins the queue", async () => {
	const queue = new TicTacWoahQueue()
	socketIoServerUnderTest.use(identifyAllSocketsAsTheSameUser())
	socketIoServerUnderTest.use(addConnectionToQueue(queue))

	clientSocket.connect()
	await clientSocket.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect(queue.users.size).toBe(1))
})

test("One player joins the queue has their connection populated", async () => {
	const queue = new TicTacWoahQueue()
	socketIoServerUnderTest.use(identifyAllSocketsAsTheSameUser())
	socketIoServerUnderTest.use(addConnectionToQueue(queue))

	clientSocket.connect()
	await clientSocket.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect(queue.users.size).toBe(1))

	const newUser = [...queue.users][0]
	expect(newUser.connections).toContainEqual(expect.objectContaining({ id: clientSocket.id }))
})

test("Active user uniqueIdentifier is populated", async () => {
	socketIoServerUnderTest.use(identifyByTicTacWoahUsername)

	const userName = faker.internet.userName()

	clientSocket.auth = {
		token: userName,
		type: "tic-tac-woah-username",
	}

	clientSocket.connect()

	await vi.waitFor(async () => {
		expect(await socketIoServerUnderTest.fetchSockets()).toHaveLength(1)
		const serverSocket = (await socketIoServerUnderTest.fetchSockets())[0]
		expect(serverSocket.data.activeUser.uniqueIdentifier).toBe(userName)
	})
})

test("Active user connection is populated", async () => {
	socketIoServerUnderTest.use(identifyByTicTacWoahUsername)

	clientSocket.auth = {
		token: "any username",
		type: "tic-tac-woah-username",
	}

	clientSocket.connect()

	await vi.waitFor(async () => {
		const activeSockets = await socketIoServerUnderTest.fetchSockets()
		expect(activeSockets).toHaveLength(1)

		const activeUserConnections = activeSockets[0].data.activeUser.connections
		expect(activeUserConnections).toContainEqual(expect.objectContaining({ id: clientSocket.id }))
	})
})

test("Two connections with the same username are captured on the same active user.", async () => {
	socketIoServerUnderTest.use(identifyByTicTacWoahUsername)

	clientSocket.auth = {
		token: "Same username",
		type: "tic-tac-woah-username",
	}

	clientSocket2.auth = {
		token: "Same username",
		type: "tic-tac-woah-username",
	}

	clientSocket.connect()
	clientSocket2.connect()

	await vi.waitFor(async () => {
		const activeSockets = await socketIoServerUnderTest.fetchSockets()
		expect(activeSockets).toHaveLength(2)

		const activeUserFromConnection1 = activeSockets[0].data.activeUser
		expect(activeUserFromConnection1.connections).toHaveLength(2)

		const activeUserFromConnection2 = activeSockets[1].data.activeUser

		expect(activeUserFromConnection1).toBe(activeUserFromConnection2)
	})
})

test("Two connections with diffrent usernames are captured on diffrent active users.", async () => {
	socketIoServerUnderTest.use(identifyByTicTacWoahUsername)

	clientSocket.auth = {
		token: "Different username 1",
		type: "tic-tac-woah-username",
	}

	clientSocket2.auth = {
		token: "Different username 2",
		type: "tic-tac-woah-username",
	}

	clientSocket.connect()
	clientSocket2.connect()

	await vi.waitFor(async () => {
		const activeSockets = await socketIoServerUnderTest.fetchSockets()
		expect(activeSockets).toHaveLength(2)

		const activeUserFromConnection1 = activeSockets[0].data.activeUser
		const activeUserFromConnection2 = activeSockets[1].data.activeUser

		expect(activeUserFromConnection1).not.toBe(activeUserFromConnection2)
		expect(activeUserFromConnection1.connections).toHaveLength(1)
		expect(activeUserFromConnection2.connections).toHaveLength(1)
	})
})

test("The same user joining the queue twice only gets added once", async () => {
	const queue = new TicTacWoahQueue()

	socketIoServerUnderTest.use(identifyAllSocketsAsTheSameUser())
	socketIoServerUnderTest.use(addConnectionToQueue(queue))

	clientSocket.connect()
	clientSocket2.connect()

	await clientSocket.emitWithAck("joinQueue", {})
	await clientSocket2.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect(queue.users.size).toBe(1))
})

test("The queue captures the same activeUser object as the identification middleware", async () => {
	const queue = new TicTacWoahQueue()

	const someActiveUser: ActiveUser = {
		connections: new Set(),
		uniqueIdentifier: "Some active user",
	}

	socketIoServerUnderTest.use(identifyAllSocketsAsTheSameUser(someActiveUser))
	socketIoServerUnderTest.use(addConnectionToQueue(queue))

	clientSocket.connect()

	await clientSocket.emitWithAck("joinQueue", {})

	await vi.waitFor(() => expect(queue.users).toContain(someActiveUser))
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
		const set = new Set<ServerSocket>()
		set.add(socket)
		socket.on("joinQueue", (joinQueueRequest, callback) => {
			if (queue.users.size === 0) {
				queue.add(socket.data.activeUser)
			}
			callback && callback(0)
		})
		next()
	}
}
