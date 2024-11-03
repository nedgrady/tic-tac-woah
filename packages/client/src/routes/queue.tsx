import { createFileRoute } from "@tanstack/react-router"
import { Queue } from "../Queue"
import { z } from "zod"
import { router } from "../router"
import { zodSearchValidator } from "@tanstack/router-zod-adapter"

const CreateGameSettingsSchema = z.object({
	consecutiveTarget: z.number().int().min(1).max(5),
	participantCount: z.number().int().min(1).max(5),
	botCount: z.number().int().min(0).max(5),
})

export type CreateGameSettings = z.infer<typeof CreateGameSettingsSchema>

export const Route = createFileRoute("/queue")({
	component: Queue,
	onError: () => {
		router.navigate({ to: "/play" })
	},
	validateSearch: zodSearchValidator(CreateGameSettingsSchema),
})
