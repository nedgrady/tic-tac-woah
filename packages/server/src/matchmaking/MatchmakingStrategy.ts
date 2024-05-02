import { QueueItem } from "queue/addConnectionToQueue"
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

export class AlwaysMatchTwoParticipants extends MatchmakingStrategy {
	doTheThing(queueItems: readonly QueueItem[]): readonly MadeMatch[] {
		if (queueItems.length !== 2) return []

		const madeMatch: MadeMatch = {
			participants: queueItems.map(item => item.queuer),
			rules: {
				boardSize: 20,
				consecutiveTarget: 999,
			},
		}

		return [madeMatch]
	}
}

export class AlwaysMatchTwoParticipantsWithRules extends MatchmakingStrategy {
	constructor(private rules: MadeMatchRules) {
		super()
	}
	doTheThing(queueItems: readonly QueueItem[]): readonly MadeMatch[] {
		if (queueItems.length !== 2) return []

		return [
			{
				participants: queueItems.map(item => item.queuer),
				rules: this.rules,
			},
		]
	}
}

export function compatibleGroupKey(item: QueueItem) {
	return `${item.humanCount}-${item.consecutiveTarget}`
}
