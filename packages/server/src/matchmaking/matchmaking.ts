import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { QueueItem, TicTacWoahQueue } from "queue/addConnectionToQueue"
import { ActiveUser, TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"

abstract class MatchmakingStrategy {
	abstract doTheThing(queueItems: readonly QueueItem[]): readonly ActiveUser[]
}

export class AlwaysMatchTwoParticipants extends MatchmakingStrategy {
	doTheThing(queueItems: readonly QueueItem[]): readonly ActiveUser[] {
		if (queueItems.length !== 2) return []

		return queueItems.map(item => item.queuer)
	}
}

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
