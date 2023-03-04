import Arena from "@colyseus/arena"
import { monitor } from "@colyseus/monitor"
import cors, { CorsOptions } from "cors"
import { NextFunction, Request, Response } from "express"

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom"

export default Arena({
	getId: () => "Your Colyseus App",

	initializeGameServer: gameServer => {
		/**
		 * Define your room handlers:
		 */
		gameServer.define("room_name", MyRoom)
	},

	initializeExpress: app => {},

	beforeListen: () => {
		/**
		 * Before before gameServer.listen() is called.
		 */
	},
})
