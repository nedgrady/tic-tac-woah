import { useSelector } from "react-redux"
import { Coordinate, Move, newMove, selectBoardState, selectWinningMoves, gameWin } from "../redux/gameSlice"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import React, { useState } from "react"
import styled from "styled-components"
import { useElementSize } from "usehooks-ts"
import Board from "../Board"
import { useMakeMove } from "../useMakeMove"
import { useTicTacWoahSocket } from "../ticTacWoahSocket"
import useSocketState from "../useSocketState"
import { GameWinSchema, MoveDtoSchema } from "types"
import { useEffectOnce } from "react-use"
import { boolean } from "zod"

const FlexyGameContainer = styled.div`
	@media all and (orientation: portrait) {
		display: flex;
		flex-direction: column;
	}

	@media all and (orientation: landscape) {
		display: flex;
		flex-direction: row;
	}

	text-align: center;
	flex-grow: 1;
	max-height: 99dvh;
`
type Token = string
const tokens: readonly Token[] = ["❌", "⭕", "🟥"]

export interface BoardMoveDisplay {
	readonly placement: Coordinate
	readonly token: string
	readonly isWinningMove: boolean
}

export interface EmptyBoardMoveDisplay {
	readonly token: ""
	readonly isWinningMove: false
}

const emptyBoardMoveDisplay: EmptyBoardMoveDisplay = {
	isWinningMove: false,
	token: "",
}

function useGameDisplay(): { board: readonly (BoardMoveDisplay | EmptyBoardMoveDisplay)[][] } {
	const { game } = useAppSelector(state => state.gameReducer)
	const boardState = useAppSelector(selectBoardState)

	const tokensPlusEmpty = [...tokens]
	const playerPlusEmpty = [...game.players]

	const playerTokens = new Map<string, Token>(
		playerPlusEmpty.map((player, index) => [player, tokensPlusEmpty[index]])
	)

	// TODO - how to remove the undefined from the type?
	const board: readonly (BoardMoveDisplay | EmptyBoardMoveDisplay)[][] = boardState.map(row =>
		row.map(cell =>
			cell
				? {
						placement: cell.placement,
						// TODO - the '?' scenario should never happen but how to get the types working without it?
						token: playerTokens.get(cell.mover) ?? "?",
						isWinningMove: cell.isWinningMove,
				  }
				: emptyBoardMoveDisplay
		)
	)

	return { board }
}

export function Game() {
	const { board } = useGameDisplay()
	const makeMove = useMakeMove()

	const dispatch = useAppDispatch()

	const [elementSizeRef, { width, height }] = useElementSize()
	const limitingDimensionInPixels = Math.min(width, height)

	const socket = useTicTacWoahSocket()

	useEffectOnce(() => {
		socket.on("move", args => {
			const move = MoveDtoSchema.parse(args)
			dispatch(newMove(move))
		})

		socket.on("game win", args => {
			console.log("game win", args)
			const gameWinObj = GameWinSchema.parse(args)
			dispatch(gameWin(gameWinObj))
		})

		// TODO - how to remove this duplication?
		return () => {
			socket.off()
		}
	})

	return (
		<FlexyGameContainer ref={elementSizeRef}>
			<Board
				boardState={board}
				onPiecePlaced={(x, y) => makeMove({ x, y })}
				limitingDimensionInPixels={limitingDimensionInPixels || 1000}
			/>
		</FlexyGameContainer>
	)
}
