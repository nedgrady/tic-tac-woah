import { FormGroup, Button, Slider, Typography, Stack } from "@mui/material"
import { useState } from "react"
import AddPerson from "./add-person.svg?react"
import "./create-game-form.css"
import { ArrayIndex } from "types"

import { PropsOf } from "@emotion/react"
import { SelectionState, useSelectedDiff } from "./useSelectedDiff"

const maxHumanParticipants = 5
const noneSelected: never[] = []

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

	const { hoverOverEntity, selectEntity, selections, resetHover } = useSelectedDiff(maxHumanParticipants - 1)

	const participantCount = selections.filter(
		selection => selection === "remainsSelected" || selection == "tentativelySelected",
	).length

	return (
		<FormGroup>
			<Stack direction="row" spacing={2}>
				<p>You + {participantCount} other human(s)</p>
				{selections.map((selectionState, humanIndex) => (
					<Button
						key={humanIndex}
						onMouseEnter={() => hoverOverEntity(humanIndex)}
						onMouseLeave={resetHover}
						onClick={() => {
							selectEntity(humanIndex)
						}}
					>
						<AddPerson height={32} width={32} color={colorMap[selectionState]} />
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
						participantCount,
						consecutiveTarget,
					})
				}
			>
				Submit
			</Button>
		</FormGroup>
	)
}
