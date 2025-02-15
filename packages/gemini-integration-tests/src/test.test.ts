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
import { RandomlyMovingAiParticipantFactory } from "@tic-tac-woah/server/src/aiAgents/RandomlyMovingAiParticipantFactory"
import { AiParticipant } from "@tic-tac-woah/server/src/aiAgents/AiParticipant"

const [p1, p2, p3, p4, p5] = ["X", "O", "A", "B", "C"]
const allParticipants = [p1, p2, p3, p4, p5]

it.skip("Can successfully respond with a move", async () => {
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

type AgentStrengthTestCaseResult = "Pass" | "Fail"

interface GameWinTestCase {
	aiPlaysAs: string
	madeMoves: PlacementSpecification
	expectedWinningMove: Coordinates
}

const GameWinTestCases: GameWinTestCase[] = [
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

test.skip.each(GameWinTestCases)(
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

// interface AgentStrengthBenchmarkResult {
// 	readonly agent: AiParticipant
// 	readonly goodMovesMade: number
// 	readonly badMovesMade: number
// }

class AgentStrengthBenchmark {
	constructor(
		private readonly _agentUnderTest: AiParticipant,
		private readonly _gameWinTestCases: GameWinTestCase[],
	) {}

	async run() {
		const results = this._gameWinTestCases.map(this.runSingle)
		return results
	}

	private async runSingle({
		aiPlaysAs,
		madeMoves,
		expectedWinningMove,
	}: GameWinTestCase): Promise<AgentStrengthTestCaseResult> {
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

		const madeMove = await this._agentUnderTest.nextMove(game, aiPlaysAs)

		if (madeMove.placement.x === expectedWinningMove.x && madeMove.placement.y === expectedWinningMove.y) {
			return "Pass"
		} else {
			return "Fail"
		}
	}
}

const agentsUnderTest = [
	new RandomlyMovingAiParticipantFactory().createAiAgent(),
	new GeminiAiAgent(
		new GenerativeModel(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY, {
			model: "tunedModels/tictacwoahhumandata1-r59fet8nx4cw",
		}),
	),
]

agentsUnderTest.forEach(agent => {
	const benchmark = new AgentStrengthBenchmark(agent, GameWinTestCases)
	const results = benchmark.run()
	console.log(results)
})
