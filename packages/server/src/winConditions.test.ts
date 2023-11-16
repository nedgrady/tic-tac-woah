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

interface TestCase {
	board: PlacementSpecification
	consecutiveTarget: number
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
	const p1WinsTestCases: TestCase[] = [
		{
			board: [
				[p1, p1, p1, ""],
				[p2, p2, "", ""],
				["", "", "", ""],
				["", "", "", ""],
			],
			consecutiveTarget: 3,
		},

		{
			board: [
				["", p1, p1, p1],
				["", p2, p2, ""],
				["", "", "", ""],
				["", "", "", ""],
			],
			consecutiveTarget: 3,
		},

		{
			board: [
				["", "", "", ""],
				["", p2, p2, ""],
				["", "", "", ""],
				[p1, p1, p1, ""],
			],
			consecutiveTarget: 3,
		},

		{
			board: [
				["", "", "", ""],
				["", p2, p2, ""],
				["", "", "", ""],
				["", p1, p1, p1],
			],
			consecutiveTarget: 3,
		},

		{
			board: [
				["", "", "", ""],
				["", p2, p2, ""],
				["", "", "", ""],
				[p1, p1, p1, p1],
			],
			consecutiveTarget: 3,
		},

		{
			board: [
				["", "", "", ""],
				["", p2, p2, ""],
				["", "", "", ""],
				[p1, p1, p1, p1],
			],
			consecutiveTarget: 4,
		},
	]

	test.each(p1WinsTestCases)("Is triggered when player one wins with board %#", ({ board, consecutiveTarget }) => {
		const { result: type } = winByConsecutiveHorizontalPlacements(
			anyLastMove,
			{
				moves: createMoves(board),
				participants: [new Participant(), new Participant()],
			},
			{
				boardSize: 3,
				consecutiveTarget: consecutiveTarget,
			}
		)

		expect(type).toEqual("win")
	})
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
				participants: [new Participant(), new Participant()],
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
				participants: [new Participant(), new Participant()],
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
	const nonWinningTestCases: TestCase[] = [
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
				participants: [new Participant(), new Participant()],
			},
			{
				boardSize: 5,
				consecutiveTarget: consecutiveTarget,
			}
		)

		expect(result).toBe("continues")
	})
})
