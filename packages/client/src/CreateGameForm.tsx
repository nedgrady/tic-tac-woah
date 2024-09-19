import { FormGroup, Button, Slider, Typography, Stack } from "@mui/material"
import { useState } from "react"
import AddPerson from "./add-person.svg?react"
import AddBot from "./add-bot.svg?react"
import "./create-game-form.css"
import { PropsOf } from "@emotion/react"
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

const colorMap: Record<SelectionState, PropsOf<typeof AddPerson>["color"]> = {
	remainsUnselected: "inherit",
	remainsSelected: "lightgreen",
	tentativelySelected: "darkgreen",
	tentativelyUnselected: "darkred",
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
				{humanSelections.map((selectionState, humanIndex) => (
					<Button
						key={humanIndex}
						onMouseEnter={() => hoverOverHuman(humanIndex)}
						onMouseLeave={resetHumanHover}
						onClick={() => {
							selectHuman(humanIndex)
						}}
					>
						<AddPerson height={32} width={32} color={colorMap[selectionState]} />
					</Button>
				))}
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
						<AddBot height={32} width={32} color={colorMap[selectionState]} />
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
									<div style={{ color: colorMap[selectionState] }}>x</div>
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
