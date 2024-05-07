import { QueueItem } from "queue/addConnectionToQueue"
import { MatchmakingStrategy, MadeMatch } from "../MatchmakingStrategy"

export class AlwaysMatchFirstTwoParticipants extends MatchmakingStrategy {
	doTheThing(queueItems: readonly QueueItem[]): readonly MadeMatch[] {
		if (queueItems.length < 2) return []

		const madeMatch: MadeMatch = {
			participants: [queueItems[0].queuer, queueItems[1].queuer],
			aiCount: 0,
			rules: {
				boardSize: 20,
				consecutiveTarget: 999,
			},
		}

		return [madeMatch]
	}
}
