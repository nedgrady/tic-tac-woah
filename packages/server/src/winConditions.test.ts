import { expect, describe, it, test } from "vitest"
import { Move } from "./Move"
import { Participant } from "./Participant"
import { winByConsecutiveHorizontalPlacements } from "./winConditions"
import { number } from "zod"

type PlacementSpecification = (Participant | Empty)[][]
type Empty = ""

interface TestCase {
	board: PlacementSpecification
	consecutiveTarget: number
}

function createMoves(placementDefinitions: PlacementSpecification) {
	const moves: Move[] = []

	placementDefinitions.forEach((row, rowIndex) => {
		row.forEach((participant, columnIndex) => {
			if (participant === "") return

			moves.push({
				mover: participant,
				placement: { x: columnIndex, y: rowIndex },
			})
		})
	})

	return moves
}

function createParticipants(count: number): readonly Participant[] {
	return Array.from({ length: count }).map(() => new Participant())
}

const anyLastMove: Move = {
	mover: new Participant(),
	placement: { x: 0, y: 0 },
}

const [p1, p2] = createParticipants(2)

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
