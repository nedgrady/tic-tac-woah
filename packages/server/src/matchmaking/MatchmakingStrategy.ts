import { QueueItem } from "queue/addConnectionToQueue"
import { madeMatchRulesFactory } from "testingUtilities/factories"
import { ActiveUser } from "TicTacWoahSocketServer"

export interface MadeMatch {
	readonly participants: readonly Participant[]
	readonly rules: MadeMatchRules
}

export interface MadeMatchRules {
	readonly boardSize: number
	readonly consecutiveTarget: number
}

export type Participant = ActiveUser

export abstract class MatchmakingStrategy {
	abstract doTheThing(queueItems: readonly QueueItem[]): readonly MadeMatch[]
}

export class AlwaysMatchFirstTwoParticipants extends MatchmakingStrategy {
	doTheThing(queueItems: readonly QueueItem[]): readonly MadeMatch[] {
		if (queueItems.length < 2) return []

		const madeMatch: MadeMatch = {
			participants: [queueItems[0].queuer, queueItems[1].queuer],
			rules: {
				boardSize: 20,
				consecutiveTarget: 999,
			},
		}

		return [madeMatch]
	}
}

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
			},
		]
	}
}

export class MatchTwoGamesOfTwo extends MatchmakingStrategy {
	doTheThing(queueItems: readonly QueueItem[]): readonly MadeMatch[] {
		if (queueItems.length !== 4) return []

		return [
			{
				participants: [queueItems[0].queuer, queueItems[1].queuer],
				rules: madeMatchRulesFactory.build(),
			},
			{
				participants: [queueItems[2].queuer, queueItems[3].queuer],
				rules: madeMatchRulesFactory.build(),
			},
		]
	}
}

export function compatibleGroupKey(item: QueueItem) {
	return `${item.humanCount}-${item.consecutiveTarget}`
}
