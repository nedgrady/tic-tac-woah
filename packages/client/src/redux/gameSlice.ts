import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "./store"
import { GameStartDto, MoveDto } from "types"

export type GameStart = GameStartDto
export type Move = {
	mover: string
	placement: Coordinate
}

export type Coordinate = {
	x: number
	y: number
}

export type GameState = { game: PopulatedGame | EmptyGame }

type EmptyGame = {
	readonly id: "Empty Game"
	readonly moves: []
	readonly players: []
}

type PopulatedGame = {
	readonly id: string
	readonly players: string[]
	readonly moves: Move[]
}

const initialState: GameState = {
	game: {
		id: "Empty Game",
		moves: [],
		players: [],
	},
}

export const gameSlice = createSlice({
	name: "game",
	initialState,
	// The `reducers` field lets us define reducers and generate associated actions
	reducers: {
		// Use the PayloadAction type to declare the contents of `action.payload`
		startGame: (state, action: PayloadAction<GameStart>) => {
			state.game = {
				id: action.payload.id,
				players: action.payload.players,
				moves: [],
			}
		},
		newMove: (state, action: PayloadAction<Move>) => {
			state.game.moves = [...state.game.moves, action.payload]
		},
	},
})

export const { startGame, newMove } = gameSlice.actions

export function selectBoardState(state: RootState): readonly (string | null)[][] {
	const board = Array(20)
		.fill(null)
		.map(() => Array(20).fill(null))

	for (const move of state.gameReducer.game.moves) {
		board[move.placement.x][move.placement.y] = move.mover
	}
	return board
}

export default gameSlice.reducer
