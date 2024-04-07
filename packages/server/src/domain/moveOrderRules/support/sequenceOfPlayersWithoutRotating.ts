import { Participant } from "domain/Participant"
import { DecideWhoMayMoveNext } from "domain/moveOrderRules/moveOrderRules"

export const sequenceOfPlayersWithoutRotating =
	(...participants: Participant[]): DecideWhoMayMoveNext =>
	gameState =>
		[participants[gameState.moves.length]]
