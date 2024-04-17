import { faker } from "@faker-js/faker"
import { ActiveUser } from "TicTacWoahSocketServer"
import * as Factory from "factory.ts"
import { MadeMatchRules } from "matchmaking/MatchmakingStrategy"
import { JoinQueueRequest } from "types"

export const joinQueueRequestFactory = Factory.Sync.makeFactory<JoinQueueRequest>({
	humanCount: faker.number.int(),
})

export const madeMatchRulesFactory = Factory.Sync.makeFactory<MadeMatchRules>({
	boardSize: faker.number.int(),
	consecutiveTarget: faker.number.int(),
})

export const activeUserFactory = Factory.Sync.makeFactory<ActiveUser>({
	connections: new Set(),
	uniqueIdentifier: faker.string.uuid(),
	objectId: faker.string.uuid(),
})
