import express from "express"
import { createServer } from "http"
import cors from "cors"
import { Server, Socket } from "socket.io"
import path from "path"
import { QueueResponse } from "types"

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
})

io.on("connection", socket => {
	socket.join("queue")
})

app.use(cors())

if (process.env.NODE_ENV === "production") {
	console.log("==== serving /tic-tac-woah", process.env.PATH_TO_CLIENT_BUILT_FOLDER)
	app.use("/tic-tac-woah", express.static(process.env.PATH_TO_CLIENT_BUILT_FOLDER))

	app.get("/tic-tac-woah*", (_, response) =>
		response.sendFile(path.join(process.env.PATH_TO_CLIENT_BUILT_FOLDER, "index.html"))
	)
}

app.get("/version", (_, response) => {
	response.send(process.env.RENDER_GIT_COMMIT)
})

app.get("/queue", async (_, response) => {
	const sockets = await io.in("queue").fetchSockets()
	response.json({
		depth: sockets.length,
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

httpServer.listen(8080)

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
