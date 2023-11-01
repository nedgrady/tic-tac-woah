import { expect, test } from "vitest"
import { Move, selectBoardState } from "./boardSlice"

test("All slots are initially null", () => {
	const boardState = selectBoardState({
		movesReducer: {
			moves: [],
		},
	})

	// boardState should be a 20x20 array of nulls
	expect(boardState).toEqual(Array(20).fill(Array(20).fill(null)))
})

test("Moves are reflected in the board", () => {
	const boardState = selectBoardState({
		movesReducer: {
			moves: [
				{
					mover: "player1",
					placement: {
						x: 0,
						y: 0,
					},
				},
			],
		},
	})

	// boardState should be a 20x20 array of nulls
	expect(boardState[0][0]).toEqual("player1")
})

const threeMoves: Move[] = [
	{
		mover: "player1",
		placement: {
			x: 0,
			y: 0,
		},
	},
	{
		mover: "player2",
		placement: {
			x: 1,
			y: 1,
		},
	},
	{
		mover: "player3",
		placement: {
			x: 2,
			y: 2,
		},
	},
]

test.each(threeMoves)("Move $placement by $mover is reflected in the board", move => {
	const boardState = selectBoardState({
		movesReducer: {
			moves: threeMoves,
		},
	})

	// boardState should be a 20x20 array of nulls
	expect(boardState[move.placement.x][move.placement.y]).toEqual(move.mover)
})

test("Other slots on the board remain null after a move", () => {
	const boardState = selectBoardState({
		movesReducer: {
			moves: [
				{
					mover: "any player",
					placement: {
						x: 0,
						y: 0,
					},
				},
			],
		},
	})

	// boardState should be a 20x20 array of nulls
	expect(boardState[1]).toEqual(Array(20).fill(null))
})
