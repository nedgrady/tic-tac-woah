export * from "./aiAgents/gemini/GeminiAiAgent"
export { type CreateGameOptions, type Game } from "./domain/Game"
export { anyParticipantMayMoveNext } from "./domain/moveOrderRules/support/anyParticipantMayMoveNext"
export { moveMustBeMadeIntoAFreeSquare } from "./domain/gameRules/gameRules"
export {
	winByConsecutiveDiagonalPlacements,
	winByConsecutiveVerticalPlacements,
} from "./domain/winConditions/winConditions"
export { makeMoves, type PlacementSpecification } from "./domain/gameTestHelpers"
export { type default as Coordinates } from "./domain/Coordinates"
export { RandomlyMovingAiParticipantFactory } from "./aiAgents/RandomlyMovingAiParticipantFactory"
export { AiParticipant } from "./aiAgents/AiParticipant"
