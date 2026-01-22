import { FormGroup, Button, Typography, Grid, Switch, FormControlLabel } from "@mui/material"
import { ReactNode } from "react"
import { SelectionState, useSelectedDiff } from "../useSelectedDiff"
import styled from "styled-components"
import { useSwitch } from "../useSwitch"
import { BotParticipant } from "./participants/BotParticipant"
import { HumanParticipant } from "./participants/HumanParticipant"
import { plus, controller, cross, lock } from "./participants/actionIcons"

const maxHumanParticipants = 5
const maxBotParticipants = 2

const Table = styled.table`
	border-collapse: collapse;
	border-style: hidden;
	max-width: 100vw;
	width: 300px;
`
const Td = styled.td`
	border: 1px solid white;
	height: 50px;
	max-height: 50px;
	padding: 0;
`

const DummyTd = styled.td`
	border: 1px solid white;
	width: 15px;
	height: 15px;
`

const StyledGrid = styled(Grid)`
	margin-bottom: 20px;
`

const ButtonContainer = styled.div`
	display: flex;
	align-items: center;
`

export interface CreateGameSettings {
	participantCount: number
	consecutiveTarget: number
	botCount: number
}

interface CreateGameProps {
	onCreate: (settings: CreateGameSettings) => void
}

const iconMap: Record<SelectionState, ReactNode> = {
	remainsUnselected: plus,
	remainsSelected: controller,
	tentativelySelected: controller,
	tentativelyUnselected: cross,
}

const colorMap: Record<SelectionState, string> = {
	remainsUnselected: "#808080",
	remainsSelected: "#57b757",
	tentativelySelected: "#2626b0",
	tentativelyUnselected: "#808080",
}

export function CreateGameForm({ onCreate }: CreateGameProps) {
	const {
		hoverOverEntity: hoverOverHuman,
		selectEntity: selectHuman,
		selections: humanSelections,
		resetHover: resetHumanHover,
		resetSelections: resetHumanSelections,
	} = useSelectedDiff(maxHumanParticipants - 1) // -1 for the user

	const humanCount = humanSelections.filter(
		selection => selection === "remainsSelected" || selection == "tentativelySelected",
	).length

	const { checked: botsEnabled, handleChange: setBotsEnabled } = useSwitch(false)

	const {
		hoverOverEntity: hoverOverBot,
		selectEntity: selectBot,
		selections: botSelections,
		resetHover: resetBotHover,
	} = useSelectedDiff(maxBotParticipants)

	const botCount = botSelections.filter(
		selection => selection === "remainsSelected" || selection == "tentativelySelected",
	).length

	const {
		hoverOverEntity: hoverOverConsecutiveTarget,
		resetHover: resetConsecutiveTargetHover,
		selectEntity: selectConsecutiveTarget,
		selections: consecutiveTargetSelections,
	} = useSelectedDiff(5, 2)

	const consecutiveTarget = consecutiveTargetSelections.filter(
		selection => selection === "remainsSelected" || selection == "tentativelySelected",
	).length

	return (
		<FormGroup>
			<StyledGrid container spacing={2} alignItems="center">
				<Grid item xs={12} sm={4}>
					<Typography>Human Participants</Typography>
				</Grid>
				<Grid item xs={12} sm={8}>
					<ButtonContainer>
						<Button key="user" onMouseEnter={() => hoverOverHuman(-1)} onClick={resetHumanSelections}>
							<HumanParticipant fill={colorMap["remainsSelected"]} actionIcon={lock} />
						</Button>

						{humanSelections.map((selectionState, humanIndex) => (
							<Button
								key={humanIndex}
								onMouseEnter={() => hoverOverHuman(humanIndex)}
								onMouseLeave={resetHumanHover}
								onClick={() => selectHuman(humanIndex)}
							>
								<HumanParticipant
									fill={colorMap[selectionState]}
									actionIcon={iconMap[selectionState]}
								/>
							</Button>
						))}
					</ButtonContainer>
				</Grid>
			</StyledGrid>

			<StyledGrid container spacing={2} alignItems="center">
				<Grid item xs={12} sm={4}>
					<Typography>Consecutive Target</Typography>
				</Grid>
				<Grid item xs={12} sm={8}>
					<Table>
						<tbody>
							<tr>
								<DummyTd></DummyTd>
								<DummyTd></DummyTd>
								<DummyTd></DummyTd>
								<DummyTd></DummyTd>
								<DummyTd></DummyTd>
							</tr>
							<tr>
								{consecutiveTargetSelections.map((selectionState, consecutiveTargetIndex) => (
									<Td key={consecutiveTargetIndex}>
										<Button
											onClick={() => selectConsecutiveTarget(consecutiveTargetIndex)}
											onMouseEnter={() => hoverOverConsecutiveTarget(consecutiveTargetIndex)}
											onMouseLeave={resetConsecutiveTargetHover}
											fullWidth
										>
											<div
												style={{
													fontSize: "x-large",
												}}
											>
												{selectionState === "remainsSelected" ||
												selectionState === "tentativelySelected"
													? "❎"
													: " "}
											</div>
										</Button>
									</Td>
								))}
							</tr>
							<tr>
								<DummyTd></DummyTd>
								<DummyTd></DummyTd>
								<DummyTd></DummyTd>
								<DummyTd></DummyTd>
								<DummyTd></DummyTd>
							</tr>
						</tbody>
					</Table>
				</Grid>
			</StyledGrid>

			<StyledGrid container spacing={2} alignItems="center">
				<Grid item xs={12} sm={4}>
					<FormControlLabel
						sx={{ marginLeft: "4px" }}
						control={
							<Switch
								value={botsEnabled}
								onChange={setBotsEnabled}
								sx={{
									"&.MuiSwitch-root .MuiSwitch-track": {
										backgroundColor: botsEnabled ? colorMap["remainsSelected"] : "none",
									},
									"&.MuiSwitch-root .Mui-checked": {
										color: colorMap["remainsSelected"],
									},
								}}
							/>
						}
						label="Bots"
						labelPlacement="start"
					/>
				</Grid>
				<Grid item xs={12} sm={8}>
					{botsEnabled && (
						<ButtonContainer>
							{botSelections.map((selectionState, botIndex) => (
								<Button
									key={botIndex}
									onMouseEnter={() => hoverOverBot(botIndex)}
									onMouseLeave={resetBotHover}
									onClick={() => selectBot(botIndex)}
								>
									<BotParticipant
										fill={colorMap[selectionState]}
										actionIcon={iconMap[selectionState]}
									/>
								</Button>
							))}
						</ButtonContainer>
					)}
				</Grid>
			</StyledGrid>

			<Button
				variant="contained"
				color="success"
				size="large"
				onClick={() =>
					onCreate({
						participantCount: humanCount + 1, // +1 for the user
						botCount: botsEnabled ? botCount : 0,
						consecutiveTarget,
					})
				}
			>
				Create Game
			</Button>
		</FormGroup>
	)
}
