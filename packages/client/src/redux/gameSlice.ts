import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "./store"
import { GameStartDto } from "types"

export type GameStart = GameStartDto
export type Move = {
	mover: string
	placement: Coordinate
}

export type Coordinate = {
	readonly x: number
	readonly y: number
}

export type GameState = { game: PopulatedGame | EmptyGame }

type EmptyGame = {
	readonly id: "Empty Game"
	readonly moves: []
	readonly players: []
	readonly winningMoves: []
}

type PopulatedGame = {
	readonly id: string
	readonly players: string[]
	readonly moves: Move[]
	readonly winningMoves: Move[]
}

const initialState: GameState = {
	game: {
		id: "Empty Game",
		moves: [],
		players: [],
		winningMoves: [],
	},
}

export interface GameWin {
	winningMoves: Move[]
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
				winningMoves: [],
			}
		},
		newMove: (state, action: PayloadAction<Move>) => {
			state.game.moves = [...state.game.moves, action.payload]
		},
		gameWin: (state, action: PayloadAction<GameWin>) => {
			state.game.winningMoves = action.payload.winningMoves
		},
	},
})

export const { startGame, newMove, gameWin } = gameSlice.actions

interface BoardMove {
	placement: Coordinate
	mover: string
	isWinningMove: boolean
}

export function selectBoardState(state: RootState): readonly (BoardMove | null)[][] {
	const board: (BoardMove | null)[][] = Array(20)
		.fill(null)
		.map(() => Array(20).fill(null))

	for (const move of state.gameReducer.game.moves) {
		board[move.placement.x][move.placement.y] = {
			placement: move.placement,
			mover: move.mover,
			isWinningMove: false,
		}
	}

	for (const move of state.gameReducer.game.winningMoves) {
		board[move.placement.x][move.placement.y] = {
			placement: move.placement,
			mover: move.mover,
			isWinningMove: true,
		}
	}

	return board
}

export function selectWinningMoves(state: RootState): Move[] {
	return state.gameReducer.game.winningMoves
}

export default gameSlice.reducer
