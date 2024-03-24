import { Move } from "domain/Move"
import { createMoves, createParticipants } from "domain/gameTestHelpers"
import { expect, it } from "vitest"
import { gameIsDrawnWhenBoardIsFull } from "./drawConditions"

it("When the board is full, the game is a draw", () => {
	const finalMove: Move = {
		mover: "p1",
		placement: { x: 0, y: 0 },
	}

	const [p1, p2] = createParticipants(2)

	const gameMovesSoFar = createMoves([
		[p1, p2, p2],
		[p2, p1, p2],
		[p1, p2, p1],
	])

	const { result } = gameIsDrawnWhenBoardIsFull(
		finalMove,
		{
			moves: gameMovesSoFar,
			participants: [p1, p2],
		},
		{
			boardSize: 3,
			consecutiveTarget: 3,
		}
	)

	expect(result).toBe("draw")
})

it("When the board is full, the game is a draw 2", () => {
	const finalMove: Move = {
		mover: "p1",
		placement: { x: 0, y: 0 },
	}

	const [p1, p2] = createParticipants(2)

	const gameMovesSoFar = createMoves([
		[p1, p2],
		[p2, p1],
	])

	const { result } = gameIsDrawnWhenBoardIsFull(
		finalMove,
		{
			moves: gameMovesSoFar,
			participants: [p1, p2],
		},
		{
			boardSize: 2,
			consecutiveTarget: 2,
		}
	)

	expect(result).toBe("draw")
})

it("When the board is full, the game continues", () => {
	const finalMove: Move = {
		mover: "p1",
		placement: { x: 0, y: 0 },
	}

	const [p1, p2] = createParticipants(2)

	const gameMovesSoFar = createMoves([
		[p1, p2, p2],
		[p2, p1, p2],
		[p1, p2, ""],
	])

	const { result } = gameIsDrawnWhenBoardIsFull(
		finalMove,
		{
			moves: gameMovesSoFar,
			participants: [p1, p2],
		},
		{
			boardSize: 3,
			consecutiveTarget: 3,
		}
	)

	expect(result).toBe("continues")
})
