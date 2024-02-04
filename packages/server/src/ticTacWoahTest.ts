import express from "express"
import http, { createServer } from "http"
import vitest, { describe, expect, test, vi } from "vitest"
import { Server as SocketIoServer } from "socket.io"
import { io as clientIo } from "socket.io-client"
import {
	ServerToClientEvents,
	TicTacWoahClientSocket,
	TicTacWoahServerSocket,
	TicTacWoahSocketServer,
	TicTacWoahSocketServerMiddleware,
} from "TicTacWoahSocketServer"
import portfinder from "portfinder"
import { instrument } from "@socket.io/admin-ui"
import { s } from "vitest/dist/reporters-1evA5lom"
import e from "cors"

type TicTacWoahRemoteServerSocket = Awaited<ReturnType<TicTacWoahSocketServer["fetchSockets"]>>[0]

function createTicTacWoahServer() {
	const app = express()
	const httpServer = createServer(app)

	const io: TicTacWoahSocketServer = new SocketIoServer(httpServer, {
		cors: {
			origin: ["https://admin.socket.io", "http://localhost:5173"],
			methods: ["GET", "POST"],
			credentials: true,
		},
	})

	instrument(io, {
		auth: false,
		mode: "development",
	})

	return {
		app,
		httpServer,
		io,
	}
}

export async function startAndConnect(preConfigure?: (server: TicTacWoahSocketServer) => void) {
	const { app, httpServer, io: serverIo } = createTicTacWoahServer()
	const port = await portfinder.getPortPromise()

	preConfigure?.(serverIo)

	const clientSocket: TicTacWoahClientSocket = clientIo(`http://localhost:${port}`, {
		autoConnect: false,
	})

	const clientSocket2: TicTacWoahClientSocket = clientIo(`http://localhost:${port}`, {
		autoConnect: false,
	})

	await new Promise<void>(done => httpServer.listen(port, done))

	clientSocket.connect()
	clientSocket2.connect()

	let serverSocket: TicTacWoahRemoteServerSocket | undefined
	let serverSocket2: TicTacWoahRemoteServerSocket | undefined

	await vi.waitFor(async () => {
		serverSocket = (await serverIo.fetchSockets()).find(socket => socket.id === clientSocket.id)
		expect(serverSocket).toBeDefined()

		serverSocket2 = (await serverIo.fetchSockets()).find(socket => socket.id === clientSocket2.id)
		expect(serverSocket2).toBeDefined()
	})

	if (!serverSocket || !serverSocket2) {
		throw new Error("Could not find server sockets")
	}

	vi.spyOn(serverSocket, "emit")
	vi.spyOn(serverSocket2, "emit")

	return {
		done: async () => {
			clientSocket.close()
			clientSocket2.close()
			serverIo.close()
			return new Promise<void>(done =>
				httpServer.close(() => {
					done()
				})
			)
		},
		app,
		httpServer,
		serverIo,
		clientSocket,
		clientSocket2,
		serverSocket,
		serverSocket2,
	}
}

export async function start(preConfigure?: (server: TicTacWoahSocketServer) => void) {
	const { app, httpServer, io: serverIo } = createTicTacWoahServer()
	const port = await portfinder.getPortPromise()

	preConfigure?.(serverIo)

	const clientSocket: TicTacWoahClientSocket = clientIo(`http://localhost:${port}`, {
		autoConnect: false,
	})

	const clientSocket2: TicTacWoahClientSocket = clientIo(`http://localhost:${port}`, {
		autoConnect: false,
	})

	await new Promise<void>(done => httpServer.listen(port, done))

	return {
		done: async () => {
			clientSocket.close()
			clientSocket2.close()
			serverIo.close()
			return new Promise<void>(done =>
				httpServer.close(() => {
					done()
				})
			)
		},
		app,
		serverIo,
		httpServer,
		clientSocket,
		clientSocket2,
	}
}

export async function startAndConnectCount(
	connectedClientCount: number,
	preConfigure?: (server: TicTacWoahSocketServer) => void
) {
	const { app, httpServer, io: serverIo } = createTicTacWoahServer()
	const port = await portfinder.getPortPromise()

	preConfigure?.(serverIo)

	const clientSockets: TicTacWoahClientSocket[] = Array.from({ length: connectedClientCount }, () =>
		clientIo(`http://localhost:${port}`, {
			autoConnect: false,
		})
	)

	await new Promise<void>(done => httpServer.listen(port, done))

	clientSockets.forEach(socket => socket.connect())

	const serverSockets: Map<string, TicTacWoahRemoteServerSocket> = new Map()

	for (const clientSocket of clientSockets) {
		await vi.waitFor(async () => {
			const socket = (await serverIo.fetchSockets()).find(socket => socket.id === clientSocket.id)
			expect(socket).toBeDefined()

			serverSockets.set(socket!.id, socket!)
		})
	}

	serverSockets.forEach(socket => vi.spyOn(socket, "emit"))

	return {
		done: async () => {
			clientSockets.forEach(socket => socket.close())
			serverIo.close()
			return new Promise<void>(done =>
				httpServer.close(() => {
					done()
				})
			)
		},
		app,
		serverIo,
		httpServer,
		clientSockets: clientSockets.sort((a, b) => a.id!.localeCompare(b.id!)),
		serverSockets: [...serverSockets.values()].sort((a, b) => a.id.localeCompare(b.id)),
	}
}

export const ticTacWoahTest = test.extend<TicTacWoahTest>({
	// eslint-disable-next-line no-empty-pattern
	setup: async ({}, use) => {
		await use({
			startServer: start,
			startAndConnect,
			startAndConnectCount,
		})
	},
})

type TicTacWoahTestContext = {
	startServer: typeof start
	startAndConnect: typeof startAndConnect
	startAndConnectCount: typeof startAndConnectCount
}

type TicTacWoahTest = {
	setup: TicTacWoahTestContext
}

// export const ticTacWoahTest = test.extend<Thing>({
// 	// eslint-disable-next-line no-empty-pattern
// 	ticTacWoahTestContext: async ({}, use) => {
// 		const { app, httpServer, io: serverIo } = createTicTacWoahServer()
// 		const port = await portfinder.getPortPromise()

// 		const clientSocketEvents = new Map<EventName, EventPayload<EventName>[]>()

// 		const clientSocket: TicTacWoahClientSocket = clientIo(`http://localhost:${port}`, {
// 			autoConnect: false,
// 		})

// 		clientSocket.onAny((eventName, ...args) => {
// 			clientSocketEvents.set(eventName, args)
// 		})
// 		// TODO - how to get rid of these casts? Spreading the socket whines about
// 		// private properties missing :(
// 		;(clientSocket as AssertableTicTacWoahClientSocket).events = clientSocketEvents

// 		const clientSocket2Events = new Map<EventName, EventPayload<EventName>[]>()
// 		const clientSocket2: TicTacWoahClientSocket = clientIo(`http://localhost:${port}`, {
// 			autoConnect: false,
// 		})

// 		clientSocket2.onAny((eventName, ...args) => {
// 			clientSocket2Events.set(eventName, args)
// 		})
// 		;(clientSocket2 as AssertableTicTacWoahClientSocket).events = clientSocketEvents

// 		// TODO - add some logging (if enabled) to help debug tests?

// 		await new Promise<void>(done => httpServer.listen(port, done))

// 		const ticTacWoahTestContext = {
// 			app,
// 			httpServer,
// 			serverIo,
// 			clientSocket: clientSocket as AssertableTicTacWoahClientSocket,
// 			clientSocket2: clientSocket2 as AssertableTicTacWoahClientSocket,
// 		}

// 		await use(ticTacWoahTestContext)

// 		// cleanup the fixture after each test function
// 		await new Promise<void>(done => {
// 			clientSocket.close()
// 			clientSocket2.close()
// 			serverIo.close()
// 			httpServer.close(() => {
// 				done()
// 			})
// 		})
// 	},
// })
