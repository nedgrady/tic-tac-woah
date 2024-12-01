import { GameState } from "../gameRules/gameRules"
import { Participant } from "../Participant"

export type DecideWhoMayMoveNext = (gameState: GameState) => readonly Participant[]
