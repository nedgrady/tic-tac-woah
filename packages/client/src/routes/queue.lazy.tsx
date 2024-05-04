import { createLazyFileRoute } from "@tanstack/react-router"
import { Queue } from "../Queue"

export const Route = createLazyFileRoute("/queue")({
	component: Queue,
})
