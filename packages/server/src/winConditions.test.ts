import { expect, describe, it, test } from "vitest"
import { Move } from "./Move"
import { Participant } from "./Participant"
import {
	GameWin,
	GameWinConditionResult,
	winByConsecutiveHorizontalPlacements,
	winByConsecutiveVerticalPlacements,
} from "./winConditions"
import { PlacementSpecification, createMoves } from "./gameTestHelpers"
import Coordinates from "./Coordinates"
import { faker } from "@faker-js/faker"
import { winByConsecutiveDiagonalPlacements } from "./winConditions"

interface TestCase {
	readonly board: PlacementSpecification
	readonly consecutiveTarget: number
	readonly winningMove: Move
	readonly expectedWinningMoves: readonly Move[]
}

function createParticipants(count: number): readonly Participant[] {
	return Array.from({ length: count }).map(() => new Participant())
}

const anyLastMove: Move = {
	mover: new Participant(),
	placement: { x: 0, y: 0 },
}

const [p1, p2] = createParticipants(2)

function ensureWin(winCondition: GameWinConditionResult): winCondition is GameWin {
	expect(winCondition.result).toBe("win")
	return (winCondition as GameWin).result === "win"
}

describe("Winning a game horizontally", () => {
	const p1WinsTestCases: Omit<TestCase, "expectedWinningMoves">[] = [
		{
			board: [
				[p1, p1, p1, ""],
				[p2, p2, "", ""],
				["", "", "", ""],
				["", "", "", ""],
			],
			consecutiveTarget: 3,
			winningMove: { mover: p1, placement: { x: 3, y: 0 } },
		},

		{
			board: [
				["", p1, p1, p1],
				["", p2, p2, ""],
				["", "", "", ""],
				["", "", "", ""],
			],
			consecutiveTarget: 3,
			winningMove: { mover: p1, placement: { x: 4, y: 0 } },
		},

		{
			board: [
				["", "", "", ""],
				["", p2, p2, ""],
				["", "", "", ""],
				[p1, p1, p1, ""],
			],
			consecutiveTarget: 3,
			winningMove: { mover: p1, placement: { x: 2, y: 2 } },
		},

		{
			board: [
				["", "", "", ""],
				["", p2, p2, ""],
				["", "", "", ""],
				["", p1, p1, p1],
			],
			consecutiveTarget: 3,
			winningMove: { mover: p1, placement: { x: 3, y: 3 } },
		},

		{
			board: [
				["", "", "", ""],
				["", p2, p2, ""],
				["", "", "", ""],
				[p1, p1, p1, p1],
			],
			consecutiveTarget: 3,
			winningMove: { mover: p1, placement: { x: 2, y: 3 } },
		},

		{
			board: [
				["", "", "", ""],
				["", p2, p2, ""],
				["", "", "", ""],
				[p1, p1, p1, p1],
			],
			consecutiveTarget: 4,
			winningMove: { mover: p1, placement: { x: 0, y: 3 } },
		},
	]

	test.each(p1WinsTestCases)(
		"Is triggered when player one wins with board %#",
		({ board, consecutiveTarget, winningMove }) => {
			const { result: type } = winByConsecutiveHorizontalPlacements(
				winningMove,
				{
					moves: createMoves(board),
					participants: [p1, p2],
				},
				{
					boardSize: 3,
					consecutiveTarget: consecutiveTarget,
				}
			)

			expect(type).toEqual("win")
		}
	)
})

describe("Winning a game vertically", () => {
	it("Returns a win", () => {
		const result = winByConsecutiveVerticalPlacements(
			{ mover: p1, placement: { x: 0, y: 3 } },
			{
				moves: createMoves([
					[p1, "", "", ""],
					[p1, "", "", ""],
					[p1, "", "", ""],
					[p1, "", "", ""],
				]),
				participants: [p1, p2],
			},
			{
				boardSize: 4,
				consecutiveTarget: 4,
			}
		)

		expect((result as GameWin).result).toEqual("win")
	})

	it("Returns the correct winning sequence", () => {
		const result = winByConsecutiveVerticalPlacements(
			{ mover: p2, placement: { x: 0, y: 3 } },
			{
				moves: createMoves([
					[p2, "", "", ""],
					[p2, "", "", ""],
					[p2, "", "", ""],
					[p2, "", "", ""],
				]),
				participants: [p1, p2],
			},
			{
				boardSize: 4,
				consecutiveTarget: 4,
			}
		)

		expect((result as GameWin).winningMoves).toEqual([
			{ mover: p2, placement: { x: 0, y: 0 } },
			{ mover: p2, placement: { x: 0, y: 1 } },
			{ mover: p2, placement: { x: 0, y: 2 } },
			{ mover: p2, placement: { x: 0, y: 3 } },
		])
	})

	it("Returns the correct winning sequence 2", () => {
		const result = winByConsecutiveVerticalPlacements(
			{ mover: p1, placement: { x: 1, y: 2 } },
			{
				moves: createMoves([
					["", "", "", ""],
					["", p1, "", ""],
					["", p1, "", ""],
					["", "", "", ""],
				]),
				participants: [p1, p2],
			},
			{
				boardSize: 4,
				consecutiveTarget: 2,
			}
		)

		expect((result as GameWin).winningMoves).toEqual([
			{ mover: p1, placement: { x: 1, y: 1 } },
			{ mover: p1, placement: { x: 1, y: 2 } },
		])
	})
})

describe("Non-winning scenarios do not trigger a win", () => {
	const nonWinningTestCases: Omit<TestCase, "winningMove" | "expectedWinningMoves">[] = [
		{
			board: [
				[p1, p1, p1, p1],
				[p2, p2, p2, ""],
				["", "", "", ""],
				["", "", "", ""],
			],
			consecutiveTarget: 5,
		},

		{
			board: [
				["", "", "", ""],
				["", p2, p2, p2],
				["", "", "", ""],
				[p1, p1, p1, p1],
			],
			consecutiveTarget: 5,
		},
		{
			board: [
				["", "", "", ""],
				["", p2, "", ""],
				["", "", "", ""],
				["", p1, "", ""],
			],
			consecutiveTarget: 2,
		},
	]

	test.each(nonWinningTestCases)("With the board %a", ({ board, consecutiveTarget }) => {
		const { result } = winByConsecutiveHorizontalPlacements(
			anyLastMove,
			{
				moves: createMoves(board),
				participants: [p1, p2],
			},
			{
				boardSize: 5,
				consecutiveTarget: consecutiveTarget,
			}
		)

		expect(result).toBe("continues")
	})
})

describe("Non-winning diagonal scenarios do not trigger a win", () => {
	const nonWinningTestCases: Omit<TestCase, "winningMove" | "expectedWinningMoves">[] = [
		{
			board: [
				["", "", "", ""],
				["", "", "", ""],
				["", "", "", ""],
				["", "", "", ""],
			],
			consecutiveTarget: 5,
		},

		{
			board: [
				[p1, "", "", ""],
				["", p1, p2, p2],
				["", "", "", ""],
				[p1, p1, p1, p1],
			],
			consecutiveTarget: 3,
		},
		{
			board: [
				["", "", "", p1],
				["", p2, p1, ""],
				["", p1, "", ""],
				[p1, p1, "", ""],
			],
			consecutiveTarget: 5,
		},
		{
			board: [
				[p1, "", "", p1],
				["", p1, p1, ""],
				["", p1, p1, ""],
				[p1, p1, "", p1],
			],
			consecutiveTarget: 5,
		},
	]

	test.each(nonWinningTestCases)("With the board %a", ({ board, consecutiveTarget }) => {
		const { result } = winByConsecutiveDiagonalPlacements(
			anyLastMove,
			{
				moves: createMoves(board),
				participants: [p1, p2],
			},
			{
				boardSize: 5,
				consecutiveTarget: consecutiveTarget,
			}
		)

		expect(result).toBe("continues")
	})
})

describe("Winning a game diagnoally", () => {
	const p1WinsTestCases: TestCase[] = [
		{
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
		},

		{
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
		},

		{
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
		},

		{
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
		},

		{
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
		},

		{
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
		},
	]

	it.each(p1WinsTestCases)(
		"Is triggered when player one wins with board %#",
		({ board, consecutiveTarget, winningMove }) => {
			const { result: type } = winByConsecutiveDiagonalPlacements(
				winningMove,
				{
					moves: createMoves(board),
					participants: [p1, p2],
				},
				{
					boardSize: 4,
					consecutiveTarget: consecutiveTarget,
				}
			)

			expect(type).toEqual("win")
		}
	)

	it.each(p1WinsTestCases)(
		"Returns the correct count of winning moves with board %#",
		({ board, consecutiveTarget, winningMove, expectedWinningMoves }) => {
			const result = winByConsecutiveDiagonalPlacements(
				winningMove,
				{
					moves: createMoves(board),
					participants: [p1, p2],
				},
				{
					boardSize: 4,
					consecutiveTarget: consecutiveTarget,
				}
			)

			expect((result as GameWin).winningMoves).toHaveLength(consecutiveTarget)
		}
	)

	it.each(p1WinsTestCases)(
		"Returns the correct winning moves in board %#",
		({ board, consecutiveTarget, winningMove, expectedWinningMoves }) => {
			const result = winByConsecutiveDiagonalPlacements(
				winningMove,
				{
					moves: createMoves(board),
					participants: [p1, p2],
				},
				{
					boardSize: 4,
					consecutiveTarget: consecutiveTarget,
				}
			)

			expect((result as GameWin).winningMoves).toEqual(expect.arrayContaining(expectedWinningMoves as Move[]))
		}
	)
})
