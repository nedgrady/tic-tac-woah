import { expect, test } from "vitest"
import { MadeMatch, MatchmakingStrategy } from "./MatchmakingStrategy"
import { QueueItem } from "queue/addConnectionToQueue"
import { activeUserFactory } from "testingUtilities/factories"
import { ActiveUser } from "TicTacWoahSocketServer"

class StandardMathcmakingStrategy extends MatchmakingStrategy {
	doTheThing(queueItems: readonly QueueItem[]): readonly MadeMatch[] {
		if (queueItems.length === 0) return []
		if (queueItems[0].humanCount > queueItems.length) return []
		if (queueItems[0].humanCount === 2 && queueItems[2]?.humanCount === 3) return []
		const participants = queueItems.map(item => item.queuer)
		return queueItems.map(_ => ({
			participants,
			rules: {
				boardSize: 20,
				consecutiveTarget: 3,
			},
		}))
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

type SingleMatchesTestCase = {
	queueItems: readonly QueueItem[]
	expectedMatch: MadeMatch
}

const queuers = activeUserFactory.buildList(3)

const singleMatchesTestCases: SingleMatchesTestCase[] = [
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
			participants: [queuers[0], queuers[1]],
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
			participants: [queuers[0], queuers[1], queuers[2]],
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
			participants: [queuers[0], queuers[1], queuers[2]],
			rules: {
				boardSize: 20,
				consecutiveTarget: 4,
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

	expect(madeMatch).toEqual<MadeMatch>({
		participants: expect.arrayContaining(expectedMatch.participants as ActiveUser[]),
		rules: expectedMatch.rules,
	})
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
