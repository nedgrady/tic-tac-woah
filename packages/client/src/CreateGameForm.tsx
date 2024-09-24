import { FormGroup, Button, Typography, Grid, Paper, Switch, Stack, FormControlLabel } from "@mui/material"
import { PropsWithChildren, ReactNode, useState } from "react"
import { SelectionState, useSelectedDiff } from "./useSelectedDiff"
import styled from "styled-components"

function useSwitch(initialState: boolean) {
	const [checked, setChecked] = useState(initialState)

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setChecked(event.target.checked)
	}

	return { checked, handleChange } as const
}

const maxHumanParticipants = 5
const maxBotParticipants = 5

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

const SummaryPaper = styled(Paper)`
	padding: 16px;
	margin-top: 20px;
	margin-bottom: 20px;
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

const plus = (
	<path d="M19.84,14.38a3.87,3.87,0,0,0-.49-.05l-.19,0c-.2,0-.41,0-.61.06a4.42,4.42,0,0,0-2.64,7.17,4.38,4.38,0,0,0,.41.45,4.15,4.15,0,0,0,.52.42,4.44,4.44,0,1,0,3-8.07Zm1.8,4.94H19.88v1.76s0,.05,0,.08a.53.53,0,0,1-.52.45.41.41,0,0,1-.16,0,.52.52,0,0,1-.36-.42.24.24,0,0,1,0-.08V19.32H17.05a.54.54,0,1,1,0-1.07h1.76V16.49a.54.54,0,0,1,.54-.54l.12,0a.52.52,0,0,1,.41.51v1.76h1.76a.54.54,0,1,1,0,1.07Z" />
)

const cross = (
	<path d="M19.76,14.36a3.87,3.87,0,0,0-.49,0l-.17,0a4.07,4.07,0,0,0-.61.06,4.4,4.4,0,0,0-3.62,4.33,4.6,4.6,0,0,0,1.41,3.21,4.06,4.06,0,0,0,.51.42,4.34,4.34,0,0,0,2.48.77,4.39,4.39,0,0,0,.49-8.76ZM21,17.73l-.48.49-.5.5.5.5.43.42.41.42a.54.54,0,0,1,0,.76A.53.53,0,0,1,21,21a.55.55,0,0,1-.38-.15l-.24-.25L20,20.19l-.38-.38-.35-.34-1.34,1.35a.62.62,0,0,1-.17.11h0a.41.41,0,0,1-.19,0,.53.53,0,0,1-.38-.91l1.35-1.34-1.35-1.35a.54.54,0,0,1,0-.75.54.54,0,0,1,.76,0L19.27,18l.6-.59.44-.44.31-.31a.42.42,0,0,1,.12-.08.51.51,0,0,1,.63.08.53.53,0,0,1,0,.75Z" />
)

const controller = (
	<path
		transform="scale(0.8) translate(6, 3)"
		d="M23.48,19.23a6.78,6.78,0,0,0-.64-1.74,1.74,1.74,0,0,0-1.57-1.12,4.33,4.33,0,0,0-.95.15l-.3.07-.21.05-.5.12a7.34,7.34,0,0,1-.92.15h-.26a10,10,0,0,1-1.65-.31,5,5,0,0,0-1.28-.24c-.44,0-1,.13-1.56,1.13A6.93,6.93,0,0,0,13,19.23a10.55,10.55,0,0,0-.33,2.16v.14a4.66,4.66,0,0,0,0,.53,3,3,0,0,0,.07.52,1,1,0,0,0,.07.24.45.45,0,0,0,.21.26l.12,0a1.34,1.34,0,0,0,.4-.09,4.58,4.58,0,0,0,1.05-.66c.23-.18.46-.38.72-.62l.1-.07a4.42,4.42,0,0,1,2.72-.87h.11a6.19,6.19,0,0,1,.88.06,3.68,3.68,0,0,1,2.05.92,6.49,6.49,0,0,0,1.78,1.28.74.74,0,0,0,.5.06s.12,0,.21-.26a3.39,3.39,0,0,0,.16-1.46A11.73,11.73,0,0,0,23.48,19.23Zm-3.16-1.62a.36.36,0,0,1,.12-.16s0,0,.06-.05a.53.53,0,0,1,.67.05.42.42,0,0,1,.11.16.51.51,0,0,1,0,.2.54.54,0,0,1-.15.38.56.56,0,0,1-.37.15.43.43,0,0,1-.22-.06.28.28,0,0,1-.14-.09.53.53,0,0,1-.12-.58Zm-.27.7.16.1a.5.5,0,0,1,.11.17.71.71,0,0,1,0,.2.54.54,0,0,1-.15.37.82.82,0,0,1-.17.11.4.4,0,0,1-.15,0l-.05,0a.65.65,0,0,1-.2,0,.87.87,0,0,1-.18-.11.25.25,0,0,1,0-.07.54.54,0,0,1-.1-.3.6.6,0,0,1,.14-.37l.07-.05A.57.57,0,0,1,20.05,18.31Zm-5.44.22H15V18.1a.52.52,0,1,1,1,0v.43h.43a.52.52,0,0,1,0,1h-.43V20a.52.52,0,1,1-1,0v-.43h-.43a.52.52,0,0,1,0-1Zm6.56,1.58a.49.49,0,0,1-.37.16.45.45,0,0,1-.36-.16.47.47,0,0,1-.16-.37.36.36,0,0,1,0-.1.5.5,0,0,1,.12-.24s0,0,0,0a.52.52,0,0,1,.73,0,.49.49,0,0,1,.15.36A.5.5,0,0,1,21.17,20.11Zm1-1a.62.62,0,0,1-.38.16.54.54,0,0,1-.36-.16.51.51,0,0,1-.16-.37.54.54,0,0,1,.16-.37.55.55,0,0,1,.74,0,.58.58,0,0,1,.15.37A.54.54,0,0,1,22.14,19.15Z"
	/>
)

const lock = (
	<path
		transform="translate(14.75, 14.75) scale(0.9)"
		d="M 5 10 C 6.921875 10 8.484375 8.4375 8.484375 6.515625 C 8.484375 5.613281 8.140625 4.789062 7.574219 4.171875 L 7.574219 2.574219 C 7.574219 1.15625 6.421875 0 5 0 C 3.578125 0 2.425781 1.15625 2.425781 2.574219 L 2.425781 4.171875 C 1.859375 4.789062 1.515625 5.613281 1.515625 6.515625 C 1.515625 8.4375 3.078125 10 5 10 Z M 5.453125 6.667969 L 5.453125 7.273438 C 5.453125 7.523438 5.25 7.726562 5 7.726562 C 4.75 7.726562 4.546875 7.523438 4.546875 7.273438 L 4.546875 6.667969 C 4.363281 6.527344 4.242188 6.308594 4.242188 6.0625 C 4.242188 5.644531 4.582031 5.304688 5 5.304688 C 5.417969 5.304688 5.757812 5.644531 5.757812 6.0625 C 5.757812 6.308594 5.636719 6.527344 5.453125 6.667969 Z M 3.332031 2.574219 C 3.332031 1.65625 4.082031 0.910156 5 0.910156 C 5.917969 0.910156 6.667969 1.65625 6.667969 2.574219 L 6.667969 3.457031 C 6.171875 3.183594 5.601562 3.03125 5 3.03125 C 4.398438 3.03125 3.828125 3.183594 3.332031 3.457031 Z M 3.332031 2.574219 "
	/>
)

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

	const { checked: botsEnabled, handleChange: setBotsEnabled } = useSwitch(true)

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
	} = useSelectedDiff(5)

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
						<Button
							key="user"
							onMouseEnter={resetHumanHover}
							onMouseLeave={resetHumanHover}
							onClick={resetHumanSelections}
						>
							<HumanParticipantPosition fill={colorMap["remainsSelected"]}>
								{lock}
							</HumanParticipantPosition>
						</Button>

						{humanSelections.map((selectionState, humanIndex) => (
							<Button
								key={humanIndex}
								onMouseEnter={() => hoverOverHuman(humanIndex)}
								onMouseLeave={resetHumanHover}
								onClick={() => selectHuman(humanIndex)}
							>
								<HumanParticipantPosition fill={colorMap[selectionState]}>
									{iconMap[selectionState]}
								</HumanParticipantPosition>
							</Button>
						))}
					</ButtonContainer>
				</Grid>
			</StyledGrid>

			<StyledGrid container spacing={2} alignItems="center">
				<Grid item xs={12} sm={4}>
					<Stack direction="row" alignItems={"center"}>
						<FormControlLabel
							control={
								<Switch
									defaultChecked
									value={botsEnabled}
									onChange={setBotsEnabled}
									sx={{
										"&.MuiSwitch-root .MuiSwitch-track": {
											backgroundColor: botsEnabled ? "#73af73" : "none",
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
					</Stack>
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
									<BotParticipantPosition fill={colorMap[selectionState]}>
										{iconMap[selectionState]}
									</BotParticipantPosition>
								</Button>
							))}
						</ButtonContainer>
					)}
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
													color: colorMap[selectionState],
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

			<SummaryPaper elevation={2}>
				<Typography variant="h6" gutterBottom>
					Game Summary
				</Typography>
				<Typography>
					You + {humanCount} other human(s), {botCount} bot(s)
				</Typography>
				<Typography>Consecutive Target: {consecutiveTarget}</Typography>
			</SummaryPaper>

			<Button
				variant="contained"
				color="primary"
				onClick={() =>
					onCreate({
						participantCount: humanCount + 1, // +1 for the user
						botCount,
						consecutiveTarget,
					})
				}
			>
				Create Game
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

interface BotParticipantPositionProps {
	children: ReactNode
	fill?: string
}

function BotParticipantPosition({ children, fill }: PropsWithChildren<BotParticipantPositionProps>) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill}>
			<path d="M5.65,13h12.7a2,2,0,0,0,2-2V3.57a2,2,0,0,0-2-2H5.65a2,2,0,0,0-2,2V11A2,2,0,0,0,5.65,13ZM5.43,4.82A1.47,1.47,0,0,1,6.89,3.35H17.11a1.47,1.47,0,0,1,1.46,1.47V9.75a1.47,1.47,0,0,1-1.46,1.47H6.89A1.47,1.47,0,0,1,5.43,9.75Z" />
			<path d="M6.89,10.18H17.11a.42.42,0,0,0,.42-.43V4.82a.42.42,0,0,0-.42-.42H6.89a.42.42,0,0,0-.42.42V9.75A.42.42,0,0,0,6.89,10.18Zm8.32-3.42a.53.53,0,0,1,1.05,0v1a.53.53,0,0,1-1.05,0Zm-7.47,0a.53.53,0,0,1,1,0v1a.53.53,0,0,1-1,0Z" />
			<path d="M.66,7.33a1.91,1.91,0,0,0,1.91,1.9h.05L2.57,5.42A1.91,1.91,0,0,0,.66,7.33Z" />
			<path d="M23.34,7.33a1.92,1.92,0,0,0-1.91-1.91h-.05V9.23h.05a1.93,1.93,0,0,0,1.35-.55A1.9,1.9,0,0,0,23.34,7.33Z" />
			<path d="M13.19,18.22A5.21,5.21,0,0,1,15.32,14H8.43a1.69,1.69,0,0,0-1.69,1.69v4.45a.08.08,0,0,0,.07.08h6.78A5.25,5.25,0,0,1,13.19,18.22Z" />
			{children}
		</svg>
	)
}
