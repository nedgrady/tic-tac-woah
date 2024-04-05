import { Participant } from "domain/Participant"
import { DecideWhoMayMoveNext } from "domain/moveOrderRules/moveOrderRules"

export const specificParticipantMayMoveNext =
	(participant: Participant): DecideWhoMayMoveNext =>
	() =>
		[participant]
