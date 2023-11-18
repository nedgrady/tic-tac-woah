import { GameWinTestCase, createParticipants } from "./gameTestHelpers"
import {
	winByConsecutiveDiagonalPlacements,
	winByConsecutiveHorizontalPlacements,
	winByConsecutiveVerticalPlacements,
} from "./winConditions"

const [p1, p2] = createParticipants(2)

export const diagonalWinTestCases: GameWinTestCase[] = [
	{
		gameWinConditionUnderTest: winByConsecutiveDiagonalPlacements,
		board: [
			[p1, p1, p2, ""],
			[p2, p1, "", ""],
			["", "", p1, ""],
			["", "", "", ""],
		],
		consecutiveTarget: 3,
		winningMove: { mover: p1, placement: { x: 2, y: 2 } },
		expectedWinningMoves: [
			{ mover: p2, placement: { x: 0, y: 0 } },
			{ mover: p2, placement: { x: 1, y: 1 } },
			{ mover: p2, placement: { x: 2, y: 2 } },
		],
		participants: [p1, p2],
	},
	{
		gameWinConditionUnderTest: winByConsecutiveDiagonalPlacements,
		board: [
			["", p1, p1, p1],
			["", p1, p2, ""],
			[p2, "", "", ""],
			["", p1, "", ""],
		],
		consecutiveTarget: 2,
		winningMove: { mover: p1, placement: { x: 1, y: 1 } },
		expectedWinningMoves: [
			{ mover: p1, placement: { x: 1, y: 1 } },
			{ mover: p1, placement: { x: 2, y: 0 } },
		],
		participants: [p1, p2],
	},

	{
		gameWinConditionUnderTest: winByConsecutiveDiagonalPlacements,
		board: [
			["", "", "", p1],
			["", p2, p1, ""],
			["", p1, "", ""],
			[p1, p1, p2, ""],
		],
		consecutiveTarget: 4,
		winningMove: { mover: p1, placement: { x: 0, y: 3 } },
		expectedWinningMoves: [
			{ mover: p1, placement: { x: 3, y: 0 } },
			{ mover: p1, placement: { x: 2, y: 1 } },
			{ mover: p1, placement: { x: 1, y: 2 } },
			{ mover: p1, placement: { x: 0, y: 3 } },
		],
		participants: [p1, p2],
	},

	{
		gameWinConditionUnderTest: winByConsecutiveDiagonalPlacements,
		board: [
			[p1, "", "", ""],
			["", p1, p2, ""],
			["", "", p1, ""],
			["", p1, p1, p2],
		],
		consecutiveTarget: 3,
		winningMove: { mover: p1, placement: { x: 0, y: 0 } },
		expectedWinningMoves: [
			{ mover: p1, placement: { x: 0, y: 0 } },
			{ mover: p1, placement: { x: 1, y: 1 } },
			{ mover: p1, placement: { x: 2, y: 2 } },
		],
		participants: [p1, p2],
	},

	{
		gameWinConditionUnderTest: winByConsecutiveDiagonalPlacements,
		board: [
			["", "", "", ""],
			["", p2, p2, ""],
			["", "", "", p2],
			[p1, p1, p1, p1],
		],
		consecutiveTarget: 2,
		winningMove: { mover: p2, placement: { x: 3, y: 2 } },
		expectedWinningMoves: [
			{ mover: p2, placement: { x: 2, y: 1 } },
			{ mover: p2, placement: { x: 3, y: 2 } },
		],
		participants: [p1, p2],
	},

	{
		gameWinConditionUnderTest: winByConsecutiveDiagonalPlacements,
		board: [
			["", "", "", ""],
			["", p2, p2, ""],
			["", "", p2, ""],
			[p1, p1, p1, p2],
		],
		consecutiveTarget: 3,
		winningMove: { mover: p2, placement: { x: 2, y: 2 } },
		expectedWinningMoves: [
			{ mover: p2, placement: { x: 1, y: 1 } },
			{ mover: p2, placement: { x: 2, y: 2 } },
			{ mover: p2, placement: { x: 3, y: 3 } },
		],
		participants: [p1, p2],
	},
]

export const verticalWinTestCases: readonly GameWinTestCase[] = [
	{
		gameWinConditionUnderTest: winByConsecutiveVerticalPlacements,
		board: [
			[p1, "", p2],
			[p1, "", p2],
			[p1, "", ""],
		],
		consecutiveTarget: 3,
		winningMove: { placement: { x: 0, y: 2 }, mover: p1 },
		expectedWinningMoves: [
			{ placement: { x: 0, y: 0 }, mover: p1 },
			{ placement: { x: 0, y: 1 }, mover: p1 },
			{ placement: { x: 0, y: 2 }, mover: p1 },
		],
		participants: [p1, p2],
	},
	{
		gameWinConditionUnderTest: winByConsecutiveVerticalPlacements,
		board: [
			[p2, "", p1],
			[p2, "", p1],
			[p2, "", ""],
		],
		consecutiveTarget: 3,
		winningMove: { placement: { x: 0, y: 2 }, mover: p2 },
		expectedWinningMoves: [
			{ placement: { x: 0, y: 0 }, mover: p2 },
			{ placement: { x: 0, y: 1 }, mover: p2 },
			{ placement: { x: 0, y: 2 }, mover: p2 },
		],
		participants: [p1, p2],
	},

	{
		gameWinConditionUnderTest: winByConsecutiveVerticalPlacements,
		board: [
			["", "", "", "", "", "", "", "", "", p2, "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", p2, "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			[p1, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			[p1, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
		],
		consecutiveTarget: 2,
		winningMove: { placement: { x: 0, y: 2 }, mover: p1 },
		expectedWinningMoves: [
			{ placement: { x: 0, y: 18 }, mover: p1 },
			{ placement: { x: 0, y: 19 }, mover: p1 },
		],
		participants: [p1, p2],
	},

	{
		gameWinConditionUnderTest: winByConsecutiveVerticalPlacements,
		board: [
			[p1, p2, "", p1, p2],
			[p1, p2, "", p1, p2],
			["", "", "", p1, ""],
			["", "", "", "", ""],
			["", "", "", "", ""],
		],
		consecutiveTarget: 3,
		winningMove: { placement: { x: 3, y: 1 }, mover: p1 },
		expectedWinningMoves: [
			{ placement: { x: 3, y: 0 }, mover: p1 },
			{ placement: { x: 3, y: 1 }, mover: p1 },
			{ placement: { x: 3, y: 2 }, mover: p1 },
		],
		participants: [p1, p2],
	},

	{
		gameWinConditionUnderTest: winByConsecutiveVerticalPlacements,
		board: [
			[p1, p2, "", p1, p2],
			[p1, p2, "", p2, p2],
			["", "", p2, p1, ""],
			["", "", p2, "", ""],
			["", "", p2, "", ""],
		],
		consecutiveTarget: 3,
		winningMove: { placement: { x: 2, y: 2 }, mover: p2 },
		expectedWinningMoves: [
			{ placement: { x: 2, y: 2 }, mover: p2 },
			{ placement: { x: 2, y: 3 }, mover: p2 },
			{ placement: { x: 2, y: 4 }, mover: p2 },
		],
		participants: [p1, p2],
	},
]

export const horizontalWinTestCases: GameWinTestCase[] = [
	{
		gameWinConditionUnderTest: winByConsecutiveHorizontalPlacements,
		board: [
			[p1, p1, p1, ""],
			[p2, p2, "", ""],
			["", "", "", ""],
			["", "", "", ""],
		],
		consecutiveTarget: 3,
		winningMove: { mover: p1, placement: { x: 2, y: 0 } },
		expectedWinningMoves: [
			{ mover: p1, placement: { x: 0, y: 0 } },
			{ mover: p1, placement: { x: 1, y: 0 } },
			{ mover: p1, placement: { x: 2, y: 0 } },
		],
		participants: [p1, p2],
	},
	{
		gameWinConditionUnderTest: winByConsecutiveHorizontalPlacements,
		board: [
			["", p1, p1, p1],
			["", p2, p2, ""],
			["", "", "", ""],
			["", "", "", ""],
		],
		consecutiveTarget: 3,
		winningMove: { mover: p1, placement: { x: 3, y: 0 } },
		expectedWinningMoves: [
			{ mover: p1, placement: { x: 1, y: 0 } },
			{ mover: p1, placement: { x: 2, y: 0 } },
			{ mover: p1, placement: { x: 3, y: 0 } },
		],
		participants: [p1, p2],
	},

	{
		gameWinConditionUnderTest: winByConsecutiveHorizontalPlacements,
		board: [
			["", "", "", ""],
			["", p2, p2, ""],
			["", "", "", ""],
			[p1, p1, p1, ""],
		],
		consecutiveTarget: 3,
		winningMove: { mover: p1, placement: { x: 2, y: 3 } },
		expectedWinningMoves: [
			{ mover: p1, placement: { x: 0, y: 3 } },
			{ mover: p1, placement: { x: 1, y: 3 } },
			{ mover: p1, placement: { x: 2, y: 3 } },
		],
		participants: [p1, p2],
	},
	{
		gameWinConditionUnderTest: winByConsecutiveHorizontalPlacements,
		board: [
			["", "", "", ""],
			["", p2, p2, ""],
			["", "", "", ""],
			["", p1, p1, p1],
		],
		consecutiveTarget: 3,
		winningMove: { mover: p1, placement: { x: 3, y: 3 } },
		expectedWinningMoves: [
			{ mover: p1, placement: { x: 2, y: 3 } },
			{ mover: p1, placement: { x: 2, y: 3 } },
			{ mover: p1, placement: { x: 3, y: 3 } },
		],
		participants: [p1, p2],
	},
	{
		gameWinConditionUnderTest: winByConsecutiveHorizontalPlacements,
		board: [
			["", "", "", ""],
			["", p2, p2, ""],
			["", "", "", ""],
			[p2, p2, p2, p2],
		],
		consecutiveTarget: 4,
		winningMove: { mover: p2, placement: { x: 0, y: 3 } },
		expectedWinningMoves: [
			{ mover: p1, placement: { x: 0, y: 3 } },
			{ mover: p1, placement: { x: 1, y: 3 } },
			{ mover: p1, placement: { x: 2, y: 3 } },
			{ mover: p1, placement: { x: 3, y: 3 } },
		],
		participants: [p1, p2],
	},
]
