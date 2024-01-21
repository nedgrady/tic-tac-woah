import express from "express"
import http, { createServer } from "http"
import request from "supertest"
import { test, beforeEach, afterEach, ArgumentsType, expect, vi } from "vitest"
import { Server as SocketIoServer, Socket as ServerSocket, Socket, RemoteSocket } from "socket.io"
import { io as clientIo } from "socket.io-client"
import { ActiveUser } from "index"
import { faker } from "@faker-js/faker"
import { identifyByTicTacWoahUsername } from "./identifyByTicTacWoahUsername"

interface ServerToClientEvents {
	noArg: () => void
	basicEmit: (a: number, b: string, c: Buffer) => void
	withAck: (d: string, callback: (e: number) => void) => void
}

interface ClientToServerEvents {
	hello: () => void
}

interface InterServerEvents {
	ping: () => void
}

interface SocketData {
	activeUser: ActiveUser
	sockets: Set<ServerSocket>
}

type TicTacWoahSocketServer = SocketIoServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
type TicTacWoahRemoteSocket = Awaited<ReturnType<TicTacWoahSocketServer["fetchSockets"]>>[0]

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

const clientSocket = clientIo("http://localhost:9999", {
	autoConnect: false,
})

beforeEach(
	() =>
		new Promise<void>(done => {
			const { app, httpServer, io } = createTicTacWoahServer()
			httpServer.listen(9999, done)

			httpServerUnderTest = httpServer
			socketIoServerUnderTest = io
		})
)

afterEach(
	() =>
		new Promise<void>(done => {
			clientSocket.close()
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
	socketIoServerUnderTest.use(addConnectionToQueue(queue))

	clientSocket.on("connect", () => {
		clientSocket.emit("join queue", "some data")
	})
	clientSocket.connect()

	await vi.waitFor(() => expect(queue.users.size).toBe(1))
})

test("One player joins the queue has their connection populated", async () => {
	const queue = new TicTacWoahQueue()
	socketIoServerUnderTest.use(addConnectionToQueue(queue))

	clientSocket.on("connect", () => {
		clientSocket.emit("join queue", "some data")
	})
	clientSocket.connect()

	await vi.waitFor(() => expect(queue.users.size).toBe(1))

	const newUser = [...queue.users][0]
	expect([...newUser.connections][0].id).toBe(clientSocket.id)
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

test.only("Active user connection is populated", async () => {
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

function addConnectionToQueue(queue: TicTacWoahQueue): ArgumentsType<SocketIoServer["use"]>[0] {
	return (socket, next) => {
		const set = new Set<ServerSocket>()
		set.add(socket)
		socket.on("join queue", () => {
			console.log("==== socket.io connection", socket.id)
			queue.add({ uniqueIdentifier: "", connections: set })
		})
		next()
	}
}
