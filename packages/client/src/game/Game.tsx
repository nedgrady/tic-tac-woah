import { useSelector } from "react-redux"
import { Coordinate, Move, newMove, selectBoardState } from "../redux/gameSlice"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import React, { useState } from "react"
import styled from "styled-components"
import { useElementSize } from "usehooks-ts"
import Board from "../Board"
import { useMakeMove } from "../useMakeMove"
import { useTicTacWoahSocket } from "../ticTacWoahSocket"
import useSocketState from "../useSocketState"
import { MoveDtoSchema } from "types"
import { useEffectOnce } from "react-use"

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

function useGameDisplay() {
	const { game } = useAppSelector(state => state.gameReducer)
	const boardState = useAppSelector(selectBoardState)

	const tokensPlusEmpty = ["", ...tokens]
	const playerPlusEmpty = [null, ...game.players]

	const playerTokens = new Map<string | null, Token>(
		playerPlusEmpty.map((player, index) => [player, tokensPlusEmpty[index]])
	)

	// TODO - how to remove the undefined from the type?
	const board: readonly (string | undefined)[][] = boardState.map(row => row.map(cell => playerTokens.get(cell)))

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
		})

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
