import { TicTacWoahQueue } from "queue/addConnectionToQueue"
import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"

export function matchmaking(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	queue.onAdded(users => {
		if (users.length === 2) {
			const participants = users.map(user => user.uniqueIdentifier)

			const gameId = crypto.randomUUID()
			users.forEach(user => {
				user.connections.forEach(connection => {
					// TODO -
					connection.join(gameId)

					connection.emit("gameStart", { id: gameId, players: participants })
				})
			})

			console.log("Match made.")
			queue.remove(users[0])
			queue.remove(users[1])
		}
	})
	return (connection, next) => {
		connection.on("makeMove", (moveDto, callback) => {
			// TODO - ensure game exists
			// TODO - ensure player is a participant of the supplied game
			connection.to(moveDto.gameId).emit("moveMade", moveDto)
			connection.emit("moveMade", moveDto)
			callback && callback(0)
		})
		next()
	}
}
