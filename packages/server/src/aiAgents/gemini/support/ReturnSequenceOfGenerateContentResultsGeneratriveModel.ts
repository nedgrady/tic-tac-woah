import { GenerateContentResult, GenerateContentRequest } from "@google/generative-ai"
import { ThrowingIterator } from "matchmaking/Matchmaking.test"
import { MockGenerativeModelBase } from "./MockGenerativeModelBase"

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
