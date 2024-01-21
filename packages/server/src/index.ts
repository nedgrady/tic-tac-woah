import "dotenv/config"
import express from "express"
import { createServer } from "http"
import cors from "cors"
import { Server, Socket } from "socket.io"
import path from "path"

import { instrument } from "@socket.io/admin-ui"
import { CoordinatesDtoSchema, GameStartDto, GameWinDto, MoveDto, QueueResponse } from "types"
import crypto from "crypto"
import applicationInsights from "./logging/applicationInsights"
import { Game } from "domain/Game"
import { Participant } from "domain/Participant"
import {
	anyMoveIsAllowed,
	moveMustBeMadeByTheCorrectPlayer,
	moveMustBeMadeIntoAFreeSquare,
	moveMustBeWithinTheBoard,
	standardRules,
} from "domain/gameRules/gameRules"
import {
	gameIsWonOnMoveNumber,
	standardWinConditions,
	winByConsecutiveDiagonalPlacements,
	winByConsecutiveHorizontalPlacements,
	winByConsecutiveVerticalPlacements,
} from "domain/winConditions/winConditions"

interface ParticipantHandle {
	readonly activeUser: ActiveUser
	readonly participant: Participant
}

export interface ActiveUser {
	readonly connections: Set<Socket>
	readonly uniqueIdentifier: string
}

const activeUsers: Map<string, ActiveUser> = new Map<string, ActiveUser>()

const app = express()
const httpServer = createServer(app)

const queue: Set<ActiveUser> = new Set<ActiveUser>()

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

io.use((socket, next) => {
	console.log("==== socket.io connection", socket.id)
	socket.on("connect_error", error => {
		console.log("==== socket.io connect error", error)
	})
	next()
})

io.use((socket, next) => {
	const authToken = socket.handshake.auth.token
	let user = activeUsers.get(authToken)

	console.log("==== socket.io auth", authToken)

	// If the user is not in the activeUsers map, add them
	if (!user) {
		user = { connections: new Set(), uniqueIdentifier: authToken }
		activeUsers.set(authToken, user)
	}
	user.connections.add(socket)
	next()
})

io.on("connection", async socket => {
	socket.onAny((eventName, ...args) => {
		console.log(`${socket.id} emitted ${eventName}`, args)
	})

	socket.on("join queue", () => {
		const user = activeUsers.get(socket.handshake.auth.token)
		if (!user) throw new Error("User not found")

		queue.add(user)

		if (queue.size === 2) {
			const gameId = crypto.randomUUID()

			console.log("Match made.")

			const players: readonly ParticipantHandle[] = Array.from(queue).map(user => ({
				activeUser: user,
				participant: new Participant(),
			}))

			const participants = Object.freeze(players.map(player => player.participant))

			const game = new Game(participants, 20, 5, [anyMoveIsAllowed], [gameIsWonOnMoveNumber(3)])

			game.onStart(() => {
				players.forEach(player => {
					player.activeUser.connections.forEach(connection => connection.join(gameId))

					player.activeUser.connections.forEach(connection =>
						connection.on("move", payload => {
							const coordinates = CoordinatesDtoSchema.parse(JSON.parse(payload))
							player.participant.makeMove(coordinates)
						})
					)
				})

				const gameStartDto: GameStartDto = {
					id: gameId,
					players: players.map(player => player.activeUser.uniqueIdentifier),
				}

				io.to(gameId).emit("game start", gameStartDto)
			})

			game.onMove(move => {
				const mover = players.find(player => player.participant == move.mover)

				if (!mover) throw new Error(`Could not locate mover ${move.mover}`)

				const moveDto: MoveDto = {
					placement: move.placement,
					mover: mover.activeUser.uniqueIdentifier,
				}

				io.to(gameId).emit("move", moveDto)
			})

			game.onWin(winningMoves => {
				const winningMovesDto: MoveDto[] = winningMoves.map(move => {
					const mover = players.find(player => player.participant == move.mover)

					if (!mover) throw new Error(`Could not locate mover ${move.mover}`)
					return {
						placement: move.placement,
						mover: mover.activeUser.uniqueIdentifier,
					}
				})

				const gameWinDto: GameWinDto = {
					winningMoves: winningMovesDto,
				}

				io.to(gameId).emit("game win", gameWinDto)
			})

			queue.clear()
			game.start()
		}
	})

	socket.on("disconnect", async () => {
		console.log("==== socket.io disconnect", socket.id, socket.handshake.auth.token)
		const activeUser = activeUsers.get(socket.handshake.auth.token)
		if (!activeUser) throw new Error("User not found")

		activeUser.connections.delete(socket)

		if (activeUser.connections.size === 0) {
			activeUsers.delete(activeUser.uniqueIdentifier)
			queue.delete(activeUser)
		}
	})
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

	const queueResponse: QueueResponse & { socketsDepth: number; test?: string } = {
		depth: queue.size,
		socketsDepth: sockets.length,
	}

	response.json(queueResponse)
})

app.get("/info", async (_, response) => {
	// return sockets and their active connections
	const connectionsPerUser = Array.from(activeUsers).map(([uniqueIdentifier, activeUser]) => ({
		uniqueIdentifier,
		connections: Array.from(activeUser.connections).map(connection => connection.id),
	}))

	response.json(connectionsPerUser)
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
	applicationInsights.trackException({ exception: error, properties: { origin } })
})

httpServer.on("listening", () => {
	applicationInsights.trackEvent({ name: "server start" })
})

httpServer.on("shutdown", () => {
	applicationInsights.trackEvent({ name: "server shutdown" })
})

process.on("beforeExit", async () => {
	applicationInsights.flush()
})

httpServer.listen(8080)
