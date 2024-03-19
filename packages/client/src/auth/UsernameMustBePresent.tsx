import Button from "@mui/material/Button"
import { useCookies } from "react-cookie"
import { Dialog, DialogContent, FormControl, Stack, TextField } from "@mui/material"
import Grid from "@mui/material/Unstable_Grid2"
import { useState } from "react"

export function useInitiateTicTacWoahAuth() {
	const [cookies, setCookie] = useCookies(["tic-tac-woah-user"])

	// expose the username
	return [cookies["tic-tac-woah-user"], (username: string) => setCookie("tic-tac-woah-user", username)] as const
}

export function useTicTacWoahAuth() {
	const [cookies] = useCookies(["tic-tac-woah-user"])
	const username = cookies["tic-tac-woah-user"]

	return username
}

export function UserMustBeAuthenticated({ children }: React.PropsWithChildren) {
	const [auth, setAuth] = useInitiateTicTacWoahAuth()
	const [username, setUsername] = useState<string>("")

	// if (!auth) {
	// 	return (
	// 		<Dialog open={true}>
	// 			<DialogContent>
	// 				<Stack spacing={2}>
	// 					<FormControl component={Grid} padding={4}>
	// 						<TextField
	// 							required
	// 							value={username}
	// 							onChange={event => {
	// 								setUsername(event.target.value)
	// 							}}
	// 							label="Username"
	// 							variant="filled"
	// 						/>
	// 					</FormControl>

	// 					<Grid container spacing={1} flexDirection="row-reverse">
	// 						<Grid xs={6}>
	// 							<Button onClick={() => setAuth(username)} variant="outlined">
	// 								Submit
	// 							</Button>
	// 						</Grid>
	// 					</Grid>
	// 				</Stack>
	// 			</DialogContent>
	// 		</Dialog>
	// 	)
	// }

	return <>{children}</>
}
