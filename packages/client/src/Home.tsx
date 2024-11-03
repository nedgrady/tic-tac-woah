import { Grid } from "@mui/material"
import { ButtonLink } from "./Link"

export function Home() {
	return (
		<Grid container justifyContent="center" height="100%">
			<Grid>Tic tac toe, with more ways to go!</Grid>
			<Grid item>
				<ButtonLink to="/play" variant="contained" color="success" size="large">
					Play Now
				</ButtonLink>
			</Grid>
		</Grid>
	)
}
