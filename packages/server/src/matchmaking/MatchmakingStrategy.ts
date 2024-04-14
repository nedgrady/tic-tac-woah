import { QueueItem } from "queue/addConnectionToQueue"
import { ActiveUser } from "TicTacWoahSocketServer"

export abstract class MatchmakingStrategy {
	abstract doTheThing(queueItems: readonly QueueItem[]): readonly ActiveUser[]
}
export class AlwaysMatchTwoParticipants extends MatchmakingStrategy {
	doTheThing(queueItems: readonly QueueItem[]): readonly ActiveUser[] {
		if (queueItems.length !== 2) return []

		return queueItems.map(item => item.queuer)
	}
}
