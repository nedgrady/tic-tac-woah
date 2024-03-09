import { MatchmakingBroker } from "MatchmakingBroker"
import { TicTacWoahQueue } from "queue/addConnectionToQueue"
import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"

export function matchmaking(
	queue: TicTacWoahQueue,
	matchmakingBroker: MatchmakingBroker
): TicTacWoahSocketServerMiddleware {
	queue.onAdded(users => {
		if (users.length === 2) {
			queue.remove(users[0])
			queue.remove(users[1])

			matchmakingBroker.notifyMatchMade(users)
		}
	})
	return (_, next) => {
		next()
	}
}

export function startGameOnMatchMade(matchmakingBroker: MatchmakingBroker): TicTacWoahSocketServerMiddleware {
	matchmakingBroker.onMatchMade(users => {
		const participants = users.map(user => user.uniqueIdentifier)

		const gameId = crypto.randomUUID()
		users.forEach(user => {
			user.connections.forEach(connection => {
				connection.join(gameId)
				connection.emit("gameStart", { id: gameId, players: participants })
			})
		})
	})

	return (connection, next) => {
		console.log("startGameOnMatchMade")
		connection.on("makeMove", (moveDto, callback) => {
			console.log("makeMove")
			// TODO - ensure game exists
			// TODO - ensure player is a participant of the supplied game
			connection.to(moveDto.gameId).emit("moveMade", moveDto)
			connection.emit("moveMade", moveDto)
			callback && callback(0)
		})
		next()
	}
}
