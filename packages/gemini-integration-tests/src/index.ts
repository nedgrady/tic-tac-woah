import {
	CreateGameOptions,
	anyParticipantMayMoveNext,
	Game,
	moveMustBeMadeIntoAFreeSquare,
	winByConsecutiveDiagonalPlacements,
	winByConsecutiveVerticalPlacements,
	makeMoves,
	PlacementSpecification,
	Coordinates,
	AiParticipant,
} from "@tic-tac-woah/server"
import { HandCraftedAgent } from "@tic-tac-woah/server/src/aiAgents/handCrafted/HandCraftedAgent"
import { GameConfiguration } from "@tic-tac-woah/server/src/domain/gameRules/gameRules"
import { singleParticipantInSequence } from "@tic-tac-woah/server/src/domain/moveOrderRules/singleParticipantInSequence"

const [p1, p2, p3, p4, p5] = ["X", "O", "A", "B", "C"]
const twoParticipants = [p1, p2]
const allParticipants = [p1, p2, p3, p4, p5]

type AgentStrengthTestCaseResult = "Pass" | "Fail"

interface GameWinTestCase {
	aiPlaysAs: string
	madeMoves: PlacementSpecification
	participants: string[]
	gameConfiguration: GameConfiguration
	expectedWinningMove: Coordinates
}

const Depth1GameWinTestCases: GameWinTestCase[] = [
	{
		aiPlaysAs: p1,
		participants: twoParticipants,
		gameConfiguration: { consecutiveTarget: 3, boardSize: 3 },
		madeMoves: [
			[p1, p1, ""],
			[p2, p2, ""],
			["", "", ""],
		],
		expectedWinningMove: { x: 2, y: 0 },
	},
	{
		aiPlaysAs: p1,
		participants: twoParticipants,
		gameConfiguration: { consecutiveTarget: 3, boardSize: 3 },
		madeMoves: [
			[p2, p2, ""],
			[p1, p1, ""],
			["", "", ""],
		],
		expectedWinningMove: { x: 2, y: 1 },
	},
	{
		aiPlaysAs: p1,
		participants: twoParticipants,
		gameConfiguration: { consecutiveTarget: 3, boardSize: 3 },
		madeMoves: [
			[p1, p1, ""],
			[p2, p2, ""],
			["", "", ""],
		],
		expectedWinningMove: { x: 2, y: 0 },
	},
	{
		aiPlaysAs: p1,
		participants: twoParticipants,
		gameConfiguration: { consecutiveTarget: 3, boardSize: 3 },
		madeMoves: [
			[p1, p2, ""],
			[p2, p1, ""],
			["", "", ""],
		],
		expectedWinningMove: { x: 2, y: 2 },
	},
	{
		aiPlaysAs: p2,
		participants: twoParticipants,
		gameConfiguration: { consecutiveTarget: 3, boardSize: 3 },
		madeMoves: [
			[p1, p1, ""],
			[p2, p2, ""],
			["", "", ""],
		],
		expectedWinningMove: { x: 2, y: 1 },
	},
	{
		aiPlaysAs: p2,
		participants: twoParticipants,
		gameConfiguration: { consecutiveTarget: 3, boardSize: 3 },
		madeMoves: [
			[p1, p1, ""],
			[p2, p2, ""],
			["", "", ""],
		],
		expectedWinningMove: { x: 2, y: 1 },
	},
	{
		aiPlaysAs: p1,
		participants: twoParticipants,
		gameConfiguration: { consecutiveTarget: 3, boardSize: 3 },
		madeMoves: [
			[p1, p1, p2],
			[p2, p2, ""],
			[p1, p1, ""],
		],
		expectedWinningMove: { x: 2, y: 2 },
	},
	{
		aiPlaysAs: p1,
		participants: twoParticipants,
		gameConfiguration: { consecutiveTarget: 3, boardSize: 3 },
		madeMoves: [
			[p1, "", p1],
			[p2, p2, ""],
			[p1, p2, ""],
		],
		expectedWinningMove: { x: 1, y: 0 },
	},
]

const Depth2GameWinTestCases: GameWinTestCase[] = [
	{
		aiPlaysAs: p1,
		participants: twoParticipants,
		gameConfiguration: { consecutiveTarget: 3, boardSize: 3 },
		madeMoves: [
			[p2, "", ""],
			["", p1, ""],
			["", p2, p1],
		],
		expectedWinningMove: { x: 3, y: 1 },
	},
	{
		aiPlaysAs: p1,
		participants: twoParticipants,
		gameConfiguration: { consecutiveTarget: 3, boardSize: 3 },
		madeMoves: [
			[p2, "", ""],
			["", p1, ""],
			[p1, p2, ""],
		],
		expectedWinningMove: { x: 3, y: 1 },
	},
	{
		aiPlaysAs: p1,
		participants: twoParticipants,
		gameConfiguration: { consecutiveTarget: 4, boardSize: 4 },
		madeMoves: [
			["", p1, "", ""],
			[p1, "", p1, ""],
			["", p1, "", p2],
			["", "", p2, p2],
		],
		expectedWinningMove: { x: 1, y: 1 },
	},
]

class AgentStrengthBenchmark {
	constructor(
		private readonly _agentUnderTest: AiParticipant,
		private readonly _gameWinTestCases: GameWinTestCase[],
	) {}

	async run() {
		const runs = this._gameWinTestCases.map(this.runSingle.bind(this))
		return Promise.all(runs)
	}

	private async runSingle({
		aiPlaysAs,
		madeMoves,
		expectedWinningMove,
		gameConfiguration,
	}: GameWinTestCase): Promise<AgentStrengthTestCaseResult> {
		let setupComplete = false

		const gameOptions: CreateGameOptions = {
			participants: allParticipants,
			rules: [moveMustBeMadeIntoAFreeSquare],
			winConditions: [
				winByConsecutiveVerticalPlacements,
				winByConsecutiveDiagonalPlacements,
				winByConsecutiveDiagonalPlacements,
			],
			endConditions: [],
			decideWhoMayMoveNext: gameState =>
				// Allow any move order when we setup to avoid having to as the moves
				// are made in coordinate order, rather than respecting player order during setup
				setupComplete ? singleParticipantInSequence(gameState) : anyParticipantMayMoveNext(gameState),
			boardSize: gameConfiguration.boardSize,
			consecutiveTarget: gameConfiguration.consecutiveTarget,
		}
		const game = new Game(gameOptions)
		makeMoves(game, madeMoves)

		setupComplete = true

		const madeMove = await this._agentUnderTest.nextMove(game, aiPlaysAs)

		if (madeMove.placement.x === expectedWinningMove.x && madeMove.placement.y === expectedWinningMove.y) {
			return "Pass"
		} else {
			return "Fail"
		}
	}
}

const agentsUnderTest = [
	// new RandomlyMovingAiParticipantFactory().createAiAgent(),
	// new GeminiAiAgent(
	// 	new GenerativeModel(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY, {
	// 		model: "tunedModels/tictacwoahhumandata1-r59fet8nx4cw",
	// 	}),
	// ),
	new HandCraftedAgent(),
]

async function runBenchmarks() {
	const benchmarkPromises = agentsUnderTest.map(async agent => {
		const benchmark = new AgentStrengthBenchmark(agent, Depth1GameWinTestCases)
		const results = await benchmark.run()
		console.log("Results for agent:", agent.name)
		console.log("Passes:", results.filter(r => r === "Pass").length)
		console.log("Fails:", results.filter(r => r === "Fail").length)
		return results
	})

	const allResults = await Promise.all(benchmarkPromises)
	return allResults
}

runBenchmarks()
	// .then(allResults => {
	// 	console.log("All benchmark results:", allResults)
	// })
	.catch(error => {
		console.error("Error running benchmarks:", error)
	})
