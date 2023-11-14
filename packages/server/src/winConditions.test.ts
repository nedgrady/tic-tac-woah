import { expect, describe, it, test } from "vitest"
import { Move } from "./Move"
import { Participant } from "./Participant"
import { winByConsecutiveHorizontalPlacements } from "./winConditions"

type PlacementSpecification = (Participant | Empty)[][]
type Empty = ""

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

describe.only("Winning a game horizontally", () => {
	const p1WinsWithThreePlacementsTestCases: PlacementSpecification[][] = [
		[
			[
				[p1, p1, p1, ""],
				[p2, p2, "", ""],
				["", "", "", ""],
				["", "", "", ""],
			],
		],
		[
			[
				["", p1, p1, p1],
				["", p2, p2, ""],
				["", "", "", ""],
				["", "", "", ""],
			],
		],
		[
			[
				["", "", "", ""],
				["", p2, p2, ""],
				["", "", "", ""],
				[p1, p1, p1, ""],
			],
		],
		[
			[
				["", "", "", ""],
				["", p2, p2, ""],
				["", "", "", ""],
				["", p1, p1, p1],
			],
		],
	]

	test.each(p1WinsWithThreePlacementsTestCases)("Is triggered when player one wins with board %#", moves => {
		const isWin = winByConsecutiveHorizontalPlacements(
			anyLastMove,
			{
				moves: createMoves(moves),
				participants: [new Participant(), new Participant()],
			},
			{
				boardSize: 3,
				consecutiveTarget: 3,
			}
		)

		expect(isWin).toBe(true)
	})
})

describe("Non-winning scenarios do not trigger a win", () => {
	const nonWinningFiveConsecutivePlacementsRequiredTestCases: PlacementSpecification[][] = [
		[
			[
				[p1, p1, p1, p1],
				[p2, p2, p2, ""],
				["", "", "", ""],
				["", "", "", ""],
			],
		],
		[
			[
				["", "", "", ""],
				["", p2, p2, p2],
				["", "", "", ""],
				[p1, p1, p1, p1],
			],
		],
	]

	test.each(nonWinningFiveConsecutivePlacementsRequiredTestCases)("With the board %a", moves => {
		const isWin = winByConsecutiveHorizontalPlacements(
			anyLastMove,
			{
				moves: createMoves(moves),
				participants: [new Participant(), new Participant()],
			},
			{
				boardSize: 5,
				consecutiveTarget: 5,
			}
		)

		expect(isWin).toBe(false)
	})
})
