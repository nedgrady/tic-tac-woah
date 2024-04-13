import { faker } from "@faker-js/faker"
import * as Factory from "factory.ts"
import { JoinQueueRequest } from "types"

export const joinQueueRequestFactory = Factory.Sync.makeFactory<JoinQueueRequest>({
	humanCount: faker.number.int(),
})
