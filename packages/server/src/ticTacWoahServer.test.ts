import express from "express"
import http, { createServer } from "http"
import request from "supertest"
import { test, beforeEach, afterEach, ArgumentsType, expect, vi } from "vitest"
import { Server as SocketIoServer, Socket as ServerSocket, Socket } from "socket.io"
import { io as clientIo } from "socket.io-client"
import { ActiveUser } from "index"
import { faker } from "@faker-js/faker"

// class TicTacWoahServer {
// 	#expressServer: Express
// 	#app?: ReturnType<Express["listen"]>

// 	constructor(httpServer: Express) {
// 		this.#expressServer = httpServer
// 		const app = http.createServer(httpServer)

// 		const io = new Server(app, {
// 			cors: {
// 				origin: ["https://admin.socket.io", "http://localhost:5173"],
// 				methods: ["GET", "POST"],
// 				credentials: true,
// 			},
// 		})

// 		httpServer.get("/health", (_, response) => {
// 			const healthInfo = {
// 				status: "healthy",
// 				uptime: process.uptime() + "s",
// 				timestamp: new Date(),
// 				memoryUsage: process.memoryUsage(),
// 			}

// 			response.json(healthInfo)
// 		})
// 	}

// 	start() {
// 		this.#app = this.#expressServer.listen(9999)
// 	}

// 	stop(callback?: ((err?: Error | undefined) => void) | undefined) {
// 		this.#app?.close(callback)
// 	}
// }

function createTicTacWoahServer() {
	const app = express()
	const httpServer = createServer(app)

	const io = new SocketIoServer(httpServer, {
		cors: {
			origin: ["https://admin.socket.io", "http://localhost:5173"],
			methods: ["GET", "POST"],
			credentials: true,
		},
	})

	return {
		app,
		httpServer,
		io,
	}
}

let httpServerUnderTest: http.Server
let socketIoServerUnderTest: SocketIoServer

beforeEach(() => {
	const { app, httpServer, io } = createTicTacWoahServer()
	httpServer.listen(9999)
	httpServerUnderTest = httpServer
	socketIoServerUnderTest = io
})

afterEach(
	() =>
		new Promise<void>(done => {
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
		const socket = clientIo("http://localhost:9999", {
			autoConnect: false,
		})
		socket.on("connect", () => {
			done("pass")
		})

		socket.connect()
	})
})

test("One player joins the queue", async () => {
	const queue = new TicTacWoahQueue()
	socketIoServerUnderTest.use(addConnectionToQueue(queue))
	const socket = clientIo("http://localhost:9999", {
		autoConnect: false,
	})

	socket.on("connect", () => {
		socket.emit("join queue", "some data")
	})

	socket.connect()

	await vi.waitFor(() => expect(queue.users.size).toBe(1))
})

test("One player joins the queue has their connection populated", async () => {
	const queue = new TicTacWoahQueue()
	socketIoServerUnderTest.use(addConnectionToQueue(queue))
	const socket = clientIo("http://localhost:9999", {
		autoConnect: false,
	})

	socket.on("connect", () => {
		socket.emit("join queue", "some data")
		console.log("==== socket.io connection", socket.id)
	})

	socket.connect()

	await vi.waitFor(() => expect(queue.users.size).toBe(1))

	const newUser = [...queue.users][0]
	expect([...newUser.connections][0].id).toBe(socket.id)
})

test("Active user uniqueIdentifier is populated", async () => {
	socketIoServerUnderTest.use(identifyByTicTacWoahUsername)

	const userName = faker.internet.userName()
	const socket = clientIo("http://localhost:9999", {
		autoConnect: false,
		auth: {
			token: userName,
			type: "tic-tac-woah-username",
		},
	})

	socket.connect()

	await vi.waitFor(async () => expect(await socketIoServerUnderTest.fetchSockets()).toHaveLength(1))

	const serverSocket = (await socketIoServerUnderTest.fetchSockets())[0]

	await vi.waitFor(() =>
		expect(serverSocket.data.activeUser).toMatchObject<ActiveUser>({
			uniqueIdentifier: userName,
			connections: expect.any(Set),
		})
	)
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

const identifyByTicTacWoahUsername: ArgumentsType<SocketIoServer["use"]>[0] = (socket, next) => {
	console.log("==== socket.io auth", socket.handshake.auth.token)
	socket.data.activeUser = {
		uniqueIdentifier: socket.handshake.auth.token,
		connections: new Set(),
	}
	next()
}
