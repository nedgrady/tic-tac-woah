import { DecideWhoMayMoveNext } from "./moveOrderRules"

export const singleParticipantInSequence: DecideWhoMayMoveNext = gameState => {
	return [gameState.participants[gameState.moves.length % gameState.participants.length]]
}
