import Box from "@mui/material/Box"
import React from "react"
import styled from "styled-components"
import { Move } from "./redux/gameSlice"
import { BoardMoveDisplay, EmptyBoardMoveDisplay } from "./game/Game"

const Table = styled.table`
	border-collapse: collapse;
`
const Td = styled.td`
	vertical-align: middle;
	text-align: center;

	border-width: 1px 1px 1px 1px;
	border-style: solid;
`
interface BoardProps {
	boardState: readonly (BoardMoveDisplay | EmptyBoardMoveDisplay)[][]
	onPiecePlaced: (x: number, y: number) => void
	limitingDimensionInPixels: number
}

export default function Board({ boardState, onPiecePlaced, limitingDimensionInPixels }: BoardProps) {
	const sizeOfSquareInPixels = `${limitingDimensionInPixels / boardState.length}px`
	const fontSizeForSquare = `${limitingDimensionInPixels / boardState.length / 2 - 1}px`
	const css: React.CSSProperties = {
		width: sizeOfSquareInPixels,
		height: sizeOfSquareInPixels,
		maxWidth: sizeOfSquareInPixels,
		maxHeight: sizeOfSquareInPixels,
		minWidth: sizeOfSquareInPixels,
		minHeight: sizeOfSquareInPixels,
		fontSize: fontSizeForSquare,
	}

	return (
		<Table style={{ width: `${limitingDimensionInPixels}px`, height: `${limitingDimensionInPixels}px` }}>
			<tbody>
				{boardState.map((row, rowIndex) => (
					<tr key={rowIndex}>
						{row.map((piece, columnIndex) => (
							<Td
								key={`${columnIndex}-${rowIndex}`}
								data-testid={`square-${columnIndex}-${rowIndex}`}
								onClick={() => onPiecePlaced(rowIndex, columnIndex)}
								style={css}
							>
								<Box
									key={`${columnIndex}-${rowIndex}`}
									sx={piece.isWinningMove ? { backgroundColor: "green" } : undefined}
								>
									{piece.token}
								</Box>
							</Td>
						))}
					</tr>
				))}
			</tbody>
		</Table>
	)
}
