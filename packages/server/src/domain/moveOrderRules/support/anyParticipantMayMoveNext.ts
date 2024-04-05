import { DecideWhoMayMoveNext } from "domain/moveOrderRules/moveOrderRules"
import { GameState } from "../../gameRules/gameRules"

export const anyParticipantMayMoveNext: DecideWhoMayMoveNext = (gameState: GameState) => [...gameState.participants]
