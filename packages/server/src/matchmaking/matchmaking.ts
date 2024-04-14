import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { TicTacWoahQueue } from "queue/addConnectionToQueue"
import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"

export function matchmaking(
	queue: TicTacWoahQueue,
	matchmakingBroker: MatchmakingBroker
): TicTacWoahSocketServerMiddleware {
	queue.onAdded(queueItems => {
		const users = queueItems.map(item => item.queuer)
		if (queueItems.length === 2) {
			queue.remove(users[0])
			queue.remove(users[1])

			matchmakingBroker.notifyMatchMade(users)
		}
	})
	return (_, next) => {
		next()
	}
}
