import { Participant } from "./Participant"
import { GameContinuesTestCase, createParticipants } from "./gameTestHelpers"
import {
	winByConsecutiveHorizontalPlacements,
	winByConsecutiveDiagonalPlacements,
	winByConsecutiveVerticalPlacements,
} from "./winConditions"

const [p1, p2] = createParticipants(2)

export const horizontalNonWinTestCases: GameContinuesTestCase[] = [
	{
		gameWinConditionUnderTest: winByConsecutiveHorizontalPlacements,
		board: [
			[p1, p1, p1, p1],
			[p2, p2, p2, ""],
			["", "", "", ""],
			["", "", "", ""],
		],
		consecutiveTarget: 5,
		participants: [p1, p2],
	},
	{
		gameWinConditionUnderTest: winByConsecutiveHorizontalPlacements,
		board: [
			["", "", "", ""],
			["", p2, p2, p2],
			["", "", "", ""],
			[p1, p1, p1, p1],
		],
		consecutiveTarget: 5,
		participants: [p1, p2],
	},
	{
		gameWinConditionUnderTest: winByConsecutiveHorizontalPlacements,
		board: [
			["", "", "", ""],
			["", p2, "", ""],
			["", "", "", ""],
			["", p1, "", ""],
		],
		consecutiveTarget: 2,
		participants: [p1, p2],
	},
]

export const diagonalNonWinningTestCases: GameContinuesTestCase[] = [
	{
		gameWinConditionUnderTest: winByConsecutiveDiagonalPlacements,
		board: [
			["", "", "", ""],
			["", "", "", ""],
			["", "", "", ""],
			["", "", "", ""],
		],
		consecutiveTarget: 5,
		participants: [p1, p2],
	},

	{
		gameWinConditionUnderTest: winByConsecutiveDiagonalPlacements,
		board: [
			[p1, "", "", ""],
			["", p1, p2, p2],
			["", "", "", ""],
			[p1, p1, p1, p1],
		],
		consecutiveTarget: 3,
		participants: [p1, p2],
	},
	{
		gameWinConditionUnderTest: winByConsecutiveDiagonalPlacements,
		board: [
			["", "", "", p1],
			["", p2, p1, ""],
			["", p1, "", ""],
			[p1, p1, "", ""],
		],
		consecutiveTarget: 5,
		participants: [p1, p2],
	},
	{
		gameWinConditionUnderTest: winByConsecutiveDiagonalPlacements,
		board: [
			[p1, "", "", p1],
			["", p1, p1, ""],
			["", p1, p1, ""],
			[p1, p1, "", p1],
		],
		consecutiveTarget: 5,
		participants: [p1, p2],
	},
]

export const vertialNonWinningTestCases: GameContinuesTestCase[] = [
	{
		gameWinConditionUnderTest: winByConsecutiveVerticalPlacements,
		board: [
			["", "", "", ""],
			["", "", "", ""],
			["", "", "", ""],
			["", "", "", ""],
		],
		consecutiveTarget: 5,
		participants: [p1, p2],
	},

	{
		gameWinConditionUnderTest: winByConsecutiveVerticalPlacements,
		board: [
			[p1, "", "", ""],
			["", p1, p2, p2],
			["", "", p2, ""],
			[p1, p1, p1, p1],
		],
		consecutiveTarget: 3,
		participants: [p1, p2],
	},
	{
		gameWinConditionUnderTest: winByConsecutiveVerticalPlacements,
		board: [
			["", "", p1, p1],
			["", p2, p1, ""],
			["", p1, p1, ""],
			[p1, p1, p1, ""],
		],
		consecutiveTarget: 5,
		participants: [p1, p2],
	},
	{
		gameWinConditionUnderTest: winByConsecutiveVerticalPlacements,
		board: [
			[p1, "", "", p1],
			["", p1, p1, ""],
			["", p1, p1, ""],
			[p1, p1, "", p1],
		],
		consecutiveTarget: 5,
		participants: [p1, p2],
	},
]
