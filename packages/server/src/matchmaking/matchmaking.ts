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
		const madeMatches = matchmakingStrategy.doTheThing(queueItems)

		if (madeMatches.length > 0) {
			queue.removeItems(queueItems)

			// TODO - handle multiple matches
			matchmakingBroker.notifyMatchMade(madeMatches[0])
		}
	})
	return (_, next) => {
		next()
	}
}
