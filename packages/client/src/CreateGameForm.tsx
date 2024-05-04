import { FormGroup, Button, Slider, Typography } from "@mui/material"
import { useState } from "react"
export interface CreateGameSettings {
	participantCount: number
	consecutiveTarget: number
}

interface CreateGameProps {
	onCreate: (settings: CreateGameSettings) => void
}

export function CreateGameForm({ onCreate }: CreateGameProps) {
	const [participantCount, setParticpantCount] = useState(3)
	const [consecutiveTarget, setConsecutiveTarget] = useState(4)
	return (
		<FormGroup>
			<Typography id="participant-count-slider" gutterBottom>
				Participant Count
			</Typography>

			<Slider
				aria-labelledby="participant-count-slider"
				valueLabelDisplay="auto"
				step={1}
				marks
				min={2}
				max={10}
				onChange={(_, value) => setParticpantCount(value as number)}
				value={participantCount}
			/>

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
