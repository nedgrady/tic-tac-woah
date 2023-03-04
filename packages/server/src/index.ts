import { WebSocketTransport } from "@colyseus/ws-transport"
import express, { NextFunction } from "express"
import { listen } from "@colyseus/arena"
import { createServer } from "http"
// Import arena config
import arenaConfig from "./arena.config"
import cors, { CorsOptions } from "cors"
import { monitor } from "@colyseus/monitor"
import { MyRoom } from "./rooms/MyRoom"
import { Server } from "colyseus"
import path from "path"

const app = express()

app.use(cors())

if (process.env.NODE_ENV === "production") {
	console.log("==== serving /tic-tac-woah", process.env.PATH_TO_CLIENT_BUILT_FOLDER)
	app.use("/tic-tac-woah", (_, response) => response.send("tic-tac-woah"))
	// app.use("/tic-tac-woah", express.static(process.env.PATH_TO_CLIENT_BUILT_FOLDER))

	// app.get("/tic-tac-woah*", (_, response) =>
	// 	response.sendFile(path.join(process.env.PATH_TO_CLIENT_BUILT_FOLDER, "index.html"))
	// )
}

/**
 * Bind your custom express routes here:
 */
app.get("/", (req, res) => {
	res.send("It's time to kick ass and chew bubblegum!")
})

/**
 * Bind @colyseus/monitor
 * It is recommended to protect this route with a password.
 * Read more: https://docs.colyseus.io/tools/monitor/
 */
app.use("/colyseus", monitor())

const gameServer = new Server({
	transport: new WebSocketTransport({
		server: createServer(app),
	}),
})

gameServer.define("room_name", MyRoom)

/**
 * IMPORTANT:
 * ---------
 * Do not manually edit this file if you'd like to use Colyseus Arena
 *
 * If you're self-hosting (without Arena), you can manually instantiate a
 * Colyseus Server as documented here: 👉 https://docs.colyseus.io/server/api/#constructor-options
 */

// Create and listen on 2567 (or PORT environment variable.)
gameServer.listen(8080)
