import express from "express"
import http, { createServer } from "http"
import { test } from "vitest"
import { Server as SocketIoServer } from "socket.io"
import { io as clientIo } from "socket.io-client"
import { TicTacWoahClientSocket, TicTacWoahSocketServer } from "TicTacWoahSocketServer"

// declare module "vitest" {
// 	export interface TestContext {
// 		ticTacWoahTestContext: TicTacWoahTestContext
// 	}
// }

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

// let httpServerUnderTest: http.Server
// let socketIoServerUnderTest: TicTacWoahSocketServer

// let clientSocket: ClientSocket<ServerToClientEvents, ClientToServerEvents> = clientIo("http://localhost:9999", {
// 	autoConnect: false,
// })

// let clientSocket2 = clientIo("http://localhost:9999", {
// 	autoConnect: false,
// })

// beforeEach(
// 	async context =>
// 		new Promise<void>(done => {
// 			const { app, httpServer, io } = createTicTacWoahServer()

// 			httpServerUnderTest = httpServer
// 			socketIoServerUnderTest = io

// 			clientSocket = clientIo("http://localhost:9999", {
// 				autoConnect: false,
// 			})

// 			clientSocket2 = clientIo("http://localhost:9999", {
// 				autoConnect: false,
// 			})

// 			httpServer.listen(9999, done)
// 		})
// )

// afterEach(
// 	() =>
// 		new Promise<void>(done => {
// 			clientSocket.close()
// 			clientSocket2.close()
// 			socketIoServerUnderTest.close()
// 			return httpServerUnderTest.close(() => {
// 				done()
// 			})
// 		})
// )

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

		const clientSocket: TicTacWoahClientSocket = clientIo("http://localhost:9998", {
			autoConnect: false,
		})

		const clientSocket2: TicTacWoahClientSocket = clientIo("http://localhost:9998", {
			autoConnect: false,
		})

		await new Promise<void>(done => httpServer.listen(9998, done))

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
