import { GameState } from "domain/gameRules/gameRules"

import { Participant } from "domain/Participant"

export type DecideWhoMayMoveNext = (gameState: GameState) => Participant[]
