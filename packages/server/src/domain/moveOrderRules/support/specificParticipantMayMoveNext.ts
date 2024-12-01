import { Participant } from "../../Participant"
import { DecideWhoMayMoveNext } from "../moveOrderRules"

export const specificParticipantMayMoveNext =
	(participant: Participant): DecideWhoMayMoveNext =>
	() => [participant]
