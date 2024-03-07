import express from "express"
import http, { createServer } from "http"
import vitest, { describe, expect, test, vi } from "vitest"
import { Server as SocketIoServer, Socket as ServerSocket } from "socket.io"
import { Socket as ClientSocket } from "socket.io-client"
import { io as clientIo } from "socket.io-client"
import {
	ClientToServerEvents,
	ServerToClientEvents,
	TicTacWoahClientSocket,
	TicTacWoahEventMap,
	TicTacWoahRemoteServerSocket,
	TicTacWoahServerSocket,
	TicTacWoahSocketServer,
	TicTacWoahSocketServerMiddleware,
} from "TicTacWoahSocketServer"
import { instrument } from "@socket.io/admin-ui"
import { StrongMap } from "utilities/StrongMap"
import { extend } from "lodash"

type GrowToSize<TItem, TNumber extends number, A extends TItem[]> = A["length"] extends TNumber
	? A
	: GrowToSize<TItem, TNumber, [...A, TItem]>

export type FixedArray<TItem, TNumber extends number> = GrowToSize<TItem, TNumber, []>

export type AssertableTicTacWoahRemoteServerSocket = Omit<TicTacWoahRemoteServerSocket, "omit"> & {
	emit: vitest.MockedFunction<TicTacWoahRemoteServerSocket["emit"]>
}

type AssertableTicTacWoahClientSocket = TicTacWoahClientSocket & {
	events: StrongMap<TicTacWoahEventMap>
}

export interface TicTacWoahConnectedTestContext {
	done: () => Promise<void>
	app: express.Express
	httpServer: http.Server
	serverIo: TicTacWoahSocketServer
	clientSocket: AssertableTicTacWoahClientSocket
	clientSocket2: AssertableTicTacWoahClientSocket
	serverSocket: TicTacWoahRemoteServerSocket
	serverSocket2: TicTacWoahRemoteServerSocket
}

export interface TicTacWoahConnectedTestContextCount {
	done: () => Promise<void>
	app: express.Express
	httpServer: http.Server
	serverIo: TicTacWoahSocketServer
	clientSockets: AssertableTicTacWoahClientSocket[]
	serverSockets: TicTacWoahRemoteServerSocket[]
	// clientSocket: AssertableTicTacWoahClientSocket
	// clientSocket2: AssertableTicTacWoahClientSocket
	// serverSocket: TicTacWoahRemoteServerSocket
	// serverSocket2: TicTacWoahRemoteServerSocket
}

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

export async function startAndConnect(
	preConfigure?: (server: TicTacWoahSocketServer) => void
): Promise<TicTacWoahConnectedTestContext> {
	const { app, httpServer, io: serverIo } = createTicTacWoahServer()

	preConfigure?.(serverIo)

	await new Promise<void>(done => httpServer.listen(done))

	const port = (httpServer.address() as { port: number }).port
	const clientSocket: TicTacWoahClientSocket = clientIo(`http://localhost:${port}`, {
		autoConnect: false,
	})
	const clientSocket2: TicTacWoahClientSocket = clientIo(`http://localhost:${port}`, {
		autoConnect: false,
	})

	clientSocket.connect()
	clientSocket2.connect()

	const clientEvents = new StrongMap<TicTacWoahEventMap>()
	const clientEvents2 = new StrongMap<TicTacWoahEventMap>()

	clientSocket.onAny((eventName, ...args) => {
		clientEvents.add(eventName, args[0])
	})

	clientSocket2.onAny((eventName, ...args) => {
		clientEvents2.add(eventName, args[0])
	})

	const clientWithEvents = clientSocket as AssertableTicTacWoahClientSocket
	const clientWithEvents2 = clientSocket2 as AssertableTicTacWoahClientSocket

	clientWithEvents.events = clientEvents
	clientWithEvents2.events = clientEvents2

	let serverSocketPreSpy: TicTacWoahRemoteServerSocket | undefined
	let serverSocketPreSpy2: TicTacWoahRemoteServerSocket | undefined

	await vi.waitFor(async () => {
		serverSocketPreSpy = (await serverIo.fetchSockets()).find(socket => socket.id === clientSocket.id)
		expect(serverSocketPreSpy).toBeDefined()

		serverSocketPreSpy2 = (await serverIo.fetchSockets()).find(socket => socket.id === clientSocket2.id)
		expect(serverSocketPreSpy2).toBeDefined()
	})

	if (!serverSocketPreSpy || !serverSocketPreSpy2) {
		throw new Error("Could not find server sockets")
	}

	vi.spyOn(serverSocketPreSpy, "emit")
	vi.spyOn(serverSocketPreSpy2, "emit")

	const serverSocket = serverSocketPreSpy
	const serverSocket2 = serverSocketPreSpy2

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
		clientSocket: clientWithEvents,
		clientSocket2: clientWithEvents2,
		serverSocket,
		serverSocket2,
	}
}

export async function start(preConfigure?: (server: TicTacWoahSocketServer) => void) {
	const { app, httpServer, io: serverIo } = createTicTacWoahServer()

	preConfigure?.(serverIo)

	await new Promise<void>(done => httpServer.listen(done))

	const port = (httpServer.address() as { port: number }).port
	const clientSocket: TicTacWoahClientSocket = clientIo(`http://localhost:${port}`, {
		autoConnect: false,
	})
	const clientSocket2: TicTacWoahClientSocket = clientIo(`http://localhost:${port}`, {
		autoConnect: false,
	})

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

	preConfigure?.(serverIo)

	await new Promise<void>(done => httpServer.listen(done))

	const port = (httpServer.address() as { port: number }).port
	const clientSockets: TicTacWoahClientSocket[] = Array.from({ length: connectedClientCount }, () =>
		clientIo(`http://localhost:${port}`, {
			autoConnect: false,
		})
	)

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

export async function startAndConnectCountReal(
	connectedClientCount: number,
	preConfigure?: (server: TicTacWoahSocketServer) => void
): Promise<TicTacWoahConnectedTestContextCount> {
	const { app, httpServer, io: serverIo } = createTicTacWoahServer()

	preConfigure?.(serverIo)

	await new Promise<void>(done => httpServer.listen(done))

	const port = (httpServer.address() as { port: number }).port
	const clientSockets: TicTacWoahClientSocket[] = Array.from({ length: connectedClientCount }, () =>
		clientIo(`http://localhost:${port}`, {
			autoConnect: false,
		})
	)

	clientSockets.forEach(socket => socket.connect())

	const serverSockets: Map<string, TicTacWoahRemoteServerSocket> = new Map()

	for (const clientSocket of clientSockets) {
		const clientEvents = new StrongMap<TicTacWoahEventMap>()
		clientSocket.onAny((eventName, ...args) => {
			clientEvents.add(eventName, args[0])
		})

		const clientWithEvents = clientSocket as AssertableTicTacWoahClientSocket
		clientWithEvents.events = clientEvents

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
		clientSockets: clientSockets.sort((a, b) => a.id!.localeCompare(b.id!)) as AssertableTicTacWoahClientSocket[],
		serverSockets: [...serverSockets.values()].sort((a, b) => a.id.localeCompare(b.id)),
	}
}

export const ticTacWoahTest = test.extend<TicTacWoahTest>({
	// eslint-disable-next-line no-empty-pattern
	setup: async ({}, use) => {
		let capturedDone = async () => {}

		const startProxy = new Proxy(start, {
			apply: async (target, thisArg, args) => {
				const result = Reflect.apply(target, thisArg, args)
				result.then(async (value: unknown) => {
					capturedDone = (value as { done: () => Promise<void> }).done
				})
				return result
			},
		})

		const startAndConnectProxy = new Proxy(startAndConnect, {
			apply: async (target, thisArg, args) => {
				const result = Reflect.apply(target, thisArg, args)
				result.then(async (value: unknown) => {
					capturedDone = (value as { done: () => Promise<void> }).done
				})
				return result
			},
		})

		const startAndConnectCountProxy = new Proxy(startAndConnectCount, {
			apply: async (target, thisArg, args) => {
				const result = Reflect.apply(target, thisArg, args)
				result.then(async (value: unknown) => {
					capturedDone = (value as { done: () => Promise<void> }).done
				})
				return result
			},
		})

		await use({
			startServer: startProxy,
			startAndConnect: startAndConnectProxy,
			startAndConnectCount: startAndConnectCountProxy,
		})

		// heaven forbid a test uses more than one setup function
		if (capturedDone) return capturedDone()
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
