import { expect } from "vitest"
import { ActiveUser } from "../../../TicTacWoahSocketServer"

type ActiveUserEqualityContract = Pick<ActiveUser, "uniqueIdentifier"> & { connectionIds: string[] }

function formatActiveUser(activeUser: ActiveUser) {
	return {
		uniqueIdentifier: activeUser.uniqueIdentifier,
		connections: activeUser.connections.size,
	}
}

function toImportantBits(activeUser: ActiveUser): ActiveUserEqualityContract {
	return {
		uniqueIdentifier: activeUser.uniqueIdentifier,
		connectionIds: [...activeUser.connections].map(connection => connection.id),
	}
}

export const matchers: Parameters<(typeof expect)["extend"]>[0] = {
	toBeActiveUser(received: ActiveUser, activeUser: ActiveUser) {
		const receivedBitsWeCareAbout = toImportantBits(received)
		const expectedBitsWeCareAbout = toImportantBits(activeUser)
		return {
			message: () =>
				`Expected the same active user\n. ${this.utils.diff(formatActiveUser(received), formatActiveUser(activeUser))}`,
			pass: this.equals(expectedBitsWeCareAbout, receivedBitsWeCareAbout),
		}
	},

	toContainActiveUser(received: ActiveUser[], activeUser: ActiveUser) {
		const receivedBitsWeCareAbout = received.map(toImportantBits)
		const expectedBitsWeCareAbout = toImportantBits(activeUser)
		return {
			message: () =>
				`Expected received collection to contain active user.\n${this.utils.diff(
					received.map(formatActiveUser),
					formatActiveUser(activeUser),
				)}`,
			pass: receivedBitsWeCareAbout.some(receivedUser => this.equals(receivedUser, expectedBitsWeCareAbout)),
		}
	},

	toContainSingleActiveUser(received: ActiveUser[], activeUser: ActiveUser) {
		const receivedBitsWeCareAbout = received.map(toImportantBits)
		const expectedBitsWeCareAbout = toImportantBits(activeUser)
		const pass: boolean = received.length === 1 && this.equals(receivedBitsWeCareAbout[0], expectedBitsWeCareAbout)

		return {
			message: () =>
				`Expected ActiveUser array to contain the received ActiveUser\n. ${this.utils.diff(
					received.map(formatActiveUser),
					formatActiveUser(activeUser),
				)}`,
			pass,
		}
	},

	toOnlyContainActiveUsers(received: ActiveUser[], ...expectedUsers: ActiveUser[]) {
		const receivedBitsWeCareAbout = received.map(toImportantBits)
		const expectedBitsWeCareAbout = expectedUsers.map(toImportantBits)

		const pass =
			expectedBitsWeCareAbout.every(expectedUser =>
				receivedBitsWeCareAbout.some(receivedUser => this.equals(receivedUser, expectedUser)),
			) &&
			receivedBitsWeCareAbout.every(receivedUser =>
				expectedBitsWeCareAbout.some(user => this.equals(receivedUser, user)),
			)

		return {
			message: () =>
				`Expected ActiveUser array to only contain the received ActiveUser user array.\n${this.utils.diff(
					received.map(formatActiveUser),
					expectedUsers.map(formatActiveUser),
				)}`,
			pass,
		}
	},
}
