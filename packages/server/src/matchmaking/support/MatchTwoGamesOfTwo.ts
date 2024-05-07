import { QueueItem } from "queue/addConnectionToQueue"
import { madeMatchRulesFactory } from "testingUtilities/factories"
import { MatchmakingStrategy, MadeMatch } from "../MatchmakingStrategy"

export class MatchTwoGamesOfTwo extends MatchmakingStrategy {
	doTheThing(queueItems: readonly QueueItem[]): readonly MadeMatch[] {
		if (queueItems.length !== 4) return []

		return [
			{
				participants: [queueItems[0].queuer, queueItems[1].queuer],
				rules: madeMatchRulesFactory.build(),
				aiCount: 0,
			},
			{
				participants: [queueItems[2].queuer, queueItems[3].queuer],
				rules: madeMatchRulesFactory.build(),
				aiCount: 0,
			},
		]
	}
}
