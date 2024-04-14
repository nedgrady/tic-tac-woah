import { ActiveUser, TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"
import { EventEmitter } from "events"
import _ from "lodash"
import TypedEmitter from "typed-emitter"

export type QueueAddedListener = (queueState: readonly QueueItem[]) => void

export interface QueueItem {
	queuer: ActiveUser
	humanCount: number
}

type QueueEvents = {
	queueAdded: QueueAddedListener
}

export class TicTacWoahQueue {
	private readonly _emitter = new EventEmitter() as TypedEmitter<QueueEvents>

	objectId: string
	private _items: QueueItem[] = []

	constructor() {
		this.objectId = crypto.randomUUID()
	}

	onAdded(listener: QueueAddedListener) {
		this._emitter.on("queueAdded", listener)
	}

	remove(user: ActiveUser) {
		const id = user.uniqueIdentifier
		const itemIndex = this._items.findIndex(u => u.queuer.uniqueIdentifier === id)
		this._items.splice(itemIndex, 1)
	}

	get users(): readonly ActiveUser[] {
		return this._items.map(item => item.queuer)
	}

	addItem(newQueueItem: QueueItem) {
		if (
			this._items.findIndex(
				existingQueueItem => existingQueueItem.queuer.uniqueIdentifier === newQueueItem.queuer.uniqueIdentifier
			) !== -1
		)
			return
		this._items.push(newQueueItem)
		this._emitter.emit("queueAdded", [...this._items])
	}

	get items(): readonly QueueItem[] {
		return this._items
	}
}

export function addConnectionToQueue(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	return (socket, next) => {
		socket.on("joinQueue", (joinQueueRequest, callback) => {
			const queueItem: QueueItem = {
				queuer: socket.data.activeUser,
				humanCount: joinQueueRequest.humanCount,
			}

			queue.addItem(queueItem)
			callback && callback(0)
		})

		next()
	}
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function loggedMethod(_target: any, _propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
	const originalMethod = descriptor.value

	function replacementMethod(this: any, ...args: any[]) {
		if (isActiveUser(args[0])) {
			console.log(`Active user: ${args[0].uniqueIdentifier}`)
		}

		console.log(`Calling ${_propertyKey} with`, args)
		const result = originalMethod.apply(this, args)

		return result
	}

	descriptor.value = replacementMethod
	return descriptor

	function isActiveUser(value: any): value is ActiveUser {
		return (
			typeof value === "object" &&
			value !== null &&
			value.connections instanceof Set &&
			typeof value.uniqueIdentifier === "string" &&
			(typeof value.objectId === "string" || typeof value.objectId === "undefined")
		)
	}
}
/* eslint-enable @typescript-eslint/no-explicit-any */
