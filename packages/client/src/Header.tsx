import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Toolbar from "@mui/material/Toolbar"
import { Link } from "./Link"

export function Header() {
	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position="static">
				<Toolbar>
					<Link to="/" variant="h6" sx={{ flexGrow: 1 }} underline="none" params={{ ned: 1 }}>
						Tic Tac WOAH!
					</Link>
					<a href="https://github.com/nedgrady/tic-tac-woah" target="_blank" rel="noopener noreferrer">
						<img src="github-mark-white.svg" height="32px"></img>
					</a>
				</Toolbar>
			</AppBar>
		</Box>
	)
}
