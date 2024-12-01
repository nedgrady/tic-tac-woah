import { GameState } from "../../gameRules/gameRules"
import { DecideWhoMayMoveNext } from "../moveOrderRules"

export const anyParticipantMayMoveNext: DecideWhoMayMoveNext = (gameState: GameState) => gameState.participants
