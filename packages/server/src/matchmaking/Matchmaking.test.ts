import { expect, test } from "vitest"
import { MadeMatch, MatchmakingStrategy } from "./MatchmakingStrategy"
import { QueueItem } from "queue/addConnectionToQueue"
import { activeUserFactory, queueItemFactory } from "testingUtilities/factories"
import { ActiveUser } from "TicTacWoahSocketServer"
import _ from "lodash"

function groupBy<TKey, TValue>(list: readonly TValue[], keyGetter: (item: TValue) => TKey) {
	const map = new Map<TKey, TValue[]>()
	list.forEach(item => {
		const key = keyGetter(item)
		const collection = map.get(key)
		if (!collection) {
			map.set(key, [item])
		} else {
			collection.push(item)
		}
	})
	return map
}

function compatibleGroupKey(item: QueueItem) {
	return `${item.humanCount}-${item.consecutiveTarget}`
}

class StandardMathcmakingStrategy extends MatchmakingStrategy {
	doTheThing(queueItems: readonly QueueItem[]): readonly MadeMatch[] {
		const madeMatches: MadeMatch[] = []
		const compatibleChunks = groupBy(queueItems, compatibleGroupKey)

		for (const chunk of compatibleChunks.values()) {
			const chunksWithSufficientParticipants = _.chunk(chunk, chunk[0].humanCount).filter(
				potentialMatch => potentialMatch.length === chunk[0].humanCount
			)
			for (const chunk of chunksWithSufficientParticipants) {
				madeMatches.push({
					participants: chunk.map(item => item.queuer),
					rules: {
						boardSize: 20,
						consecutiveTarget: chunk[0].consecutiveTarget,
					},
				})
			}
		}

		return madeMatches
	}
}

type NoMatchesTestCase = readonly QueueItem[]

const noMatchesTestCases: NoMatchesTestCase[] = [
	[],
	[
		{
			humanCount: 3,
			queuer: activeUserFactory.build(),
			consecutiveTarget: 3,
		},
		{
			humanCount: 3,
			queuer: activeUserFactory.build(),
			consecutiveTarget: 3,
		},
	],
	[
		{
			humanCount: 2,
			queuer: activeUserFactory.build(),
			consecutiveTarget: 3,
		},
		{
			humanCount: 3,
			queuer: activeUserFactory.build(),
			consecutiveTarget: 3,
		},
		{
			humanCount: 3,
			queuer: activeUserFactory.build(),
			consecutiveTarget: 3,
		},
	],
]

type SingleMatchTestCase = {
	queueItems: readonly QueueItem[]
	expectedMatch: MadeMatch
}

const queuers = activeUserFactory.buildList(10)

const singleMatchesTestCases: SingleMatchTestCase[] = [
	{
		queueItems: [
			{
				humanCount: 2,
				queuer: queuers[0],
				consecutiveTarget: 3,
			},
			{
				humanCount: 2,
				queuer: queuers[1],
				consecutiveTarget: 3,
			},
		],
		expectedMatch: {
			participants: expect.arrayContaining([queuers[0], queuers[1]]),
			rules: {
				boardSize: 20,
				consecutiveTarget: 3,
			},
		},
	},
	{
		queueItems: [
			{
				humanCount: 3,
				queuer: queuers[0],
				consecutiveTarget: 3,
			},
			{
				humanCount: 3,
				queuer: queuers[1],
				consecutiveTarget: 3,
			},
			{
				humanCount: 3,
				queuer: queuers[2],
				consecutiveTarget: 3,
			},
		],
		expectedMatch: {
			participants: expect.arrayContaining([queuers[0], queuers[1], queuers[2]]),
			rules: {
				boardSize: 20,
				consecutiveTarget: 3,
			},
		},
	},
	{
		queueItems: [
			{
				humanCount: 3,
				queuer: queuers[0],
				consecutiveTarget: 4,
			},
			{
				humanCount: 3,
				queuer: queuers[1],
				consecutiveTarget: 4,
			},
			{
				humanCount: 3,
				queuer: queuers[2],
				consecutiveTarget: 4,
			},
		],
		expectedMatch: {
			participants: expect.arrayContaining([queuers[0], queuers[1], queuers[2]]),
			rules: {
				boardSize: 20,
				consecutiveTarget: 4,
			},
		},
	},
	{
		queueItems: [
			{
				humanCount: 4,
				queuer: queuers[0],
				consecutiveTarget: 4,
			},
			{
				humanCount: 2,
				queuer: queuers[1],
				consecutiveTarget: 4,
			},
			{
				humanCount: 2,
				queuer: queuers[2],
				consecutiveTarget: 4,
			},
		],
		expectedMatch: {
			participants: expect.arrayContaining([queuers[1], queuers[2]]),
			rules: {
				boardSize: 20,
				consecutiveTarget: 4,
			},
		},
	},
	{
		queueItems: [
			{
				humanCount: 3,
				queuer: queuers[0],
				consecutiveTarget: 3,
			},
			{
				humanCount: 2,
				queuer: queuers[1],
				consecutiveTarget: 2,
			},
			{
				humanCount: 3,
				queuer: queuers[2],
				consecutiveTarget: 3,
			},
			{
				humanCount: 2,
				queuer: queuers[3],
				consecutiveTarget: 2,
			},
		],
		expectedMatch: {
			participants: expect.arrayContaining([queuers[1], queuers[3]]),
			rules: {
				boardSize: 20,
				consecutiveTarget: 2,
			},
		},
	},
]

test.each(noMatchesTestCases.map(testCase => [testCase]))("No matches", queueItems => {
	const matchmaking = new StandardMathcmakingStrategy()

	const madeMatches = matchmaking.doTheThing(queueItems)

	expect(madeMatches).toEqual([])
})

test.each(singleMatchesTestCases)("Single match %#", ({ queueItems, expectedMatch }) => {
	const matchmaking = new StandardMathcmakingStrategy()

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
			{
				consecutiveTarget: 2,
				humanCount: 2,
				queuer: queuers[0],
			},
			{
				consecutiveTarget: 2,
				humanCount: 2,
				queuer: queuers[1],
			},
			{
				consecutiveTarget: 3,
				humanCount: 2,
				queuer: queuers[2],
			},
			{
				consecutiveTarget: 3,
				humanCount: 2,
				queuer: queuers[3],
			},
		],
		expectedMatches: [
			{
				participants: expect.arrayContaining([queuers[0], queuers[1]]),
				rules: {
					boardSize: 20,
					consecutiveTarget: 2,
				},
			},
			{
				participants: expect.arrayContaining([queuers[2], queuers[3]]),
				rules: {
					boardSize: 20,
					consecutiveTarget: 3,
				},
			},
		],
	},
	{
		queueItems: [
			{
				consecutiveTarget: 3,
				humanCount: 3,
				queuer: queuers[0],
			},
			{
				consecutiveTarget: 4,
				humanCount: 2,
				queuer: queuers[1],
			},
			{
				consecutiveTarget: 4,
				humanCount: 4,
				queuer: queuers[2],
			},
			{
				consecutiveTarget: 4,
				humanCount: 2,
				queuer: queuers[3],
			},
			{
				consecutiveTarget: 5,
				humanCount: 3,
				queuer: queuers[4],
			},
			{
				consecutiveTarget: 5,
				humanCount: 3,
				queuer: queuers[5],
			},
			{
				consecutiveTarget: 5,
				humanCount: 3,
				queuer: queuers[6],
			},
		],
		expectedMatches: [
			{
				participants: expect.arrayContaining([queuers[1], queuers[3]]),
				rules: {
					boardSize: 20,
					consecutiveTarget: 4,
				},
			},
			{
				participants: expect.arrayContaining([queuers[4], queuers[5], queuers[6]]),
				rules: {
					boardSize: 20,
					consecutiveTarget: 5,
				},
			},
		],
	},
	{
		queueItems: [
			{
				humanCount: 2,
				queuer: queuers[0],
				consecutiveTarget: 3,
			},
			{
				humanCount: 2,
				queuer: queuers[1],
				consecutiveTarget: 3,
			},
			{
				humanCount: 2,
				queuer: queuers[2],
				consecutiveTarget: 4,
			},
			{
				humanCount: 2,
				queuer: queuers[3],
				consecutiveTarget: 4,
			},
			{
				humanCount: 2,
				queuer: queuers[4],
				consecutiveTarget: 5,
			},
			{
				humanCount: 2,
				queuer: queuers[5],
				consecutiveTarget: 5,
			},
		],
		expectedMatches: [
			{
				participants: expect.arrayContaining([queuers[0], queuers[1]]),
				rules: {
					boardSize: 20,
					consecutiveTarget: 3,
				},
			},
			{
				participants: expect.arrayContaining([queuers[2], queuers[3]]),
				rules: {
					boardSize: 20,
					consecutiveTarget: 4,
				},
			},
			{
				participants: expect.arrayContaining([queuers[4], queuers[5]]),
				rules: {
					boardSize: 20,
					consecutiveTarget: 5,
				},
			},
		],
	},
]

test.each(manyMatchesTestCases)("Many matches %#", ({ queueItems, expectedMatches }) => {
	const matchmaking = new StandardMathcmakingStrategy()

	const madeMatches = matchmaking.doTheThing(queueItems)

	expect(madeMatches).toEqual<MadeMatch[]>(expectedMatches)
})

// test("Two compatible entries", () => {})

// test("Three compatible entries", () => {
// 	const matchmaking = new StandardMathcmakingStrategy()

// 	const queuers = activeUserFactory.buildList(3)

// 	const queueItems: QueueItem[] = [
// 		{
// 			humanCount: 3,
// 			queuer: queuers[0],
// 			consecutiveTarget: 3,
// 		},
// 		{
// 			humanCount: 3,
// 			queuer: queuers[1],
// 			consecutiveTarget: 3,
// 		},
// 		{
// 			humanCount: 3,
// 			queuer: queuers[2],
// 			consecutiveTarget: 3,
// 		},
// 	]

// 	const madeMatch = matchmaking.doTheThing(queueItems)[0]

// 	expect(madeMatch).toEqual<MadeMatch>({
// 		participants: expect.arrayContaining(queuers),
// 		rules: {
// 			boardSize: 20,
// 			consecutiveTarget: 3,
// 		},
// 	})
// })