import { TicTacWoahQueue } from "queue/addConnectionToQueue"
import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"

export function matchmaking(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	queue.onAdded(users => {
		if (users.length === 2) {
			const participants = users.map(user => user.uniqueIdentifier)
			const gameId = crypto.randomUUID()
			users.forEach(user => {
				user.connections.forEach(connection => {
					connection.join(gameId)
					connection.on("makeMove", (moveDto, callback) => {
						connection.to(gameId).emit("moveMade", moveDto)
						connection.emit("moveMade", moveDto)
						callback && callback(0)
					})
					connection.emit("gameStart", { id: "TODO", players: participants })
				})
			})

			console.log("Match made.")
			queue.remove(users[0])
			queue.remove(users[1])
		}
	})
	return (_, next) => {
		next()
	}
}
