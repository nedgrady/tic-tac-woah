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
import _ from "lodash"
import { Move } from "../../client/src/redux/gameSlice"

const [p1, p2, p3, p4, p5] = ["X", "O", "A", "B", "C"]
const twoParticipants = [p1, p2]
const allParticipants = [p1, p2, p3, p4, p5]

class AgentStrengthTestCaseResult {
	constructor(
		private readonly gameWinTestCase: GameWinTestCase,
		private readonly receivedMove: Move,
		private readonly agentUnderTest: AiParticipant,
	) {}

	status(): "Pass" | "Fail" {
		if (
			this.gameWinTestCase.expectedWinningMove.x === this.receivedMove.placement.x &&
			this.gameWinTestCase.expectedWinningMove.y === this.receivedMove.placement.y
		) {
			return "Pass"
		} else {
			return "Fail"
		}
	}

	prettyPrint() {
		return `
		Ai Agent: ${this.agentUnderTest.name}
		Index: ${this.gameWinTestCase.index}
		Description: ${this.gameWinTestCase.description}
		Status: ${this.status()}
		Expected: ${JSON.stringify(this.gameWinTestCase.expectedWinningMove)}
		Received: ${JSON.stringify(this.receivedMove.placement)}

		${this.gameWinTestCase}
		`
	}
}

interface GameWinTestCase {
	aiPlaysAs: string
	madeMoves: PlacementSpecification
	participants: string[]
	gameConfiguration: GameConfiguration
	expectedWinningMove: Coordinates
	index?: number
	description?: string
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
			["", "", p1],
		],
		expectedWinningMove: { x: 2, y: 1 },
		description: "D1 3x3 p2 to win horizontally",
	},
	{
		aiPlaysAs: p2,
		participants: twoParticipants,
		gameConfiguration: { consecutiveTarget: 3, boardSize: 3 },
		madeMoves: [
			[p2, p1, ""],
			[p1, p2, ""],
			["", p1, ""],
		],
		expectedWinningMove: { x: 2, y: 2 },
		description: "D1 3x3 p2 to win diagonally",
	},
	{
		aiPlaysAs: p2,
		participants: twoParticipants,
		gameConfiguration: { consecutiveTarget: 4, boardSize: 4 },
		madeMoves: [
			[p1, p1, p2, ""],
			[p2, p2, "", p2],
			[p1, p1, "", ""],
			["", p1, "", ""],
		],
		expectedWinningMove: { x: 2, y: 1 },
		description: "D1 4x4 p2 to win",
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
			[p2, p1, "", ""],
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
		const runs = this._gameWinTestCases.map((testCase, testCaseIndex) =>
			this.runSingle({ ...testCase, index: testCaseIndex }),
		)
		return Promise.all(runs)
	}

	private async runSingle(testCase: GameWinTestCase): Promise<AgentStrengthTestCaseResult> {
		let setupComplete = false

		const gameOptions: CreateGameOptions = {
			participants: twoParticipants,
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
			boardSize: testCase.gameConfiguration.boardSize,
			consecutiveTarget: testCase.gameConfiguration.consecutiveTarget,
		}
		const game = new Game(gameOptions)
		makeMoves(game, testCase.madeMoves)

		setupComplete = true

		if (game.nextAvailableMovers()[0] !== testCase.aiPlaysAs) {
			throw new Error(
				`Expected '${testCase.aiPlaysAs}' to move next but got '${game.nextAvailableMovers()}'

				Agent: ${this._agentUnderTest.name}
				Index: ${testCase.index}
				Description: ${testCase.description}

				${testCase}
				`,
			)
		}

		const madeMove = await this._agentUnderTest.nextMove(game, testCase.aiPlaysAs)

		return new AgentStrengthTestCaseResult(testCase, madeMove, this._agentUnderTest)
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
		const benchmark = new AgentStrengthBenchmark(agent, _.union(Depth1GameWinTestCases))
		const results = await benchmark.run()
		console.log("Results for agent:", agent.name)
		console.log("Passes:", results.filter(r => r.status() === "Pass").length)
		console.log("Fails:", results.filter(r => r.status() === "Fail").length)

		results
			.filter(r => r.status() === "Fail")
			.forEach(r => {
				console.log(r.prettyPrint())
			})

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
