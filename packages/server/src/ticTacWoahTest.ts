import express from "express"
import http, { createServer } from "http"
import { test } from "vitest"
import { Server as SocketIoServer } from "socket.io"
import { io as clientIo } from "socket.io-client"
import { TicTacWoahClientSocket, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import portfinder from "portfinder"

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

	return {
		app,
		httpServer,
		io,
	}
}

type TicTacWoahTestContext = {
	httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
	serverIo: TicTacWoahSocketServer
	clientSocket: TicTacWoahClientSocket
	clientSocket2: TicTacWoahClientSocket
}

type Thing = {
	ticTacWoahTestContext: TicTacWoahTestContext
}

export const ticTacWoahTest = test.extend<Thing>({
	// eslint-disable-next-line no-empty-pattern
	ticTacWoahTestContext: async ({}, use) => {
		const { app, httpServer, io: serverIo } = createTicTacWoahServer()
		const port = await portfinder.getPortPromise()

		const clientSocket: TicTacWoahClientSocket = clientIo(`http://localhost:${port}`, {
			autoConnect: false,
		})

		const clientSocket2: TicTacWoahClientSocket = clientIo(`http://localhost:${port}`, {
			autoConnect: false,
		})

		// TODO - add some logging (if enabled) to help debug tests?

		await new Promise<void>(done => httpServer.listen(port, done))

		const ticTacWoahTestContext = {
			app,
			httpServer,
			serverIo,
			clientSocket,
			clientSocket2,
		}

		await use(ticTacWoahTestContext)

		// cleanup the fixture after each test function
		await new Promise<void>(done => {
			clientSocket.close()
			clientSocket2.close()
			serverIo.close()
			httpServer.close(() => {
				done()
			})
		})
	},
})
