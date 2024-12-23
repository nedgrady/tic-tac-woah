import { faker } from "@faker-js/faker"
import { Factory } from "fishery"
import { vi } from "vitest"
import { GenerateContentResult } from "@google/generative-ai"
import { JoinQueueRequest, GameStartDto, PendingMoveDto } from "@tic-tac-woah/types"
import { AiParticipant } from "../aiAgents/AiParticipant"
import Coordinates from "../domain/Coordinates"
import { CreateGameOptions } from "../domain/Game"
import { Move } from "../domain/Move"
import { MadeMatchRules } from "../matchmaking/MatchmakingStrategy"
import { QueueItem } from "../queue/addConnectionToQueue"
import { ActiveUser } from "../TicTacWoahSocketServer"

export const joinQueueRequestFactory = Factory.define<JoinQueueRequest>(() => ({
	humanCount: faker.number.int(),
	consecutiveTarget: faker.number.int(),
	aiCount: faker.number.int(),
}))

export const gameStartDtoFactory = Factory.define<GameStartDto>(({ sequence }) => ({
	id: `GameStartDto from Factory ${sequence}`,
	rules: {
		consecutiveTarget: faker.number.int(),
		boardSize: faker.number.int(),
	},
	players: [faker.string.uuid(), faker.string.uuid(), faker.string.uuid()],
}))

export const madeMatchRulesFactory = Factory.define<MadeMatchRules>(() => ({
	boardSize: faker.number.int(),
	consecutiveTarget: faker.number.int(),
}))

export const pendingMoveDtoFactory = Factory.define<PendingMoveDto>(({ sequence }) => ({
	gameId: faker.string.uuid(),
	mover: faker.string.uuid(),
	placement: {
		x: faker.number.int(),
		y: faker.number.int(),
	},
}))

export const coorinatesFactory = Factory.define<Coordinates>(() => ({
	x: faker.number.int(),
	y: faker.number.int(),
}))

export const moveFactory = Factory.define<Move>(({ sequence }) => ({
	mover: faker.string.uuid(),
	placement: {
		x: faker.number.int(),
		y: faker.number.int(),
	},
}))

export const activeUserFactory = Factory.define<ActiveUser>(() => ({
	connections: new Set(),
	uniqueIdentifier: faker.string.uuid(),
	objectId: faker.string.uuid(),
}))

export const queueItemFactory = Factory.define<QueueItem>(() => ({
	queuer: activeUserFactory.build(),
	humanCount: faker.number.int({ min: 0, max: 100 }),
	consecutiveTarget: faker.number.int(),
	aiCount: faker.number.int({ min: 0, max: 100 }),
}))

export const aiParticipantFactory = Factory.define<AiParticipant>(() => ({
	name: "AiParticipant from Faker",
	id: faker.string.uuid(),
	nextMove: vi.fn(),
}))

export const generateContentResultFactory = Factory.define<GenerateContentResult>(() => ({
	response: {
		functionCalls: () => {
			throw new Error("Not implemented")
		},
		functionCall: () => {
			throw new Error("Not implemented")
		},
		text: () => faker.lorem.sentence(),
		candidates: [],
		promptFeedback: undefined,
		usageMetadata: undefined,
	},
}))

export const createGameOptionsFactory = Factory.define<CreateGameOptions>(() => ({
	decideWhoMayMoveNext: vi.fn(),
	endConditions: [],
	participants: [],
	rules: [],
	winConditions: [],
	boardSize: faker.number.int(),
	consecutiveTarget: faker.number.int(),
}))
