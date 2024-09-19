import { createFileRoute } from "@tanstack/react-router"
import { Queue } from "../Queue"
import { z } from "zod"

const CreateGameSettingsSchema = z.object({
	consecutiveTarget: z.number(),
	participantCount: z.number(),
	botCount: z.number(),
})

export type CreateGameSettings = z.infer<typeof CreateGameSettingsSchema>

export const Route = createFileRoute("/queue")({
	component: Queue,
	onError: (error: Error) => {
		console.error("Error loading queue", error)
		Route.router?.navigate({ to: "/" })
	},
	validateSearch: CreateGameSettingsSchema.parse,
})
