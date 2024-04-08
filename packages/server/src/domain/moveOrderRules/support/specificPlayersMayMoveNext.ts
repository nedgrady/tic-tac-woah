import { Participant } from "domain/Participant"
import { DecideWhoMayMoveNext } from "domain/moveOrderRules/moveOrderRules"

export const specificPlayersMayMoveNext =
	(...participants: Participant[]): DecideWhoMayMoveNext =>
	() =>
		participants
