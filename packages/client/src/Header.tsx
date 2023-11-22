import * as React from "react"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import GitHubIcon from "@mui/icons-material/GitHub"

export function Header() {
	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position="static">
				<Toolbar>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						Tic Tac WOAH!
					</Typography>
					<a href="https://github.com/nedgrady/tic-tac-woah">
						<GitHubIcon />
					</a>
				</Toolbar>
			</AppBar>
		</Box>
	)
}
