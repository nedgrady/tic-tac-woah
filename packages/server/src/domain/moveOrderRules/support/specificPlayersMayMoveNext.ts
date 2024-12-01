import { Participant } from "../../Participant"
import { DecideWhoMayMoveNext } from "../moveOrderRules"

export const specificPlayersMayMoveNext =
	(...participants: Participant[]): DecideWhoMayMoveNext =>
	() =>
		participants
