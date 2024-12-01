import { expect, test } from "vitest"
import { createMoves } from "../gameTestHelpers"
import {
	GameRuleTestCase,
	moveOrderTestCases,
	moveBoundsTestCases,
	moveMustBeMadeIntoAFreeSquareTestCases,
} from "./gameRuleTestCases"

export const moveRuleTestCases: readonly GameRuleTestCase[] = [
	...moveOrderTestCases,
	...moveBoundsTestCases,
	...moveMustBeMadeIntoAFreeSquareTestCases,
]

test.each(moveRuleTestCases)(
	"Testing rule '$rule' with move '$move' return $expectedRuleResult",
	({ rule, move, board, participants, expectedRuleResult, boardSize }) => {
		const isMoveAllowed = rule(
			move,
			{
				moves: createMoves(board),
				participants: participants,
			},
			{ boardSize: boardSize, consecutiveTarget: 3 },
		)

		expect(isMoveAllowed).toBe(expectedRuleResult)
	},
)
