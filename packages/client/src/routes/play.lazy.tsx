import { createLazyFileRoute, useNavigate } from "@tanstack/react-router"
import { CreateGameForm, CreateGameSettings } from "../CreateGameForm"

export const Route = createLazyFileRoute("/play")({
	component: CreateGame,
})

export function CreateGame() {
	const navigate = useNavigate({ from: "/play" })
	return (
		<>
			<CreateGameForm
				onCreate={function (settings: CreateGameSettings): void {
					navigate({ to: "/queue", search: settings })
				}}
			/>
		</>
	)
}
