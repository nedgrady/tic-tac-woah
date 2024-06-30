import { MadeMatch, MatchmakingStrategy } from "./MatchmakingStrategy"
import { QueueItem } from "queue/addConnectionToQueue"
import _ from "lodash"

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

export type QueueItemCompatibilityFunction = (item: QueueItem) => string

export class StandardMathcmakingStrategy extends MatchmakingStrategy {
	constructor(private queueItemCompatibilityFunction: QueueItemCompatibilityFunction) {
		super()
	}

	doTheThing(queueItems: readonly QueueItem[]): readonly MadeMatch[] {
		const madeMatches: MadeMatch[] = []
		const compatibleChunks = groupBy(queueItems, this.queueItemCompatibilityFunction)

		for (const chunk of compatibleChunks.values()) {
			const chunksWithSufficientParticipants = _.chunk(chunk, chunk[0].humanCount).filter(
				potentialMatch => potentialMatch.length === chunk[0].humanCount,
			)
			for (const chunk of chunksWithSufficientParticipants) {
				madeMatches.push({
					participants: chunk.map(item => item.queuer),
					aiParticipants: [],
					rules: {
						boardSize: 20,
						consecutiveTarget: chunk[0].consecutiveTarget,
					},
				})
			}
		}

		return madeMatches
	}
}
