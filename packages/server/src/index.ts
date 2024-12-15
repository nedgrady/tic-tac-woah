export * from "./aiAgents/gemini/GeminiAiAgent"
export { CreateGameOptions, Game } from "./domain/Game"
export { anyParticipantMayMoveNext } from "./domain/moveOrderRules/support/anyParticipantMayMoveNext"
export { moveMustBeMadeIntoAFreeSquare } from "./domain/gameRules/gameRules"
export {
	winByConsecutiveDiagonalPlacements,
	winByConsecutiveVerticalPlacements,
} from "./domain/winConditions/winConditions"
export { makeMoves, PlacementSpecification } from "./domain/gameTestHelpers"
export { default as Coordinates } from "./domain/Coordinates"
export { RandomlyMovingAiParticipantFactory } from "./aiAgents/RandomlyMovingAiParticipantFactory"
export { AiParticipant } from "./aiAgents/AiParticipant"
