import { ActiveUser, TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"
import { EventEmitter } from "events"
import _ from "lodash"
import TypedEmitter from "typed-emitter"
import { JoinQueueRequestSchema } from "types"

export type QueueAddedListener = (queueState: readonly QueueItem[]) => void

export interface QueueItem {
	queuer: ActiveUser
	humanCount: number
	aiCount: number
	consecutiveTarget: number
}

type QueueEvents = {
	queueAdded: QueueAddedListener
}

// TODO - this should probably be generic
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
				existingQueueItem => existingQueueItem.queuer.uniqueIdentifier === newQueueItem.queuer.uniqueIdentifier,
			) !== -1
		)
			return
		this._items.push(newQueueItem)
		this._emitter.emit("queueAdded", [...this._items])
	}

	removeItems(items: readonly QueueItem[]) {
		this._items = _.difference(this._items, items)
	}

	get items(): readonly QueueItem[] {
		return this._items
	}
}

export function addConnectionToQueue(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	return (socket, next) => {
		// TODO - ensure the correct object shape, perhaps need to add some sort of cross-cutting filter ability
		socket.on("joinQueue", (joinQueueRequest, callback) => {
			const queueItem: QueueItem = {
				queuer: socket.data.activeUser,
				humanCount: joinQueueRequest.humanCount,
				consecutiveTarget: joinQueueRequest.consecutiveTarget,
				aiCount: joinQueueRequest.aiCount,
			}

			queue.addItem(queueItem)

			callback && callback(0)
		})

		next()
	}
}
