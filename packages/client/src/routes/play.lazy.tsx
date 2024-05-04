import { createLazyFileRoute } from "@tanstack/react-router"
import { CreateGame } from "../CreateGameForm"

export const Route = createLazyFileRoute("/play")({
	component: CreateGame,
})
