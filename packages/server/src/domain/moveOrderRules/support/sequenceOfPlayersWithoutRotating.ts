import { Participant } from "../../Participant"
import { DecideWhoMayMoveNext } from "../moveOrderRules"

export const sequenceOfPlayersWithoutRotating =
	(...participants: Participant[]): DecideWhoMayMoveNext =>
	gameState => [participants[gameState.moves.length]]
