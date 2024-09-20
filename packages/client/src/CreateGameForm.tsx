import { FormGroup, Button, Typography, Stack } from "@mui/material"
import { PropsWithChildren, ReactNode } from "react"
import "./create-game-form.css"
import { SelectionState, useSelectedDiff } from "./useSelectedDiff"
import styled from "styled-components"

const maxHumanParticipants = 5
const maxBotParticipants = 5

const Table = styled.table`
	border-collapse: collapse;
	border-style: hidden;
`
const Td = styled.td`
	border: 1px solid white;
`

// table {
//   outline: 2px solid white;
//   outline-offset: -2px;
// }
// table td {
//   outline: 2px solid black;
// }
export interface CreateGameSettings {
	participantCount: number
	consecutiveTarget: number
	botCount: number
}

interface CreateGameProps {
	onCreate: (settings: CreateGameSettings) => void
}

const plus = (
	<path
		className="plus cls-1"
		d="M19.84,14.38a3.87,3.87,0,0,0-.49-.05l-.19,0c-.2,0-.41,0-.61.06a4.42,4.42,0,0,0-2.64,7.17,4.38,4.38,0,0,0,.41.45,4.15,4.15,0,0,0,.52.42,4.44,4.44,0,1,0,3-8.07Zm1.8,4.94H19.88v1.76s0,.05,0,.08a.53.53,0,0,1-.52.45.41.41,0,0,1-.16,0,.52.52,0,0,1-.36-.42.24.24,0,0,1,0-.08V19.32H17.05a.54.54,0,1,1,0-1.07h1.76V16.49a.54.54,0,0,1,.54-.54l.12,0a.52.52,0,0,1,.41.51v1.76h1.76a.54.54,0,1,1,0,1.07Z"
	/>
)

const cross = (
	<path
		className="cross cls-1"
		d="M19.76,14.36a3.87,3.87,0,0,0-.49,0l-.17,0a4.07,4.07,0,0,0-.61.06,4.4,4.4,0,0,0-3.62,4.33,4.6,4.6,0,0,0,1.41,3.21,4.06,4.06,0,0,0,.51.42,4.34,4.34,0,0,0,2.48.77,4.39,4.39,0,0,0,.49-8.76ZM21,17.73l-.48.49-.5.5.5.5.43.42.41.42a.54.54,0,0,1,0,.76A.53.53,0,0,1,21,21a.55.55,0,0,1-.38-.15l-.24-.25L20,20.19l-.38-.38-.35-.34-1.34,1.35a.62.62,0,0,1-.17.11h0a.41.41,0,0,1-.19,0,.53.53,0,0,1-.38-.91l1.35-1.34-1.35-1.35a.54.54,0,0,1,0-.75.54.54,0,0,1,.76,0L19.27,18l.6-.59.44-.44.31-.31a.42.42,0,0,1,.12-.08.51.51,0,0,1,.63.08.53.53,0,0,1,0,.75Z"
	/>
)

// const controller = (
// 	<path
// 		className="cls-1"
// 		d="M23.48,19.23a6.78,6.78,0,0,0-.64-1.74,1.74,1.74,0,0,0-1.57-1.12,4.33,4.33,0,0,0-.95.15l-.3.07-.21.05-.5.12a7.34,7.34,0,0,1-.92.15h-.26a10,10,0,0,1-1.65-.31,5,5,0,0,0-1.28-.24c-.44,0-1,.13-1.56,1.13A6.93,6.93,0,0,0,13,19.23a10.55,10.55,0,0,0-.33,2.16v.14a4.66,4.66,0,0,0,0,.53,3,3,0,0,0,.07.52,1,1,0,0,0,.07.24.45.45,0,0,0,.21.26l.12,0a1.34,1.34,0,0,0,.4-.09,4.58,4.58,0,0,0,1.05-.66c.23-.18.46-.38.72-.62l.1-.07a4.42,4.42,0,0,1,2.72-.87h.11a6.19,6.19,0,0,1,.88.06,3.68,3.68,0,0,1,2.05.92,6.49,6.49,0,0,0,1.78,1.28.74.74,0,0,0,.5.06s.12,0,.21-.26a3.39,3.39,0,0,0,.16-1.46A11.73,11.73,0,0,0,23.48,19.23Zm-3.16-1.62a.36.36,0,0,1,.12-.16s0,0,.06-.05a.53.53,0,0,1,.67.05.42.42,0,0,1,.11.16.51.51,0,0,1,0,.2.54.54,0,0,1-.15.38.56.56,0,0,1-.37.15.43.43,0,0,1-.22-.06.28.28,0,0,1-.14-.09.53.53,0,0,1-.12-.58Zm-.27.7.16.1a.5.5,0,0,1,.11.17.71.71,0,0,1,0,.2.54.54,0,0,1-.15.37.82.82,0,0,1-.17.11.4.4,0,0,1-.15,0l-.05,0a.65.65,0,0,1-.2,0,.87.87,0,0,1-.18-.11.25.25,0,0,1,0-.07.54.54,0,0,1-.1-.3.6.6,0,0,1,.14-.37l.07-.05A.57.57,0,0,1,20.05,18.31Zm-5.44.22H15V18.1a.52.52,0,1,1,1,0v.43h.43a.52.52,0,0,1,0,1h-.43V20a.52.52,0,1,1-1,0v-.43h-.43a.52.52,0,0,1,0-1Zm6.56,1.58a.49.49,0,0,1-.37.16.45.45,0,0,1-.36-.16.47.47,0,0,1-.16-.37.36.36,0,0,1,0-.1.5.5,0,0,1,.12-.24s0,0,0,0a.52.52,0,0,1,.73,0,.49.49,0,0,1,.15.36A.5.5,0,0,1,21.17,20.11Zm1-1a.62.62,0,0,1-.38.16.54.54,0,0,1-.36-.16.51.51,0,0,1-.16-.37.54.54,0,0,1,.16-.37.55.55,0,0,1,.74,0,.58.58,0,0,1,.15.37A.54.54,0,0,1,22.14,19.15Z"
// 	/>
// )

// const controller = (
// 	<path
// 		className="cls-1"
// 		transform="scale(0.5)"
// 		d="M23.48,19.23a6.78,6.78,0,0,0-.64-1.74,1.74,1.74,0,0,0-1.57-1.12,4.33,4.33,0,0,0-.95.15l-.3.07-.21.05-.5.12a7.34,7.34,0,0,1-.92.15h-.26a10,10,0,0,1-1.65-.31,5,5,0,0,0-1.28-.24c-.44,0-1,.13-1.56,1.13A6.93,6.93,0,0,0,13,19.23a10.55,10.55,0,0,0-.33,2.16v.14a4.66,4.66,0,0,0,0,.53,3,3,0,0,0,.07.52,1,1,0,0,0,.07.24.45.45,0,0,0,.21.26l.12,0a1.34,1.34,0,0,0,.4-.09,4.58,4.58,0,0,0,1.05-.66c.23-.18.46-.38.72-.62l.1-.07a4.42,4.42,0,0,1,2.72-.87h.11a6.19,6.19,0,0,1,.88.06,3.68,3.68,0,0,1,2.05.92,6.49,6.49,0,0,0,1.78,1.28.74.74,0,0,0,.5.06s.12,0,.21-.26a3.39,3.39,0,0,0,.16-1.46A11.73,11.73,0,0,0,23.48,19.23Zm-3.16-1.62a.36.36,0,0,1,.12-.16s0,0,.06-.05a.53.53,0,0,1,.67.05.42.42,0,0,1,.11.16.51.51,0,0,1,0,.2.54.54,0,0,1-.15.38.56.56,0,0,1-.37.15.43.43,0,0,1-.22-.06.28.28,0,0,1-.14-.09.53.53,0,0,1-.12-.58Zm-.27.7.16.1a.5.5,0,0,1,.11.17.71.71,0,0,1,0,.2.54.54,0,0,1-.15.37.82.82,0,0,1-.17.11.4.4,0,0,1-.15,0l-.05,0a.65.65,0,0,1-.2,0,.87.87,0,0,1-.18-.11.25.25,0,0,1,0-.07.54.54,0,0,1-.1-.3.6.6,0,0,1,.14-.37l.07-.05A.57.57,0,0,1,20.05,18.31Zm-5.44.22H15V18.1a.52.52,0,1,1,1,0v.43h.43a.52.52,0,0,1,0,1h-.43V20a.52.52,0,1,1-1,0v-.43h-.43a.52.52,0,0,1,0-1Zm6.56,1.58a.49.49,0,0,1-.37.16.45.45,0,0,1-.36-.16.47.47,0,0,1-.16-.37.36.36,0,0,1,0-.1.5.5,0,0,1,.12-.24s0,0,0,0a.52.52,0,0,1,.73,0,.49.49,0,0,1,.15.36A.5.5,0,0,1,21.17,20.11Zm1-1a.62.62,0,0,1-.38.16.54.54,0,0,1-.36-.16.51.51,0,0,1-.16-.37.54.54,0,0,1,.16-.37.55.55,0,0,1,.74,0,.58.58,0,0,1,.15.37A.54.54,0,0,1,22.14,19.15Z"
// 	/>
// )

const controller = (
	<path
		className="cls-1"
		transform="scale(0.8) translate(6, 3)"
		d="M23.48,19.23a6.78,6.78,0,0,0-.64-1.74,1.74,1.74,0,0,0-1.57-1.12,4.33,4.33,0,0,0-.95.15l-.3.07-.21.05-.5.12a7.34,7.34,0,0,1-.92.15h-.26a10,10,0,0,1-1.65-.31,5,5,0,0,0-1.28-.24c-.44,0-1,.13-1.56,1.13A6.93,6.93,0,0,0,13,19.23a10.55,10.55,0,0,0-.33,2.16v.14a4.66,4.66,0,0,0,0,.53,3,3,0,0,0,.07.52,1,1,0,0,0,.07.24.45.45,0,0,0,.21.26l.12,0a1.34,1.34,0,0,0,.4-.09,4.58,4.58,0,0,0,1.05-.66c.23-.18.46-.38.72-.62l.1-.07a4.42,4.42,0,0,1,2.72-.87h.11a6.19,6.19,0,0,1,.88.06,3.68,3.68,0,0,1,2.05.92,6.49,6.49,0,0,0,1.78,1.28.74.74,0,0,0,.5.06s.12,0,.21-.26a3.39,3.39,0,0,0,.16-1.46A11.73,11.73,0,0,0,23.48,19.23Zm-3.16-1.62a.36.36,0,0,1,.12-.16s0,0,.06-.05a.53.53,0,0,1,.67.05.42.42,0,0,1,.11.16.51.51,0,0,1,0,.2.54.54,0,0,1-.15.38.56.56,0,0,1-.37.15.43.43,0,0,1-.22-.06.28.28,0,0,1-.14-.09.53.53,0,0,1-.12-.58Zm-.27.7.16.1a.5.5,0,0,1,.11.17.71.71,0,0,1,0,.2.54.54,0,0,1-.15.37.82.82,0,0,1-.17.11.4.4,0,0,1-.15,0l-.05,0a.65.65,0,0,1-.2,0,.87.87,0,0,1-.18-.11.25.25,0,0,1,0-.07.54.54,0,0,1-.1-.3.6.6,0,0,1,.14-.37l.07-.05A.57.57,0,0,1,20.05,18.31Zm-5.44.22H15V18.1a.52.52,0,1,1,1,0v.43h.43a.52.52,0,0,1,0,1h-.43V20a.52.52,0,1,1-1,0v-.43h-.43a.52.52,0,0,1,0-1Zm6.56,1.58a.49.49,0,0,1-.37.16.45.45,0,0,1-.36-.16.47.47,0,0,1-.16-.37.36.36,0,0,1,0-.1.5.5,0,0,1,.12-.24s0,0,0,0a.52.52,0,0,1,.73,0,.49.49,0,0,1,.15.36A.5.5,0,0,1,21.17,20.11Zm1-1a.62.62,0,0,1-.38.16.54.54,0,0,1-.36-.16.51.51,0,0,1-.16-.37.54.54,0,0,1,.16-.37.55.55,0,0,1,.74,0,.58.58,0,0,1,.15.37A.54.54,0,0,1,22.14,19.15Z"
	/>
)

const componentMap: Record<SelectionState, ReactNode> = {
	remainsUnselected: plus,
	remainsSelected: controller,
	tentativelySelected: controller,
	tentativelyUnselected: cross,
}

const colorMap: Record<SelectionState, string> = {
	remainsUnselected: "#808080", // grey
	remainsSelected: "#2626b0", // blue
	tentativelySelected: "#57b757", // lightblue
	tentativelyUnselected: "#c85d5d", // red
}

export function CreateGameForm({ onCreate }: CreateGameProps) {
	const {
		hoverOverEntity: hoverOverHuman,
		selectEntity: selectHuman,
		selections: humanSelections,
		resetHover: resetHumanHover,
	} = useSelectedDiff(maxHumanParticipants - 1)

	const humanCount = humanSelections.filter(
		selection => selection === "remainsSelected" || selection == "tentativelySelected",
	).length

	const {
		hoverOverEntity: hoverOverBot,
		selectEntity: selectBot,
		selections: botSelections,
		resetHover: resetBotHover,
	} = useSelectedDiff(maxBotParticipants - 1)

	const botCount = botSelections.filter(
		selection => selection === "remainsSelected" || selection == "tentativelySelected",
	).length

	const {
		hoverOverEntity: hoverOverConsecutiveTarget,
		resetHover: resetConsecutiveTargetHover,
		selectEntity: selectConsecutiveTarget,
		selections: consecutiveTargetSelections,
	} = useSelectedDiff(6)

	const consecutiveTarget = consecutiveTargetSelections.filter(
		selection => selection === "remainsSelected" || selection == "tentativelySelected",
	).length

	return (
		<FormGroup>
			<Stack direction="row" spacing={2}>
				<p>You + {humanCount} other human(s)</p>
				{humanSelections.map((selectionState, humanIndex) => {
					return (
						<Button
							key={humanIndex}
							onMouseEnter={() => hoverOverHuman(humanIndex)}
							onMouseLeave={resetHumanHover}
							onClick={() => {
								selectHuman(humanIndex)
							}}
						>
							<HumanParticipantPosition fill={colorMap[selectionState]}>
								{componentMap[selectionState]}
							</HumanParticipantPosition>
						</Button>
					)
				})}
			</Stack>
			<Stack direction="row" spacing={2}>
				<p>You + {botCount} other bots(s)</p>
				{botSelections.map((selectionState, botIndex) => (
					<Button
						key={botIndex}
						onMouseEnter={() => hoverOverBot(botIndex)}
						onMouseLeave={resetBotHover}
						onClick={() => {
							selectBot(botIndex)
						}}
					>
						{/* <AddBot height={32} width={32} color={colorMap[selectionState]} /> */}
					</Button>
				))}
			</Stack>
			<Typography id="consecutive-target" gutterBottom>
				Consecutive Target: {consecutiveTarget}
			</Typography>

			<Table>
				<tbody>
					<tr>
						<Td></Td>
						<Td></Td>
						<Td></Td>
						<Td></Td>
						<Td></Td>
						<Td></Td>
					</tr>
					<tr>
						{consecutiveTargetSelections.map((selectionState, consecutiveTargetIndex) => (
							<Td key={consecutiveTargetIndex}>
								<Button
									fullWidth
									onClick={() => selectConsecutiveTarget(consecutiveTargetIndex)}
									onMouseEnter={() => hoverOverConsecutiveTarget(consecutiveTargetIndex)}
									onMouseLeave={resetConsecutiveTargetHover}
								>
									<div style={{ color: "red" }}>x</div>
								</Button>
							</Td>
						))}
					</tr>
					<tr>
						<Td></Td>
						<Td></Td>
						<Td></Td>
						<Td></Td>
						<Td></Td>
						<Td></Td>
					</tr>
				</tbody>
			</Table>

			<Button
				variant="contained"
				color="primary"
				onClick={() =>
					onCreate({
						participantCount: 1,
						botCount,
						consecutiveTarget,
					})
				}
			>
				Submit
			</Button>
		</FormGroup>
	)
}

interface HumanParticipantPositionProps {
	children: ReactNode
	fill?: string
}

function HumanParticipantPosition({ children, fill }: PropsWithChildren<HumanParticipantPositionProps>) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill}>
			<path d="M13.82,18.78a5.51,5.51,0,0,1,4-5.27,9.85,9.85,0,0,0-3.52-2.27,6.49,6.49,0,0,1-8.2,0C2.61,12.57.2,15.52.2,19a1.41,1.41,0,0,0,.44,1,4.59,4.59,0,0,0,1.43.93,21.48,21.48,0,0,0,8.09,1.29,29.33,29.33,0,0,0,4.57-.34A5.48,5.48,0,0,1,13.82,18.78Z" />
			<path d="M4.73,6.2A5.42,5.42,0,0,0,6.31,10a4.83,4.83,0,0,0,.49.41,4.39,4.39,0,0,0,.56.4,5.3,5.3,0,0,0,5.6,0,5.23,5.23,0,0,0,.56-.4A4.83,4.83,0,0,0,14,10,5.42,5.42,0,1,0,4.73,6.2Z" />
			{children}
		</svg>
	)
}
