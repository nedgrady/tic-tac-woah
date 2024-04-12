import "dotenv/config"
import express from "express"
import { createServer } from "http"
import cors from "cors"
import { Server } from "socket.io"
import path from "path"

import { instrument } from "@socket.io/admin-ui"
import { QueueResponse } from "types"
// import applicationInsights from "./logging/applicationInsights"
import { Participant } from "domain/Participant"
import {
	ActiveUser,
	TicTacWoahSocketServer,
	TicTacWoahSocketServerMiddleware,
	TicTacWoahUserHandle,
} from "TicTacWoahSocketServer"
import { identifySocketsByWebSocketId } from "auth/socketIdentificationStrategies"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { removeConnectionFromActiveUser } from "auth/socketIdentificationStrategies"
import { removeConnectionFromQueueOnDisconnect } from "queue/removeConnectionFromQueueOnDisconnect"
import _ from "lodash"
import { matchmaking } from "matchmaking/matchmaking"
import { startGameOnMatchMade } from "playing/startGameOnMatchMade"
import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { GameFactory } from "playing/GameFactory"
import { Game } from "domain/Game"
import { anyMoveIsAllowed } from "domain/gameRules/support/anyMoveIsAllowed"
import { gameIsWonOnMoveNumber } from "domain/winConditions/support/gameIsWonOnMoveNumber"
import { removeConnectionFromQueueWhenRequested } from "queue/removeConnectionFromQueueWhenRequested"
import { gameIsDrawnWhenBoardIsFull } from "domain/drawConditions/drawConditions"
import { singleParticipantInSequence } from "domain/moveOrderRules/singleParticipantInSequence"
// import _ from "lodash"

interface ParticipantHandle {
	readonly activeUser: ActiveUser
	readonly participant: Participant
}

const activeUsers: Map<string, ActiveUser> = new Map<string, ActiveUser>()

const app = express()
const httpServer = createServer(app)

const queue: Set<ActiveUser> = new Set<ActiveUser>()

const io: TicTacWoahSocketServer = new Server(httpServer, {
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

function errorHandler(handler: TicTacWoahSocketServerMiddleware): TicTacWoahSocketServerMiddleware {
	const handleError = (err: unknown) => {
		console.error("Unhandled Socket.IO error", err)
	}

	const wrappedHandler: TicTacWoahSocketServerMiddleware = async function (this: never, ...args) {
		try {
			await handler.apply(this, args)
			// No need to check for ret.catch because handler is always async
		} catch (e) {
			handleError(e)
		}
	}

	return wrappedHandler
}

io.use((socket, next) => {
	console.log("==== socket.io connection", socket.id)
	socket.on("error", error => {
		console.log("==== socket.io connect error", error)
	})
	socket.on("disconnect", () => {
		console.log("==== socket.io disconnect", socket.id)
	})
	next()
})

io.use((socket, next) => {
	socket.onAny((eventName, ...args) => {
		console.log(`${socket.id} emitted ${eventName}`, args)
	})
	next()
})
// io.use((socket, next) => {
// 	const authToken = socket.handshake.auth.token
// 	let user = activeUsers.get(authToken)

// 	console.log("==== socket.io auth", authToken)

// 	// If the user is not in the activeUsers map, add them
// 	if (!user) {
// 		user = { connections: new Set(), uniqueIdentifier: authToken }
// 		activeUsers.set(authToken, user)
// 	}
// 	user.connections.add(socket)
// 	next()
// })
const activeGames: Game[] = []

class StandardGameFactory extends GameFactory {
	createGame(participants: readonly Participant[]): Game {
		const newGame = new Game({
			participants,
			boardSize: 20,
			consecutiveTarget: 5,
			rules: [anyMoveIsAllowed],
			winConditions: [gameIsWonOnMoveNumber(3)],
			endConditions: [gameIsDrawnWhenBoardIsFull],
			decideWhoMayMoveNext: singleParticipantInSequence,
		})
		activeGames.push(newGame)
		return newGame
	}
}

const ttQueue = new TicTacWoahQueue()
const matchmakingBroker = new MatchmakingBroker()

io.use(identifySocketsByWebSocketId)
	.use(addConnectionToQueue(ttQueue))
	.use(removeConnectionFromQueueWhenRequested(ttQueue))
	.use(removeConnectionFromQueueOnDisconnect(ttQueue))
	.use(removeConnectionFromActiveUser)
	.use(matchmaking(ttQueue, matchmakingBroker))
	.use(startGameOnMatchMade(matchmakingBroker, new StandardGameFactory()))

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

app.get("/games", async (_, response) => {
	const games = activeGames.map(game => ({
		participants: game.participants,
	}))
	response.json(games)
})

app.get("/queue", async (_, response) => {
	const queueResponse: QueueResponse & { members?: TicTacWoahUserHandle[] } = {
		depth: ttQueue.users.length,
		members: ttQueue.users.map(user => user.uniqueIdentifier),
	}

	response.json(queueResponse)
})

app.get("/info", async (_request, response) => {
	const sockets = await io.fetchSockets()

	const socketInfo = {
		sockets: sockets.map(socket => ({
			id: socket.id,
			uniqueIdentifier: socket.handshake.auth.ticTacWoahUsername,
			rooms: socket.rooms,
		})),
	}

	response.json(socketInfo)
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

// process.on("uncaughtException", (error, origin) => {
// 	applicationInsights.trackException({ exception: error, properties: { origin } })
// })

// httpServer.on("listening", () => {
// 	applicationInsights.trackEvent({ name: "server start" })
// })

// httpServer.on("shutdown", () => {
// 	applicationInsights.trackEvent({ name: "server shutdown" })
// })

// process.on("beforeExit", async () => {
// 	applicationInsights.flush()
// })

httpServer.listen(8080)
