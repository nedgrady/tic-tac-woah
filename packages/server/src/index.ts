import { WebSocketTransport } from "@colyseus/ws-transport"
import express, { NextFunction } from "express"
import { listen } from "@colyseus/arena"
import { createServer } from "http"
// Import arena config
import arenaConfig from "./arena.config"
import cors from "cors"
import { monitor } from "@colyseus/monitor"
import { MyRoom } from "./rooms/MyRoom"
import WebSocket, { Server } from "ws"

const wss = new Server({
	port: 8080,
	perMessageDeflate: {
		zlibDeflateOptions: {
			// See zlib defaults.
			chunkSize: 1024,
			memLevel: 7,
			level: 3,
		},
		zlibInflateOptions: {
			chunkSize: 10 * 1024,
		},
		// Other options settable:
		clientNoContextTakeover: true, // Defaults to negotiated value.
		serverNoContextTakeover: true, // Defaults to negotiated value.
		serverMaxWindowBits: 10, // Defaults to negotiated value.
		// Below options specified as default values.
		concurrencyLimit: 10, // Limits zlib concurrency for perf.
		threshold: 1024, // Size (in bytes) below which messages
		// should not be compressed if context takeover is disabled.
	},
})

wss.on("connection", ws => {
	ws.on("error", console.error)

	ws.on("message", function message(data) {
		console.log("received: %s", data)
	})

	ws.send("something")
})

// const app = express()

// app.options("/*", cors())
// app.use(cors())
// /**
//  * Bind your custom express routes here:
//  */
// app.get("/", (req, res) => {
// 	res.send("It's time to kick ass and chew bubblegum!")
// })

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

// gameServer.define("room_name", MyRoom)

// /**
//  * IMPORTANT:
//  * ---------
//  * Do not manually edit this file if you'd like to use Colyseus Arena
//  *
//  * If you're self-hosting (without Arena), you can manually instantiate a
//  * Colyseus Server as documented here: 👉 https://docs.colyseus.io/server/api/#constructor-options
//  */

// // Create and listen on 2567 (or PORT environment variable.)
// gameServer.listen(8080)
