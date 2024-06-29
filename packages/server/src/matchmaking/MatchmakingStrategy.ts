import { Move } from "domain/Move"
import { QueueItem } from "queue/addConnectionToQueue"
import { ActiveUser } from "TicTacWoahSocketServer"

export abstract class AiParticipant {
	abstract nextMove(): Move
}

export interface MadeMatch {
	readonly participants: readonly Participant[]
	readonly aiCount: number
	readonly aiParticipants?: readonly AiParticipant[]
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
