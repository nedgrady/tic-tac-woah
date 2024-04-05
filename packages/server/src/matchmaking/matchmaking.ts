import { MatchmakingBroker } from "MatchmakingBroker"
import { TicTacWoahQueue } from "queue/addConnectionToQueue"
import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"

export function matchmaking(
	queue: TicTacWoahQueue,
	matchmakingBroker: MatchmakingBroker
): TicTacWoahSocketServerMiddleware {
	queue.onAdded(users => {
		if (users.length === 1) {
			queue.remove(users[0])
			// queue.remove(users[1])

			matchmakingBroker.notifyMatchMade(users, 2)
		}
	})
	return (_, next) => {
		next()
	}
}
