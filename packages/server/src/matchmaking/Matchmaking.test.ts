import { expect, test } from "vitest"
import { MadeMatch } from "./MatchmakingStrategy"
import { QueueItem } from "queue/addConnectionToQueue"
import { activeUserFactory, aiParticipantFactory, queueItemFactory } from "testingUtilities/factories"
import { QueueItemCompatibilityFunction, StandardMathcmakingStrategy } from "./StandardMathcmakingStrategy"
import { AnyAiParticipantFactory } from "../aiAgents/support/AnyAiParticipantFactory"
import { ReturnSequenceOfAiParticipants } from "aiAgents/support/ReturnSequenceOfAiParticipants"

export class ThrowingIterator<TEntityToReturn> {
	private iterator: Iterator<TEntityToReturn>

	constructor(
		private readonly entities: readonly TEntityToReturn[],
		private readonly entityName: string,
	) {
		this.iterator = entities[Symbol.iterator]()
	}

	next(): TEntityToReturn {
		const { value: currentEntity, done } = this.iterator.next()

		if (done) throw new Error(`No more entities of type ${this.entityName} to return`)

		return currentEntity
	}
}

type NoMatchesTestCase = readonly QueueItem[]

const noMatchesTestCases: NoMatchesTestCase[] = [
	[],
	[
		queueItemFactory.build({ humanCount: 3, consecutiveTarget: 3 }),
		queueItemFactory.build({ humanCount: 3, consecutiveTarget: 3 }),
	],
	[
		queueItemFactory.build({ humanCount: 2, consecutiveTarget: 3 }),
		queueItemFactory.build({ humanCount: 3, consecutiveTarget: 3 }),
		queueItemFactory.build({ humanCount: 3, consecutiveTarget: 3 }),
	],
]

test.each(noMatchesTestCases.map(testCase => [testCase]))("No matches", queueItems => {
	const matchmaking = new StandardMathcmakingStrategy(
		queueItem => `${queueItem.humanCount}-${queueItem.consecutiveTarget}`,
		new AnyAiParticipantFactory(),
	)

	const madeMatches = matchmaking.doTheThing(queueItems)

	expect(madeMatches).toEqual([])
})

type SingleMatchTestCase = {
	queueItems: readonly QueueItem[]
	expectedMatch: MadeMatch
}

const queuers = activeUserFactory.buildList(10)

const singleMatchesTestCases: SingleMatchTestCase[] = [
	{
		queueItems: [
			queueItemFactory.build({ humanCount: 2, aiCount: 0, queuer: queuers[0], consecutiveTarget: 3 }),
			queueItemFactory.build({ humanCount: 2, queuer: queuers[1], consecutiveTarget: 3 }),
		],
		expectedMatch: {
			participants: expect.arrayContaining([queuers[0], queuers[1]]),
			aiParticipants: expect.any(Array),
			rules: {
				boardSize: 20,
				consecutiveTarget: 3,
			},
		},
	},
	{
		queueItems: [
			queueItemFactory.build({ humanCount: 3, queuer: queuers[0], consecutiveTarget: 3 }),
			queueItemFactory.build({ humanCount: 3, queuer: queuers[1], consecutiveTarget: 3 }),
			queueItemFactory.build({ humanCount: 3, queuer: queuers[2], consecutiveTarget: 3 }),
		],
		expectedMatch: {
			participants: expect.arrayContaining([queuers[0], queuers[1], queuers[2]]),
			aiParticipants: expect.any(Array),
			rules: {
				boardSize: 20,
				consecutiveTarget: 3,
			},
		},
	},
	{
		queueItems: [
			queueItemFactory.build({ humanCount: 3, queuer: queuers[0], consecutiveTarget: 4 }),
			queueItemFactory.build({ humanCount: 3, queuer: queuers[1], consecutiveTarget: 4 }),
			queueItemFactory.build({ humanCount: 3, queuer: queuers[2], consecutiveTarget: 4 }),
		],
		expectedMatch: {
			participants: expect.arrayContaining([queuers[0], queuers[1], queuers[2]]),
			aiParticipants: expect.any(Array),
			rules: {
				boardSize: 20,
				consecutiveTarget: 4,
			},
		},
	},
	{
		queueItems: [
			queueItemFactory.build({ humanCount: 4, queuer: queuers[0], consecutiveTarget: 4 }),
			queueItemFactory.build({ humanCount: 2, queuer: queuers[1], consecutiveTarget: 4 }),
			queueItemFactory.build({ humanCount: 2, queuer: queuers[2], consecutiveTarget: 4 }),
		],
		expectedMatch: {
			participants: expect.arrayContaining([queuers[1], queuers[2]]),
			aiParticipants: expect.any(Array),
			rules: {
				boardSize: 20,
				consecutiveTarget: 4,
			},
		},
	},
	{
		queueItems: [
			queueItemFactory.build({ humanCount: 3, queuer: queuers[0], consecutiveTarget: 3 }),
			queueItemFactory.build({ humanCount: 2, queuer: queuers[1], consecutiveTarget: 2 }),
			queueItemFactory.build({ humanCount: 3, queuer: queuers[2], consecutiveTarget: 3 }),
			queueItemFactory.build({ humanCount: 2, queuer: queuers[3], consecutiveTarget: 2 }),
		],
		expectedMatch: {
			participants: expect.arrayContaining([queuers[1], queuers[3]]),
			aiParticipants: expect.any(Array),
			rules: {
				boardSize: 20,
				consecutiveTarget: 2,
			},
		},
	},
]

test.each(singleMatchesTestCases)("Single match %#", ({ queueItems, expectedMatch }) => {
	const matchmaking = new StandardMathcmakingStrategy(
		queueItem => `${queueItem.humanCount}-${queueItem.consecutiveTarget}`,
		new AnyAiParticipantFactory(),
	)

	const madeMatch = matchmaking.doTheThing(queueItems)[0]

	expect(madeMatch).toEqual<MadeMatch>(expectedMatch)
})

type ManyMatchesTestCase = {
	queueItems: readonly QueueItem[]
	expectedMatches: MadeMatch[]
}

const manyMatchesTestCases: ManyMatchesTestCase[] = [
	{
		queueItems: [
			queueItemFactory.build({ consecutiveTarget: 2, humanCount: 2, queuer: queuers[0] }),
			queueItemFactory.build({ consecutiveTarget: 2, humanCount: 2, queuer: queuers[1] }),
			queueItemFactory.build({ consecutiveTarget: 3, humanCount: 2, queuer: queuers[2] }),
			queueItemFactory.build({ consecutiveTarget: 3, humanCount: 2, queuer: queuers[3] }),
		],
		expectedMatches: [
			{
				participants: expect.arrayContaining([queuers[0], queuers[1]]),
				aiParticipants: expect.any(Array),
				rules: {
					boardSize: 20,
					consecutiveTarget: 2,
				},
			},
			{
				participants: expect.arrayContaining([queuers[2], queuers[3]]),
				aiParticipants: expect.any(Array),
				rules: {
					boardSize: 20,
					consecutiveTarget: 3,
				},
			},
		],
	},
	{
		queueItems: [
			queueItemFactory.build({ consecutiveTarget: 3, humanCount: 3, queuer: queuers[0] }),
			queueItemFactory.build({ consecutiveTarget: 4, humanCount: 2, queuer: queuers[1] }),
			queueItemFactory.build({ consecutiveTarget: 4, humanCount: 4, queuer: queuers[2] }),
			queueItemFactory.build({ consecutiveTarget: 4, humanCount: 2, queuer: queuers[3] }),
			queueItemFactory.build({ consecutiveTarget: 5, humanCount: 3, queuer: queuers[4] }),
			queueItemFactory.build({ consecutiveTarget: 5, humanCount: 3, queuer: queuers[5] }),
			queueItemFactory.build({ consecutiveTarget: 5, humanCount: 3, queuer: queuers[6] }),
		],
		expectedMatches: [
			{
				participants: expect.arrayContaining([queuers[1], queuers[3]]),
				aiParticipants: expect.any(Array),
				rules: {
					boardSize: 20,
					consecutiveTarget: 4,
				},
			},
			{
				participants: expect.arrayContaining([queuers[4], queuers[5], queuers[6]]),
				aiParticipants: expect.any(Array),
				rules: {
					boardSize: 20,
					consecutiveTarget: 5,
				},
			},
		],
	},
	{
		queueItems: [
			queueItemFactory.build({ humanCount: 2, queuer: queuers[0], consecutiveTarget: 3 }),
			queueItemFactory.build({ humanCount: 2, queuer: queuers[1], consecutiveTarget: 3 }),
			queueItemFactory.build({ humanCount: 2, queuer: queuers[2], consecutiveTarget: 4 }),
			queueItemFactory.build({ humanCount: 2, queuer: queuers[3], consecutiveTarget: 4 }),
			queueItemFactory.build({ humanCount: 2, queuer: queuers[4], consecutiveTarget: 5 }),
			queueItemFactory.build({ humanCount: 2, queuer: queuers[5], consecutiveTarget: 5 }),
		],
		expectedMatches: [
			{
				participants: expect.arrayContaining([queuers[0], queuers[1]]),
				aiParticipants: expect.any(Array),
				rules: {
					boardSize: 20,
					consecutiveTarget: 3,
				},
			},
			{
				participants: expect.arrayContaining([queuers[2], queuers[3]]),
				aiParticipants: expect.any(Array),
				rules: {
					boardSize: 20,
					consecutiveTarget: 4,
				},
			},
			{
				participants: expect.arrayContaining([queuers[4], queuers[5]]),
				aiParticipants: expect.any(Array),
				rules: {
					boardSize: 20,
					consecutiveTarget: 5,
				},
			},
		],
	},
]

test.each(manyMatchesTestCases)("Many matches %#", ({ queueItems, expectedMatches }) => {
	const matchmaking = new StandardMathcmakingStrategy(
		queueItem => `${queueItem.humanCount}-${queueItem.consecutiveTarget}`,
		new AnyAiParticipantFactory(),
	)

	const madeMatches = matchmaking.doTheThing(queueItems)

	expect(madeMatches).toEqual<MadeMatch[]>(expectedMatches)
})

const potentialGroupingTestCases: QueueItemCompatibilityFunction[] = [
	queueItem => queueItem.consecutiveTarget.toString(),
	queueItem => queueItem.humanCount.toString(),
	queueItem => queueItem.aiCount.toString(),
]

test.each(potentialGroupingTestCases)("Potential grouping %#", queueItemCompatibilityFunction => {
	const singleQueueItemMatchedIntoGame = queueItemFactory.build({
		humanCount: 1,
		aiCount: 3,
	})

	const matchmaking = new StandardMathcmakingStrategy(queueItemCompatibilityFunction, new AnyAiParticipantFactory())
	const madeMatches = matchmaking.doTheThing([singleQueueItemMatchedIntoGame])

	const expectedMatch: MadeMatch = {
		participants: [singleQueueItemMatchedIntoGame.queuer],
		// TODO - how to get the agents in here?
		aiParticipants: expect.any(Array),
		rules: {
			boardSize: 20,
			consecutiveTarget: singleQueueItemMatchedIntoGame.consecutiveTarget,
		},
	}

	expect(madeMatches).toEqual([expectedMatch])
})

test("Ai participants", () => {
	const singleQueueItemMatchedIntoGame = queueItemFactory.build({
		humanCount: 1,
		aiCount: 3,
	})

	const expectedAiParticipants = aiParticipantFactory.buildList(3)

	const matchmaking = new StandardMathcmakingStrategy(
		() => "1",
		new ReturnSequenceOfAiParticipants(expectedAiParticipants),
	)

	const madeMatches = matchmaking.doTheThing([singleQueueItemMatchedIntoGame])

	expect(madeMatches[0].aiParticipants).toEqual(expectedAiParticipants)
})
