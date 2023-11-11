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

export interface GameState {
	readonly players: string[]
	readonly id: string
	readonly moves: Move[]
}

const initialState: GameState = {
	id: "Empty Game",
	moves: [],
	players: [],
}

export const gameSlice = createSlice({
	name: "game",
	initialState,
	// The `reducers` field lets us define reducers and generate associated actions
	reducers: {
		// Use the PayloadAction type to declare the contents of `action.payload`
		startGame: (state, action: PayloadAction<GameStart>) => {
			state.id = action.payload.id
			state.players = action.payload.players
			state.moves = []
		},
		newMove: (state, action: PayloadAction<Move>) => {
			state.moves = [...state.moves, action.payload]
		},
	},
})

export const { startGame, newMove } = gameSlice.actions

export function selectBoardState(state: RootState): readonly (string | null)[][] {
	const board = Array(20)
		.fill(null)
		.map(() => Array(20).fill(null))

	for (const move of state.gameReducer.moves) {
		board[move.placement.x][move.placement.y] = move.mover
	}
	return board
}

export default gameSlice.reducer
