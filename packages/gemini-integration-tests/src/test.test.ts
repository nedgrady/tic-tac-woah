import { it, expect } from "vitest"
import { GenerativeModel } from "@google/generative-ai"
import { GeminiAiAgent } from "@tic-tac-woah/server"
import { CreateGameOptions } from "@tic-tac-woah/server/src/domain/Game"
import { anyMoveIsAllowed } from "@tic-tac-woah/server/src/domain/gameRules/support/anyMoveIsAllowed"
import { anyParticipantMayMoveNext } from "@tic-tac-woah/server/src/domain/moveOrderRules/support/anyParticipantMayMoveNext"
import { Game } from "@tic-tac-woah/server/src/domain/Game"
import {
	moveMustBeMadeByTheCorrectPlayer,
	moveMustBeMadeIntoAFreeSquare,
} from "@tic-tac-woah/server/src/domain/gameRules/gameRules"
import {
	winByConsecutiveDiagonalPlacements,
	winByConsecutiveVerticalPlacements,
} from "@tic-tac-woah/server/src/domain/winConditions/winConditions"
import { makeMoves } from "@tic-tac-woah/server/src/domain/gameTestHelpers"

it("Can successfully respond with a move", async () => {
	const model = new GenerativeModel(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY, {
		model: "gemini-1.5-flash",
	})

	const agentUnderTest = new GeminiAiAgent(model)

	await expect(agentUnderTest.nextMove()).resolves.not.toThrowError()
})

it("Picks the final square 1", () => {
	const model = new GenerativeModel(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY, {
		model: "gemini-1.5-flash",
	})

	const agentUnderTest = new GeminiAiAgent(model)
	const x = agentUnderTest.id
	const o = "O"

	const gameOptions: CreateGameOptions = {
		participants: [x, "O"],
		rules: [moveMustBeMadeIntoAFreeSquare, moveMustBeMadeByTheCorrectPlayer],
		winConditions: [
			winByConsecutiveVerticalPlacements,
			winByConsecutiveDiagonalPlacements,
			winByConsecutiveDiagonalPlacements,
		],
		endConditions: [],
		decideWhoMayMoveNext: anyParticipantMayMoveNext,
		boardSize: 3,
		consecutiveTarget: 3,
	}

	const game = new Game(gameOptions)

	makeMoves(game, [
		[o, o, ""],
		[x, x, ""],
	])

	expect(agentUnderTest.nextMove(game)).resolves.toEqual({ mover: "TODO", placement: { x: 2, y: 1 } })
})

it("Picks the final square 2", () => {
	const model = new GenerativeModel(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY, {
		model: "gemini-1.5-flash",
	})

	const agentUnderTest = new GeminiAiAgent(model)
	const x = agentUnderTest.id
	const o = "O"

	const gameOptions: CreateGameOptions = {
		participants: [x, o],
		rules: [moveMustBeMadeIntoAFreeSquare],
		winConditions: [
			winByConsecutiveVerticalPlacements,
			winByConsecutiveDiagonalPlacements,
			winByConsecutiveDiagonalPlacements,
		],
		endConditions: [],
		decideWhoMayMoveNext: anyParticipantMayMoveNext,
		boardSize: 3,
		consecutiveTarget: 3,
	}

	const game = new Game(gameOptions)

	makeMoves(game, [
		[x, x, ""],
		[o, o, ""],
	])

	expect(agentUnderTest.nextMove(game)).resolves.toEqual({ mover: "TODO", placement: { x: 2, y: 0 } })
})
