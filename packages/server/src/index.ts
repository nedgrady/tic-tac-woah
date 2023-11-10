import "dotenv/config"
import express from "express"
import { createServer } from "http"
import cors from "cors"
import { Server, Socket } from "socket.io"
import path from "path"
import { Game } from "./Game"
import { Participant } from "./Participant"
import { instrument } from "@socket.io/admin-ui"
import { CoordinatesDtoSchema, GameStartDto, MoveDto } from "types"
import { Move } from "./Move"
import crypto from "crypto"
import * as applicationInsights from "applicationinsights"
import os from "os"
import debug from "debug"

interface ParticipantHandle {
	readonly connection: Socket
	readonly participant: Participant
}

applicationInsights
	.setup(
		"InstrumentationKey=691cf8f7-d5ef-45df-a5ff-385d9429be4b;IngestionEndpoint=https://uksouth-1.in.applicationinsights.azure.com/;LiveEndpoint=https://uksouth.livediagnostics.monitor.azure.com/"
	)
	.setAutoCollectConsole(true, false)
	.start()

applicationInsights.defaultClient.context.tags[applicationInsights.defaultClient.context.keys.cloudRole] =
	"tic-tac-woah.server"
applicationInsights.defaultClient.context.tags[
	applicationInsights.defaultClient.context.keys.cloudRoleInstance
] = `${os.hostname()}`

applicationInsights.defaultClient.commonProperties = {
	"tic-tac-woah.source": "default",
}

debug.log = (message: any, ...args: any[]) => {
	console.log(message)
	console.log(typeof message)
	applicationInsights.defaultClient.trackTrace({
		message: message,
		properties: {
			...args,
			"tic-tac-woah.source": "debug",
		},
	})

	applicationInsights.defaultClient.flush()
}

const app = express()
const httpServer = createServer(app)

const queue: Set<Socket> = new Set<Socket>()

const io = new Server(httpServer, {
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

io.on("connection", async socket => {
	socket.onAny((eventName, ...args) => {
		console.log(`${socket.id} emitted ${eventName}`, args)
	})
	queue.add(socket)
	socket.join("queue")

	socket.on("disconnect", async () => {
		queue.delete(socket)
	})

	if (queue.size === 3) {
		const gameId = crypto.randomUUID()

		console.log("Match made.")

		const players: readonly ParticipantHandle[] = Array.from(queue).map(socket => ({
			connection: socket,
			participant: new Participant(),
		}))

		const participants = Object.freeze(players.map(player => player.participant))

		const game = new Game(participants)

		game.onStart(() => {
			players.forEach(player => {
				player.connection.join(gameId)
				player.connection.on("move", payload => {
					const coordinates = CoordinatesDtoSchema.parse(JSON.parse(payload))

					const move: Move = {
						mover: player.participant,
						placement: coordinates,
					}

					// Which one of these?
					game.submitMove(move)
					player.participant.makeMove(coordinates)
				})
			})

			const gameStartDto: GameStartDto = {
				id: gameId,
				players: players.map(player => player.connection.id),
			}

			io.to(gameId).emit("game start", gameStartDto)
		})

		game.onMove(move => {
			const mover = players.find(player => player.participant == move.mover)

			if (!mover) throw new Error(`Could not locate mover ${move.mover}`)

			const moveDto: MoveDto = {
				placement: move.placement,
				mover: mover.connection.id,
			}

			io.to(gameId).emit("move", moveDto)
		})

		game.start()
		queue.clear()
	}
})

// io.of("/").adapter.on("create-room", room => {
// 	console.log(`room ${room} was created`)
// })

// io.of("/").adapter.on("join-room", (room, id) => {
// 	console.log(`socket ${id} has joined room ${room}`)
// })

app.use(cors())

if (process.env.NODE_ENV === "production") {
	const pathToClientBuiltFolder = process.env.PATH_TO_CLIENT_BUILT_FOLDER
	console.log("==== serving /tic-tac-woah", pathToClientBuiltFolder)

	if (!pathToClientBuiltFolder) throw new Error("PATH_TO_CLIENT_BUILT_FOLDER not set")

	app.use("/tic-tac-woah", express.static(pathToClientBuiltFolder))

	app.get("/tic-tac-woah*", (_, response) => response.sendFile(path.join(pathToClientBuiltFolder, "index.html")))
}

app.get("/version", (_, response) => {
	response.send(process.env.RENDER_GIT_COMMIT)
})

app.get("/queue", async (_, response) => {
	const sockets = await io.in("queue").fetchSockets()
	response.json({
		depth: queue.size,
	})
})

app.get("/info", async (_, response) => {
	const sockets = await io.in("queue").fetchSockets()
	response.json(
		sockets.map(socket => ({
			id: socket.id,
			rooms: socket.rooms,
		}))
	)
})

app.get("/health", (_, response) => {
	const healthInfo = {
		status: "healthy",
		uptime: process.uptime() + "s",
		timestamp: new Date(),
		memoryUsage: process.memoryUsage(),
	}

	response.json(healthInfo)
})

process.on("uncaughtException", (error, origin) => {
	applicationInsights.defaultClient.trackException({ exception: error, properties: { origin } })
})

httpServer.on("listening", () => {
	applicationInsights.defaultClient.trackEvent({ name: "server start" })
})

httpServer.on("shutdown", () => {
	applicationInsights.defaultClient.trackEvent({ name: "server shutdown" })
})

process.on("beforeExit", async () => {
	applicationInsights.defaultClient.flush()
})

httpServer.listen(8080)
