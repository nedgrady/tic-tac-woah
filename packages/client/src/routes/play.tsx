import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { CreateGameForm } from "../createGame/CreateGameForm"

export const Route = createFileRoute("/play")({
	component: CreateGame,
})

export function CreateGame() {
	const navigate = useNavigate({ from: "/play" })
	return (
		<>
			<CreateGameForm
				onCreate={settings => {
					navigate({ to: "/queue", search: settings })
				}}
			/>
		</>
	)
}
