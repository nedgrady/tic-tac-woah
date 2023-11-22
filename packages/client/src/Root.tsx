import { Container } from "@mui/material"
import { Outlet } from "@tanstack/react-router"
import { Header } from "./Header"

export function Root() {
	return (
		<>
			<Header />
			<Container>
				<Outlet />
			</Container>
		</>
	)
}
