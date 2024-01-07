import { useNavigate } from "@tanstack/react-router"
import Button from "@mui/material/Button"
import { useCookies } from "react-cookie"
import {
	Dialog,
	DialogContent,
	DialogTitle,
	FormControl,
	FormHelperText,
	Input,
	InputLabel,
	Stack,
	TextField,
} from "@mui/material"

import Grid from "@mui/material/Unstable_Grid2"
import { useState } from "react"

export function Home() {
	const navigate = useNavigate()

	return (
		<UsernameMustBePresent>
			<Button onClick={() => navigate({ to: "queue" })}>Play Now</Button>
		</UsernameMustBePresent>
	)
}

function PlayNowButton() {
	const navigate = useNavigate()
	return <Button onClick={() => navigate({ to: "queue" })}>Play Now</Button>
}

function UsernameMustBePresent({ children }: { children: React.ReactNode }) {
	const [cookies, setCookie] = useCookies(["tic-tac-woah-user"])
	const [username, setUsername] = useState<string>("")

	if (!cookies["tic-tac-woah-user"]) {
		return (
			<Dialog open={true}>
				<DialogContent>
					<Stack spacing={2}>
						<FormControl component={Grid} padding={4}>
							<TextField
								required
								value={username}
								onChange={event => {
									setUsername(event.target.value)
								}}
								label="Username"
								variant="filled"
							/>
						</FormControl>

						<Grid container spacing={1}>
							<Grid xs={6}>
								<Button onClick={() => setCookie("tic-tac-woah-user", username)} variant="outlined">
									Submit
								</Button>
							</Grid>
							<Grid xs={6}>
								<Button onClick={() => setCookie("tic-tac-woah-user", username)} variant="outlined">
									Cancel
								</Button>
							</Grid>
						</Grid>
					</Stack>
				</DialogContent>
			</Dialog>
		)
	}

	return <>{children}</>
}

// //*
// if (user) {
// 			setCookie("user", user, { path: "/" })
// 			return <>{children}</>
// 		}
// 		return null
//  **/
