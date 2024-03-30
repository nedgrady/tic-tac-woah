import { expect, test } from "vitest"
import { BoardMove, selectBoardState } from "./gameSlice"
import { Move } from "./gameSlice"

test("All slots are initially null", () => {
	const boardState = selectBoardState({
		gameReducer: {
			game: {
				id: "Any Game",
				players: [],
				moves: [],
				winningMoves: [],
				draws: [],
			},
		},
	})

	// boardState should be a 20x20 array of nulls
	expect(boardState).toEqual(Array(20).fill(Array(20).fill(null)))
})

test("Moves are reflected in the board", () => {
	const move1: Move = {
		mover: "player1",
		placement: {
			x: 0,
			y: 0,
		},
	}

	const boardState = selectBoardState({
		gameReducer: {
			game: {
				id: "Any Game",
				players: [],
				moves: [move1],
				winningMoves: [],
				draws: [],
			},
		},
	})

	// boardState should be a 20x20 array of nulls
	expect(boardState[0][0]).toEqual<BoardMove>({
		placement: move1.placement,
		mover: move1.mover,
		isWinningMove: false,
	})
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
		gameReducer: {
			game: {
				id: "Any Game",
				players: [],
				moves: threeMoves,
				winningMoves: [],
				draws: [],
			},
		},
	})

	// boardState should be a 20x20 array of nulls
	expect(boardState[move.placement.x][move.placement.y]).toEqual<BoardMove>({
		placement: move.placement,
		mover: move.mover,
		isWinningMove: false,
	})
})

test("Other slots on the board remain null after a move", () => {
	const boardState = selectBoardState({
		gameReducer: {
			game: {
				id: "Any Game",
				players: [],
				moves: [
					{
						mover: "any player",
						placement: {
							x: 0,
							y: 0,
						},
					},
				],
				winningMoves: [],
				draws: [],
			},
		},
	})

	// boardState should be a 20x20 array of nulls
	expect(boardState[1]).toEqual(Array(20).fill(null))
})
