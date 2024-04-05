import { Participant } from "domain/Participant"
import { DecideWhoMayMoveNext } from "domain/moveOrderRules/moveOrderRules"
import { vi } from "vitest"

export function sequenceOfPlayersMayMoveNext(...participants: Participant[]): DecideWhoMayMoveNext {
	const sequenceFn = vi.fn()

	participants.forEach(participant => {
		sequenceFn.mockImplementationOnce(() => [participant])
	})

	return sequenceFn
}
