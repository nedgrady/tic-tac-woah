import { TicTacWoahQueue } from "../queue/addConnectionToQueue"
import { TicTacWoahSocketServerMiddleware } from "../TicTacWoahSocketServer"
import { MatchmakingBroker } from "./MatchmakingBroker"
import { MatchmakingStrategy } from "./MatchmakingStrategy"

export function matchmaking(
	queue: TicTacWoahQueue,
	matchmakingBroker: MatchmakingBroker,
	matchmakingStrategy: MatchmakingStrategy,
): TicTacWoahSocketServerMiddleware {
	queue.onAdded(queueItems => {
		const madeMatches = matchmakingStrategy.doTheThing(queueItems)

		for (const madeMatch of madeMatches) {
			for (const participant of madeMatch.participants) {
				queue.remove(participant)
			}
			matchmakingBroker.notifyMatchMade(madeMatch)
		}
	})
	return (_, next) => {
		next()
	}
}
