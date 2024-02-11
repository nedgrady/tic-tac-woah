export class StrongMap<TMap> {
	private map = new Map<keyof TMap, TMap[keyof TMap][]>()
	add<TKey extends keyof TMap>(key: TKey, value: TMap[TKey]) {
		if (!this.map.has(key)) {
			this.map.set(key, [])
		}
		this.map.get(key)?.push(value)
	}

	get<TKey extends keyof TMap>(key: TKey) {
		return this.map.get(key) ?? []
	}
}
