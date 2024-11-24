import { it, test, expect } from "vitest"
import { GenerativeModel } from "@google/generative-ai"
import { GeminiAiAgent } from "@tic-tac-woah/server"
import { CreateGameOptions } from "@tic-tac-woah/server/src/domain/Game"
import { anyParticipantMayMoveNext } from "@tic-tac-woah/server/src/domain/moveOrderRules/support/anyParticipantMayMoveNext"
import { Game } from "@tic-tac-woah/server/src/domain/Game"
import {
	moveMustBeMadeByTheCorrectPlayer,
	moveMustBeMadeIntoAFreeSquare,
} from "@tic-tac-woah/server/src/domain/gameRules/gameRules"
import {
	winByConsecutiveDiagonalPlacements,
	winByConsecutiveHorizontalPlacements,
	winByConsecutiveVerticalPlacements,
} from "@tic-tac-woah/server/src/domain/winConditions/winConditions"
import { makeMoves, PlacementSpecification } from "@tic-tac-woah/server/src/domain/gameTestHelpers"
import Coordinates from "@tic-tac-woah/server/src/domain/Coordinates"

const [p1, p2, p3, p4, p5] = ["X", "O", "A", "B", "C"]
const allParticipants = [p1, p2, p3, p4, p5]

it("Can successfully respond with a move", async () => {
	const model = new GenerativeModel(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY, {
		model: "tunedModels/tictacwoahhumandata1-r59fet8nx4cw",
	})

	const gameOptions: CreateGameOptions = {
		participants: ["X", "O"],
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

	const agentUnderTest = new GeminiAiAgent(model)

	await expect(agentUnderTest.nextMove(game, "X")).resolves.not.toThrowError()
})

interface GameWinTestCases {
	aiPlaysAs: string
	madeMoves: PlacementSpecification
	expectedWinningMove: Coordinates
}

const GameWinTestCases: GameWinTestCases[] = [
	{
		aiPlaysAs: p1,
		madeMoves: [
			[p1, p1, ""],
			[p2, p2, ""],
			["", "", ""],
		],
		expectedWinningMove: { x: 2, y: 0 },
	},
	{
		aiPlaysAs: p1,
		madeMoves: [
			[p2, p2, ""],
			[p1, p1, ""],
			["", "", ""],
		],
		expectedWinningMove: { x: 2, y: 1 },
	},
	{
		aiPlaysAs: p1,
		madeMoves: [
			[p1, p1, ""],
			[p2, p2, ""],
			["", "", ""],
		],
		expectedWinningMove: { x: 2, y: 0 },
	},
	{
		aiPlaysAs: p1,
		madeMoves: [
			[p1, p2, ""],
			[p2, p1, ""],
			["", "", ""],
		],
		expectedWinningMove: { x: 2, y: 2 },
	},
	{
		aiPlaysAs: p2,
		madeMoves: [
			[p1, p1, ""],
			[p2, p2, ""],
			["", "", ""],
		],
		expectedWinningMove: { x: 2, y: 1 },
	},
	{
		aiPlaysAs: p2,
		madeMoves: [
			[p1, p1, ""],
			[p2, p2, ""],
			["", "", ""],
		],
		expectedWinningMove: { x: 2, y: 1 },
	},
	{
		aiPlaysAs: p1,
		madeMoves: [
			[p1, p1, p2],
			[p2, p2, ""],
			[p1, p1, ""],
		],
		expectedWinningMove: { x: 2, y: 2 },
	},
	{
		aiPlaysAs: p1,
		madeMoves: [
			[p1, "", p1],
			[p2, p2, ""],
			[p1, p2, ""],
		],
		expectedWinningMove: { x: 1, y: 0 },
	},
]

test.each(GameWinTestCases)(
	`Wins the made moves are $madeMoves returns the winning move $expectedWinningMove`,
	async ({ aiPlaysAs, madeMoves, expectedWinningMove }) => {
		const model = new GenerativeModel(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY, {
			model: "tunedModels/tictacwoahhumandata1-r59fet8nx4cw",
		})

		const agentUnderTest = new GeminiAiAgent(model)

		const gameOptions: CreateGameOptions = {
			participants: allParticipants,
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

		makeMoves(game, madeMoves)

		console.log(game.moves())

		expect(await agentUnderTest.nextMove(game, aiPlaysAs)).toEqual({
			mover: aiPlaysAs,
			placement: expectedWinningMove,
		})
	},
)
