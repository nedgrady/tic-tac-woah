import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import movesReducer from "./boardSlice"

export const store = configureStore({
	reducer: {
		movesReducer: movesReducer,
	},
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>
