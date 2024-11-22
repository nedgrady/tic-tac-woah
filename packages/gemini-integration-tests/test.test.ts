import { GeminiAiAgent } from "server/src/aiAgents/gemini/GeminiAiAgent"
import { it, expect } from "vitest"
import { GenerativeModel } from "@google/generative-ai"

it("Can successfully respond with a move", async () => {
	const model = new GenerativeModel(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY, {
		model: "gemini-1.5-flash",
	})

	const agentUnderTest = new GeminiAiAgent(model)

	await expect(agentUnderTest.nextMove()).resolves.not.toThrowError()
})

it("Picks the final square", () => {
	const model = new GenerativeModel(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY, {
		model: "gemini-1.5-flash",
	})

	// const gameOptions: CreateGameOptions = {
	// 	participants: madeMatch.participants.map(participant => participant.uniqueIdentifier),
	// 	rules: [anyMoveIsAllowed],
	// 	winConditions: [],
	// 	endConditions: [],
	// 	decideWhoMayMoveNext: anyParticipantMayMoveNext,
	// }
	// return new Game(gameOptions)

	const agentUnderTest = new GeminiAiAgent(model)

	expect(agentUnderTest.nextMove()).resolves.toEqual({ mover: "TODO", placement: { x: 1, y: 1 } })
})
