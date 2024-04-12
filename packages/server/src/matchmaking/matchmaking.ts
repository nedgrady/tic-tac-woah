import _ from "lodash"
import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { QueueEntry, TicTacWoahQueue } from "queue/addConnectionToQueue"
import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"

interface CompatibleMatchBucket {
	humanCount: number
	// botCount: number
	// boardSize: number
	// consecutiveTarget: number
}

function groupBy<TKey, TValue>(list: readonly TValue[], keyGetter: (item: TValue) => TKey) {
	const map = new Map<TKey, TValue[]>()
	list.forEach(item => {
		const key = keyGetter(item)
		const collection = map.get(key)
		if (!collection) {
			map.set(key, [item])
		} else {
			collection.push(item)
		}
	})
	return map
}

export function matchmaking(
	queue: TicTacWoahQueue,
	matchmakingBroker: MatchmakingBroker
): TicTacWoahSocketServerMiddleware {
	queue.onAdded(queueState => {
		if (queueState.length < 3) return

		const compatibleGameBuckets = groupBy(queueState, q => q.humanCount)

		console.log("compatibleGameBuckets", compatibleGameBuckets.entries())

		for (const [humanCount, queueEntries] of compatibleGameBuckets.entries()) {
			// if we don't have enough people for a game of a given size skip it
			if (queueEntries.length < humanCount) continue

			console.log("queueEntries", queueEntries)

			const chunksWithSufficientHumans = _.chunk<QueueEntry>(queueEntries, humanCount).filter(
				chunk => chunk.length === humanCount
			)

			console.log("queueEntries", chunksWithSufficientHumans)

			for (const singleGameChunk of chunksWithSufficientHumans) {
				for (const queueEntry of singleGameChunk) {
					queue.dequeueEntry(queueEntry)
				}

				const users = singleGameChunk.map(q => q.queuer)
				matchmakingBroker.notifyMatchMade(users)
			}
		}

		// if (queueState.length === 2) {
		// 	const users = queueState.map(q => q.queuer)
		// 	queue.dequeueEntry(queueState[0])
		// 	queue.dequeueEntry(queueState[1])

		// 	matchmakingBroker.notifyMatchMade(users)
		// }
	})
	return (_, next) => {
		next()
	}
}
