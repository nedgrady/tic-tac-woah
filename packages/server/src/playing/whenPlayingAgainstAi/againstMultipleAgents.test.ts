import { expect, beforeAll, describe, it, vi } from "vitest"

import _ from "lodash"
import { MakeSequenceOfMoves } from "../../aiAgents/support/MakeSequenceOfMoves"
import { identifyAllSocketsAsTheSameUser } from "../../auth/socketIdentificationStrategies"
import Coordinates from "../../domain/Coordinates"
import { matchmaking } from "../../matchmaking/matchmaking"
import { MatchmakingBroker } from "../../matchmaking/MatchmakingBroker"
import { MatchmakingStrategy, MadeMatch } from "../../matchmaking/MatchmakingStrategy"
import { QueueItem, TicTacWoahQueue, addConnectionToQueue } from "../../queue/addConnectionToQueue"
import { madeMatchRulesFactory, coorinatesFactory, joinQueueRequestFactory } from "../../testingUtilities/factories"
import { StartAndConnectLifetime } from "../../testingUtilities/serverSetup/ticTacWoahTest"
import { TicTacWoahSocketServer } from "../../TicTacWoahSocketServer"
import { startGameOnMatchMade } from "../startGameOnMatchMade"
import { ReturnSingleGameFactory } from "../support/ReturnSingleGameFactory"

interface AiAgentSpecification {
	readonly identifier: string
	readonly moves: readonly Coordinates[]
}

class AlwaysMatchVsAiOpponents extends MatchmakingStrategy {
	constructor(private aiAgentSpecifications: readonly AiAgentSpecification[]) {
		super()
	}

	doTheThing(queueItems: readonly QueueItem[]): readonly MadeMatch[] {
		return [
			{
				aiParticipants: this.aiAgentSpecifications.map(
					aiMove => new MakeSequenceOfMoves(aiMove.moves, aiMove.identifier),
				),
				participants: [queueItems[0].queuer],
				rules: madeMatchRulesFactory.build(),
			},
		]
	}
}

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const aiAgentIdentifiers = [
		"AI Agent Who Can Move On Move 0",
		"AI Agent Who Can Move On Move 1",
		"AI Agent Who Can Move On Move 2",
	]

	const aiAgentSpecifications: AiAgentSpecification[] = aiAgentIdentifiers.map(identifier => ({
		identifier,
		moves: coorinatesFactory.buildList(1),
	}))

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(
				identifyAllSocketsAsTheSameUser({
					connections: new Set(),
					uniqueIdentifier: "Human Player",
				}),
			)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker, new AlwaysMatchVsAiOpponents(aiAgentSpecifications)))
			.use(
				startGameOnMatchMade(
					matchmakingBroker,
					new ReturnSingleGameFactory({
						decideWhoMayMoveNext: gameState => [aiAgentIdentifiers[gameState.moves.length]],
					}),
				),
			)
	}

	const testContext = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testContext.start()

		testContext.clientSocket.emit("joinQueue", joinQueueRequestFactory.build())

		await vi.waitFor(() => {
			expect(testContext.clientSocket).toHaveReceivedEvent("gameStart")
		})

		return testContext.done
	})

	it.each(aiAgentSpecifications)("The move made by '%s' is received", async aiAgentSpecfication => {
		await vi.waitFor(() => {
			expect(testContext.clientSocket).toHaveReceivedPayload("moveMade", {
				mover: aiAgentSpecfication.identifier,
				gameId: expect.any(String),
				placement: aiAgentSpecfication.moves[0],
			})
		})
	})
})
