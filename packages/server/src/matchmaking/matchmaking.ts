import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { TicTacWoahQueue } from "queue/addConnectionToQueue"
import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"
import { MatchmakingStrategy } from "./MatchmakingStrategy"

export function matchmaking(
	queue: TicTacWoahQueue,
	matchmakingBroker: MatchmakingBroker,
	matchmakingStrategy: MatchmakingStrategy
): TicTacWoahSocketServerMiddleware {
	queue.onAdded(queueItems => {
		const usersInMadeMatch = matchmakingStrategy.doTheThing(queueItems)
		if (usersInMadeMatch.length > 0) {
			queue.removeItems(queueItems)
			matchmakingBroker.notifyMatchMade(usersInMadeMatch)
		}
	})
	return (_, next) => {
		next()
	}
}
