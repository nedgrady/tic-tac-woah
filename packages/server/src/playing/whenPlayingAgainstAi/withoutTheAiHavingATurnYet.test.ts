import { TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifyAllSocketsAsTheSameUser } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { startGameOnMatchMade } from "playing/startGameOnMatchMade"
import { QueueItem, TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { joinQueueRequestFactory, madeMatchRulesFactory } from "testingUtilities/factories"
import { AiParticipant, MadeMatch, MatchmakingStrategy } from "matchmaking/MatchmakingStrategy"
import { ReturnSingleGameFactory } from "../support/ReturnSingleGameFactory"
import _ from "lodash"
import Coordinates from "domain/Coordinates"
import { Move } from "domain/Move"

class MakeSequenceOfMoves implements AiParticipant {
	// 	private gameOptionsIterator: Iterator<Partial<CreateGameOptions>>

	// constructor(...gameOptions: readonly Partial<CreateGameOptions>[]) {
	// 	super()

	// 	this.gameOptionsIterator = gameOptions[Symbol.iterator]()
	// }
	private readonly coordinatesIterator: Iterator<Coordinates>

	constructor(coordinates: readonly Coordinates[]) {
		this.coordinatesIterator = coordinates[Symbol.iterator]()
	}

	nextMove(): Move {
		const { value: currentMove, done } = this.coordinatesIterator.next()

		if (done) throw new Error("No more coordinates to return")

		return {
			placement: currentMove,
			mover: "TODO",
		}
	}
}

class AlwaysMatchVsSingleAiOpponent extends MatchmakingStrategy {
	constructor(private aiMoves: readonly Coordinates[] = []) {
		super()
	}

	doTheThing(queueItems: readonly QueueItem[]): readonly MadeMatch[] {
		return [
			{
				aiParticipants: [new MakeSequenceOfMoves(this.aiMoves)],
				participants: [queueItems[0].queuer],
				rules: madeMatchRulesFactory.build(),
			},
		]
	}
}

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(
				identifyAllSocketsAsTheSameUser({
					connections: new Set(),
					uniqueIdentifier: "Human Player",
				}),
			)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker, new AlwaysMatchVsSingleAiOpponent()))
			.use(
				startGameOnMatchMade(
					matchmakingBroker,
					new ReturnSingleGameFactory({
						decideWhoMayMoveNext: () => [],
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

	it("No moves are made by the ai", async () => {
		expect(testContext.clientSocket).not.toHaveReceivedEvent("moveMade")
	})
})
