import express from "express"
import http, { createServer } from "http"
import vitest, { expect, vi } from "vitest"
import { io as clientIo } from "socket.io-client"
import { Server as SocketIoServer } from "socket.io"
import { TicTacWoahEventMap, TicTacWoahRemoteServerSocket, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { instrument } from "@socket.io/admin-ui"
import { StrongMap } from "utilities/StrongMap"
import { TicTacWoahClientSocket } from "types"

export type AssertableTicTacWoahRemoteServerSocket = Omit<TicTacWoahRemoteServerSocket, "omit"> & {
	emit: vitest.MockedFunction<TicTacWoahRemoteServerSocket["emit"]>
}

export type AssertableTicTacWoahClientSocket = TicTacWoahClientSocket & {
	id: string
	events: StrongMap<TicTacWoahEventMap>
}
export interface TicTacWoahConnectedTestContextCount {
	done: () => Promise<void>
	app: express.Express
	httpServer: http.Server
	serverIo: TicTacWoahSocketServer
	clientSockets: AssertableTicTacWoahClientSocket[]
	serverSockets: TicTacWoahRemoteServerSocket[]
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

async function startAndConnectCount(
	connectedClientCount: number,
	preConfigure: (server: TicTacWoahSocketServer) => void,
	configureClientSockets?: ConfigureTicTacWoahClientSocket,
): Promise<TicTacWoahConnectedTestContextCount> {
	const { app, httpServer, io: serverIo } = createTicTacWoahServer()

	preConfigure(serverIo)

	await new Promise<void>(done => httpServer.listen(done))

	const port = (httpServer.address() as { port: number }).port
	const clientSockets: TicTacWoahClientSocket[] = Array.from({ length: connectedClientCount }, () =>
		clientIo(`http://localhost:${port}`, {
			autoConnect: false,
		}),
	)

	clientSockets.forEach((socket, index) => {
		configureClientSockets?.(socket, index)
		socket.connect()
	})

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
				}),
			)
		},
		app,
		serverIo,
		httpServer,
		clientSockets: clientSockets.sort((a, b) => a.id!.localeCompare(b.id!)) as AssertableTicTacWoahClientSocket[],
		serverSockets: [...serverSockets.values()].sort((a, b) => a.id.localeCompare(b.id)),
	}
}

export type ConfigureTicTacWoahClientSocket = (socket: TicTacWoahClientSocket, index: number) => void
export type ConfigureTicTacWoahSocketServer = (server: TicTacWoahSocketServer) => void
export class StartAndConnectLifetime {
	private _value: Awaited<ReturnType<typeof startAndConnectCount>> | null

	private _configureSockets: ConfigureTicTacWoahClientSocket[] = []

	constructor(
		private preConfigure: (server: TicTacWoahSocketServer) => void,
		private count: number = 2,
	) {
		this._value = null
	}

	configureSocket(configure: ConfigureTicTacWoahClientSocket) {
		this._configureSockets.push(configure)
	}

	private get value(): Awaited<ReturnType<typeof startAndConnectCount>> {
		if (this._value === null) throw new Error("Test context not initialized")

		return this._value
	}

	async start() {
		const configureSocket: ConfigureTicTacWoahClientSocket = (socket, index) =>
			this._configureSockets.forEach(configure => configure(socket, index))
		this._value = await startAndConnectCount(this.count, this.preConfigure, configureSocket)
	}

	public get done() {
		return this.value.done
	}

	public get clientSockets() {
		return this.value.clientSockets
	}

	public get clientSocket() {
		return this.value.clientSockets[0]
	}

	public get clientSocket2() {
		return this.value.clientSockets[1]
	}

	public get serverIo() {
		return this.value.serverIo
	}
}
