import { FormGroup, Button, Slider, Typography, Stack } from "@mui/material"
import { useState } from "react"
import AddPerson from "./add-person.svg?react"
import AddBot from "./add-bot.svg?react"
import "./create-game-form.css"
import { PropsOf } from "@emotion/react"
import { SelectionState, useSelectedDiff } from "./useSelectedDiff"

const maxHumanParticipants = 5
const maxBotParticipants = 5

export interface CreateGameSettings {
	participantCount: number
	consecutiveTarget: number
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
	const [consecutiveTarget, setConsecutiveTarget] = useState(4)

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
				Consecutive Target
			</Typography>
			<Slider
				aria-labelledby="consecutive-target"
				valueLabelDisplay="auto"
				step={1}
				marks
				min={3}
				max={6}
				onChange={(_, value) => setConsecutiveTarget(value as number)}
				value={consecutiveTarget}
			/>
			<Button
				variant="contained"
				color="primary"
				onClick={() =>
					onCreate({
						participantCount: humanCount,
						consecutiveTarget,
					})
				}
			>
				Submit
			</Button>
		</FormGroup>
	)
}
