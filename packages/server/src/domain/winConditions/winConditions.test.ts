import { test, expect, it } from "vitest"

import {
	GameContinuesTestCase,
	diagonalNonWinningTestCases,
	horizontalNonWinTestCases,
	vertialNonWinningTestCases,
} from "./continuingGameTestCases"
import { GameWin, winByConsecutiveDiagonalPlacements } from "./winConditions"
import { horizontalWinTestCases, diagonalWinTestCases, verticalWinTestCases } from "./winningGameTestCases"
import { Move } from "domain/Move"
import { Participant } from "domain/Participant"
import { createParticipants, createMoves } from "domain/gameTestHelpers"

const [p1, p2] = createParticipants(2)

const anyLastMove: Move = {
	mover: new Participant(),
	placement: { x: 0, y: 0 },
}

const allTheNonWinningTestCases: GameContinuesTestCase[] = [
	...diagonalNonWinningTestCases,
	...horizontalNonWinTestCases,
	...vertialNonWinningTestCases,
]

test.each(allTheNonWinningTestCases)(
	"Checking the rule '$gameWinConditionUnderTest' with any last move returns continues (test case %#)",
	({ board, consecutiveTarget, gameWinConditionUnderTest, participants }) => {
		const { result } = gameWinConditionUnderTest(
			anyLastMove,
			{
				moves: createMoves(board),
				participants: participants,
			},
			{
				boardSize: 5,
				consecutiveTarget: consecutiveTarget,
			}
		)

		expect(result).toBe("continues")
	}
)

const allTheWinTestCases = [...horizontalWinTestCases, ...diagonalWinTestCases, ...verticalWinTestCases]

test.each(allTheWinTestCases)(
	"Checking the rule '$gameWinConditionUnderTest' with the last move '($winningMove.placement.x, $winningMove.placement.y)' returns a win (test case %#)",
	({ board, consecutiveTarget, winningMove, gameWinConditionUnderTest, participants }) => {
		const { result: type } = gameWinConditionUnderTest(
			winningMove,
			{
				moves: createMoves(board),
				participants,
			},
			{
				boardSize: 4,
				consecutiveTarget: consecutiveTarget,
			}
		)

		expect(type).toEqual("win")
	}
)

test.each(allTheWinTestCases)(
	"Checking the rule '$gameWinConditionUnderTest' with the last move '($winningMove.placement.x, $winningMove.placement.y)' returns the correct number of winning moves (test case %#)",
	({ board, consecutiveTarget, winningMove, gameWinConditionUnderTest, participants }) => {
		const result = gameWinConditionUnderTest(
			winningMove,
			{
				moves: createMoves(board),
				participants,
			},
			{
				boardSize: 4,
				consecutiveTarget: consecutiveTarget,
			}
		)

		expect((result as GameWin).winningMoves).toHaveLength(consecutiveTarget)
	}
)

test.each(allTheWinTestCases)(
	"Checking the rule '$gameWinConditionUnderTest' with the last move '($winningMove.placement.x, $winningMove.placement.y)' returns the correct moves (test case %#)",
	({ board, consecutiveTarget, winningMove, expectedWinningMoves, gameWinConditionUnderTest, participants }) => {
		const result = gameWinConditionUnderTest(
			winningMove,
			{
				moves: createMoves(board),
				participants,
			},
			{
				boardSize: 4,
				consecutiveTarget: consecutiveTarget,
			}
		)

		expect((result as GameWin).winningMoves).toEqual(expect.arrayContaining(expectedWinningMoves as Move[]))
	}
)

it("Even if the moves aren't ordered wins are still reported correctly nw-se", () => {
	const winningMoves = [
		{ mover: p1, placement: { x: 0, y: 0 } },
		{ mover: p1, placement: { x: 2, y: 2 } },
		{ mover: p1, placement: { x: 1, y: 1 } },
		{ mover: p1, placement: { x: 3, y: 3 } },
	]

	const result = winByConsecutiveDiagonalPlacements(
		{
			mover: p1,
			placement: { x: 0, y: 0 },
		},
		{
			moves: winningMoves,
			participants: [p1, p2],
		},
		{
			boardSize: 4,
			consecutiveTarget: 4,
		}
	)

	expect((result as GameWin).winningMoves).toEqual(expect.arrayContaining(winningMoves as Move[]))
})

it("Even if the moves aren't ordered wins are still reported correctly sw-ne", () => {
	const winningMoves = [
		{ mover: p2, placement: { x: 0, y: 3 } },
		{ mover: p2, placement: { x: 2, y: 1 } },
		{ mover: p2, placement: { x: 1, y: 2 } },
		{ mover: p2, placement: { x: 3, y: 0 } },
	]

	const result = winByConsecutiveDiagonalPlacements(
		{
			mover: p2,
			placement: { x: 1, y: 2 },
		},
		{
			moves: winningMoves,
			participants: [p1, p2],
		},
		{
			boardSize: 4,
			consecutiveTarget: 4,
		}
	)

	expect((result as GameWin).winningMoves).toEqual(expect.arrayContaining(winningMoves as Move[]))
})
