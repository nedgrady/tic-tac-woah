import { faker } from "@faker-js/faker"
import { ActiveUser } from "TicTacWoahSocketServer"
import { Factory } from "fishery"
import { MadeMatchRules } from "matchmaking/MatchmakingStrategy"
import { QueueItem } from "queue/addConnectionToQueue"
import { GameStartDto, JoinQueueRequest } from "types"

export const joinQueueRequestFactory = Factory.define<JoinQueueRequest>(() => ({
	humanCount: faker.number.int(),
	consecutiveTarget: faker.number.int(),
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

export const activeUserFactory = Factory.define<ActiveUser>(() => ({
	connections: new Set(),
	uniqueIdentifier: faker.string.uuid(),
	objectId: faker.string.uuid(),
}))

export const queueItemFactory = Factory.define<QueueItem>(() => ({
	queuer: activeUserFactory.build(),
	humanCount: faker.number.int(),
	consecutiveTarget: faker.number.int(),
}))
