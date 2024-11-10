import {
	GenerativeModel,
	GenerationConfig,
	SafetySetting,
	Tool,
	ToolConfig,
	Content,
	CachedContent,
	GenerateContentRequest,
	Part,
	SingleRequestOptions,
	GenerateContentResult,
	GenerateContentStreamResult,
	StartChatParams,
	ChatSession,
	CountTokensRequest,
	CountTokensResponse,
	EmbedContentRequest,
	EmbedContentResponse,
	BatchEmbedContentsRequest,
	BatchEmbedContentsResponse,
} from "@google/generative-ai"

export abstract class MockGenerativeModelBase extends GenerativeModel {
	apiKey: string = ""
	model: string = ""
	generationConfig: GenerationConfig = {}
	safetySettings: SafetySetting[] = []
	tools?: Tool[] | undefined
	toolConfig?: ToolConfig | undefined
	systemInstruction?: Content | undefined
	cachedContent: CachedContent = { contents: [] }

	constructor() {
		super("", {
			model: "",
		})
	}

	generateContent(
		request: GenerateContentRequest | string | Array<string | Part>,
		requestOptions?: SingleRequestOptions,
	): Promise<GenerateContentResult> {
		throw new Error("Method not implemented.")
	}
	generateContentStream(
		request: GenerateContentRequest | string | Array<string | Part>,
		requestOptions?: SingleRequestOptions,
	): Promise<GenerateContentStreamResult> {
		throw new Error("Method not implemented.")
	}
	startChat(startChatParams?: StartChatParams): ChatSession {
		throw new Error("Method not implemented.")
	}
	countTokens(
		request: CountTokensRequest | string | Array<string | Part>,
		requestOptions?: SingleRequestOptions,
	): Promise<CountTokensResponse> {
		throw new Error("Method not implemented.")
	}
	embedContent(
		request: EmbedContentRequest | string | Array<string | Part>,
		requestOptions?: SingleRequestOptions,
	): Promise<EmbedContentResponse> {
		throw new Error("Method not implemented.")
	}
	batchEmbedContents(
		batchEmbedContentRequest: BatchEmbedContentsRequest,
		requestOptions?: SingleRequestOptions,
	): Promise<BatchEmbedContentsResponse> {
		throw new Error("Method not implemented.")
	}
}
