import { Coordinate, newMove, selectBoardState, gameWin, selectWinningMoves, gameDraw } from "../redux/gameSlice"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import styled from "styled-components"
import { useElementSize } from "usehooks-ts"
import Board from "../Board"
import { useMakeMove } from "../useMakeMove"
import { useSocketHistory, useTicTacWoahSocket } from "../ticTacWoahSocket"
import { GameWinSchema, CompletedMoveDtoSchema, GameDrawDtoScehma } from "types"
import { useEffectOnce } from "react-use"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material"
import { useNavigate } from "@tanstack/react-router"
import { CreateGameSettings } from "../routes/queue.lazy"
import { ButtonLink } from "../Link"

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

	const playerTokens = new Map<string, Token>(game.players.map((player, index) => [player, tokens[index]]))

	// TODO - how to remove the undefined from the type?
	const board: readonly (BoardMoveDisplay | EmptyBoardMoveDisplay)[][] = boardState.map(row =>
		row.map(cell =>
			cell
				? {
						placement: cell.placement,
						// TODO - the '?' scenario should never happen but how to get the types working without it?
						token: playerTokens.get(cell.mover) ?? "?",
						isWinningMove: cell.isWinningMove,
						// eslint-disable-next-line no-mixed-spaces-and-tabs
					}
				: emptyBoardMoveDisplay,
		),
	)

	return { board }
}

export function Game() {
	const { board } = useGameDisplay()

	const dispatch = useAppDispatch()

	// TODO - useElementSize deprecated
	const [elementSizeRef, { width, height }] = useElementSize()
	const limitingDimensionInPixels = Math.min(width ?? 0, height ?? 0)

	const socket = useTicTacWoahSocket()

	useEffectOnce(() => {
		socket.on("moveMade", args => {
			const move = CompletedMoveDtoSchema.parse(args)
			dispatch(newMove(move))
		})

		socket.on("gameWin", args => {
			const gameWinObj = GameWinSchema.parse(args)
			dispatch(gameWin(gameWinObj))
		})

		socket.on("gameDraw", args => {
			const gameDrawDto = GameDrawDtoScehma.parse(args)
			console.log("gameDraw")
			dispatch(gameDraw(gameDrawDto))
		})

		// TODO - how to remove this duplication?
		return () => {
			socket.off()
		}
	})

	const winningMoves = useAppSelector(selectWinningMoves)
	const game = useAppSelector(state => state.gameReducer.game)
	const makeMove = useMakeMove(game.id)
	const navigate = useNavigate()

	const playerTokens = new Map<string, Token>(game.players.map((player, index) => [player, tokens[index]]))
	const winningToken = playerTokens.get(winningMoves[0]?.mover)

	const joinQueueRequestHistory = useSocketHistory("joinQueue")

	const lastCreateGameSettings: CreateGameSettings = {
		botCount: joinQueueRequestHistory[joinQueueRequestHistory.length - 1].aiCount,
		consecutiveTarget: joinQueueRequestHistory[joinQueueRequestHistory.length - 1].consecutiveTarget,
		participantCount: joinQueueRequestHistory[joinQueueRequestHistory.length - 1].humanCount,
	}
	return (
		<>
			<Dialog open={winningMoves.length > 0}>
				<DialogTitle>{winningMoves[0]?.mover} Wins</DialogTitle>
				<DialogContent>With the dubiously discovered token {winningToken}</DialogContent>
				<Stack direction="column" justifyItems="center" alignItems="center">
					<ButtonLink to="/queue" search={lastCreateGameSettings} fullWidth size="large">
						Play Again
					</ButtonLink>
					<ButtonLink to="/" fullWidth size="large">
						Home
					</ButtonLink>
				</Stack>
			</Dialog>
			<Dialog open={game.draws.length > 0}>
				<DialogTitle>Draw</DialogTitle>
				<DialogContent>Game drawn!</DialogContent>
				<Stack direction="column" justifyItems="center" alignItems="center">
					<ButtonLink to="/queue" search={lastCreateGameSettings} fullWidth size="large">
						Play Again
					</ButtonLink>
					<ButtonLink to="/" fullWidth size="large">
						Home
					</ButtonLink>
				</Stack>
			</Dialog>
			<FlexyGameContainer ref={elementSizeRef}>
				<Board
					boardState={board}
					onPiecePlaced={(x, y) => makeMove({ x, y })}
					limitingDimensionInPixels={limitingDimensionInPixels || 1000}
				/>
			</FlexyGameContainer>
		</>
	)
}
