import {
	GenerateContentResult,
	GenerateContentRequest,
	BatchEmbedContentsRequest,
	BatchEmbedContentsResponse,
	ChatSession,
	CountTokensRequest,
	CountTokensResponse,
	EmbedContentRequest,
	EmbedContentResponse,
	GenerateContentStreamResult,
	Part,
	SingleRequestOptions,
	StartChatParams,
	GenerativeModel,
} from "@google/generative-ai"
import { ThrowingIterator } from "matchmaking/Matchmaking.test"
import { MockGenerativeModelBase } from "./MockGenerativeModelBase"
import { vi } from "vitest"
import { generateContentResultFactory } from "testingUtilities/factories"

export class ReturnSequenceOfGenerateContentResultsGeneratriveModel extends MockGenerativeModelBase {
	private _resultsToReturn: ThrowingIterator<GenerateContentResult>

	constructor(...aiMoves: GenerateContentResult[]) {
		super()
		this._resultsToReturn = new ThrowingIterator(aiMoves, "AiModelMoveResponse")
	}

	generateContent(_: GenerateContentRequest): Promise<GenerateContentResult> {
		return Promise.resolve<GenerateContentResult>(this._resultsToReturn.next())
	}
}
export class AssertableGenerativeModel extends MockGenerativeModelBase {
	generateContent = vi
		.fn<Parameters<GenerativeModel["generateContent"]>, Promise<GenerateContentResult>>()
		.mockResolvedValue(
			generateContentResultFactory.build({
				response: {
					text: () => JSON.stringify({ x: 1, y: 1 }),
				},
			}),
		)

	generateContentStream = vi.fn<
		Parameters<GenerativeModel["generateContentStream"]>,
		Promise<GenerateContentStreamResult>
	>()

	startChat = vi.fn<Parameters<GenerativeModel["startChat"]>, ChatSession>()

	countTokens = vi.fn<Parameters<GenerativeModel["countTokens"]>, Promise<CountTokensResponse>>()

	embedContent = vi.fn<Parameters<GenerativeModel["embedContent"]>, Promise<EmbedContentResponse>>()

	batchEmbedContents = vi.fn<Parameters<GenerativeModel["batchEmbedContents"]>, Promise<BatchEmbedContentsResponse>>()
}
