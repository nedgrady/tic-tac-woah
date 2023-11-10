// import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
// import { RootState, AppThunk } from "./store"
// import { Move } from "./gameSlice"

// export interface MovesState {
// 	moves: Move[]
// }

// const initialState: MovesState = {
// 	moves: [],
// }

// export const movesSlice = createSlice({
// 	name: "moves",
// 	initialState,
// 	// The `reducers` field lets us define reducers and generate associated actions
// 	reducers: {
// 		// Use the PayloadAction type to declare the contents of `action.payload`
// 		newMove: (state, action: PayloadAction<Move>) => {
// 			state.moves = [...state.moves, action.payload]
// 		},
// 	},
// })

// export const { newMove } = movesSlice.actions

// export const selectBoardState = (state: RootState) => {
// 	const board = Array(20)
// 		.fill(null)
// 		.map(() => Array(20).fill(null))

// 	for (const move of state.movesReducer.moves) {
// 		board[move.placement.x][move.placement.y] = move.mover
// 	}
// 	return board
// }

// // // We can also write thunks by hand, which may contain both sync and async logic.
// // // Here's an example of conditionally dispatching actions based on current state.
// // export const incrementIfOdd =
// // 	(amount: number): AppThunk =>
// // 	(dispatch, getState) => {
// // 		const currentValue = selectCount(getState())
// // 		if (currentValue % 2 === 1) {
// // 			dispatch(incrementByAmount(amount))
// // 		}
// // 	}

// export default movesSlice.reducer
