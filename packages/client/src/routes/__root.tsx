import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { Header } from "../Header"
import { Container } from "@mui/material"

export const Route = createRootRoute({
	component: () => (
		<>
			<Header />
			<Container>
				<Outlet />
			</Container>
			<TanStackRouterDevtools />
		</>
	),
})
