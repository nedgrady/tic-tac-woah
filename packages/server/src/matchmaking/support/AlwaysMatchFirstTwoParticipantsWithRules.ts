import { QueueItem } from "queue/addConnectionToQueue"
import { MatchmakingStrategy, MadeMatchRules, MadeMatch } from "../MatchmakingStrategy"

export class AlwaysMatchFirstTwoParticipantsWithRules extends MatchmakingStrategy {
	constructor(private rules: MadeMatchRules) {
		super()
	}
	doTheThing(queueItems: readonly QueueItem[]): readonly MadeMatch[] {
		if (queueItems.length < 2) return []

		return [
			{
				participants: [queueItems[0].queuer, queueItems[1].queuer],
				rules: this.rules,
				aiParticipants: [],
			},
		]
	}
}
