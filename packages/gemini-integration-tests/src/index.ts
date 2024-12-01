import { GenerativeModel } from "@google/generative-ai"
import {
	GeminiAiAgent,
	CreateGameOptions,
	anyParticipantMayMoveNext,
	Game,
	moveMustBeMadeIntoAFreeSquare,
	winByConsecutiveDiagonalPlacements,
	winByConsecutiveVerticalPlacements,
	makeMoves,
	PlacementSpecification,
	Coordinates,
	RandomlyMovingAiParticipantFactory,
	AiParticipant,
} from "@tic-tac-woah/server"

const [p1, p2, p3, p4, p5] = ["X", "O", "A", "B", "C"]
const allParticipants = [p1, p2, p3, p4, p5]

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
class AgentStrengthBenchmark {
	constructor(
		private readonly _agentUnderTest: AiParticipant,
		private readonly _gameWinTestCases: GameWinTestCase[],
	) {}

	async run() {
		const results = this._gameWinTestCases.map(this.runSingle.bind(this))
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
	// new GeminiAiAgent(
	// 	new GenerativeModel(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY, {
	// 		model: "tunedModels/tictacwoahhumandata1-r59fet8nx4cw",
	// 	}),
	// ),
]

agentsUnderTest.forEach(agent => {
	const benchmark = new AgentStrengthBenchmark(agent, GameWinTestCases)
	const results = benchmark.run()
	console.log(results)
})
