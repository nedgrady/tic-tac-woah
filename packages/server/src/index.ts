import express from "express"
import { createServer } from "http"
import cors from "cors"
import { Server, Socket } from "socket.io"
import path from "path"
import { Game } from "./Game"
import { Participant } from "./Participant"
import { instrument } from "@socket.io/admin-ui"
import { z } from "zod"
import { CoordinatesDtoSchema, MoveDto, MoveDtoSchema } from "types"
import { Move } from "./Move"

interface ParticipantHandle {
	readonly connection: Socket
	readonly participant: Participant
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

		const game = new Game(players.map(player => player.participant))

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

			io.to(gameId).emit("game start", { id: gameId })
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

io.of("/").adapter.on("create-room", room => {
	console.log(`room ${room} was created`)
})

io.of("/").adapter.on("join-room", (room, id) => {
	console.log(`socket ${id} has joined room ${room}`)
})

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

process.on("uncaughtException", (err, origin) => {
	//code to log the errors
	console.error(`Caught exception: ${err}\n` + `Exception origin: ${origin}`)
})

httpServer.listen(8080)

console.log("HERE")

// /**
//  * Bind @colyseus/monitor
//  * It is recommended to protect this route with a password.
//  * Read more: https://docs.colyseus.io/tools/monitor/
//  */
// app.use("/colyseus", monitor())

// const gameServer = new Server({
// 	transport: new WebSocketTransport({
// 		server: createServer(app),
// 	}),
// })

// gameServer.define("queue", QueueRoom)

// gameServer.listen(8080)
