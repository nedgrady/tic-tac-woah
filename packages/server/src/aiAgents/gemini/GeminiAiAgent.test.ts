import { test, expect } from "vitest"
import { createGameOptionsFactory, generateContentResultFactory } from "../../testingUtilities/factories"
import { GeminiAiAgent } from "./GeminiAiAgent"
import { ReturnSequenceOfGenerateContentResultsGeneratriveModel } from "./support/ReturnSequenceOfGenerateContentResultsGeneratriveModel"
import { GameFactory } from "../../playing/GameFactory"
import { Game } from "../../domain/Game"

test.each([
	{ x: 1, y: 2 },
	{ x: 3, y: 4 },
	{ x: 0, y: 0 },
	{ x: 19, y: 19 },
])("When the underlying model returns '%s' the agent returns the move", async move => {
	const model = new ReturnSequenceOfGenerateContentResultsGeneratriveModel(
		generateContentResultFactory.build({
			response: {
				text: () => JSON.stringify(move),
			},
		}),
	)

	const aiAgentUnderTest = new GeminiAiAgent(model)

	const receivedMove = await aiAgentUnderTest.nextMove(new Game(createGameOptionsFactory.build()), "Any Player")

	expect(receivedMove.placement).toEqual(move)
})

test.each([{ a: 1, b: 2 }, "not an object", [], [{ x: 1, y: 1 }], {}, { x: 1 }, { y: 1 }])(
	"When the underlying model returns '%s' the agent throws an error",
	async move => {
		const model = new ReturnSequenceOfGenerateContentResultsGeneratriveModel(
			generateContentResultFactory.build({
				response: {
					text: () => JSON.stringify(move),
				},
			}),
		)

		const aiAgentUnderTest = new GeminiAiAgent(model)

		expect(
			async () => await aiAgentUnderTest.nextMove(new Game(createGameOptionsFactory.build()), "Any Player"),
		).rejects.toThrowError()
	},
)
