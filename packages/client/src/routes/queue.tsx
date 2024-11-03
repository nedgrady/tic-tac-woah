import { createFileRoute } from "@tanstack/react-router"
import { Queue } from "../Queue"
import { z } from "zod"
import { router } from "../router"
import { zodSearchValidator } from "@tanstack/router-zod-adapter"

const CreateGameSettingsSchema = z.object({
	consecutiveTarget: z.number().int().positive(),
	participantCount: z.number().int().positive(),
	botCount: z.number().int().positive(),
})

export type CreateGameSettings = z.infer<typeof CreateGameSettingsSchema>

export const Route = createFileRoute("/queue")({
	component: Queue,
	onError: () => {
		router.navigate({ to: "/play" })
	},
	validateSearch: zodSearchValidator(CreateGameSettingsSchema),
})
