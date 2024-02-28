import { TicTacWoahQueue } from "queue/addConnectionToQueue"
import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"

export function matchmaking(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	queue.onAdded(users => {
		if (users.length === 2) {
			const participants = users.map(user => user.uniqueIdentifier)
			users.forEach(user => {
				user.connections.forEach(connection => {
					connection.emit("gameStart", { id: "TODO", players: participants })
				})
			})

			console.log("Match made.")
			queue.remove(users[0])
			queue.remove(users[1])
		}
	})
	return (socket, next) => {
		socket.join("game")
		socket.on("makeMove", (moveDto, callback) => {
			socket.to("game").emit("moveMade", moveDto)
			socket.emit("moveMade", moveDto)
			callback && callback(0)
		})
		next()
	}
}
