import { Game } from "domain/Game"
import { GameFactory } from "GameFactory"
import { MatchmakingBroker } from "MatchmakingBroker"
import { TicTacWoahQueue } from "queue/addConnectionToQueue"
import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"
import { GameWinDto, MoveDto } from "types"

export function matchmaking(
	queue: TicTacWoahQueue,
	matchmakingBroker: MatchmakingBroker
): TicTacWoahSocketServerMiddleware {
	queue.onAdded(users => {
		if (users.length === 2) {
			queue.remove(users[0])
			queue.remove(users[1])

			matchmakingBroker.notifyMatchMade(users)
		}
	})
	return (_, next) => {
		next()
	}
}

// class ActiveGames {
// 	private _value: Game | null = null

// 	public get value(): Game | null {
// 		return this._value
// 	}

// 	public set value(v: Game | null) {
// 		this._value = v
// 	}
// }

export function startGameOnMatchMade(
	matchmakingBroker: MatchmakingBroker,
	gameFactory: GameFactory
): TicTacWoahSocketServerMiddleware {
	const activeGames = new Map<string, Game>()

	matchmakingBroker.onMatchMade(users => {
		const participants = users.map(user => user.uniqueIdentifier)

		const gameId = crypto.randomUUID()

		const newGame = gameFactory.createGame()
		activeGames.set(gameId, newGame)

		newGame.onWin(winningMoves => {
			const winningMoveDtos: MoveDto[] = winningMoves.map(winningMove => ({
				mover: winningMove.mover,
				placement: winningMove.placement,
				gameId,
			}))

			const gameWinDto: GameWinDto = {
				winningMoves: winningMoveDtos,
			}

			users.forEach(user => {
				user.connections.forEach(connection => {
					connection.emit("gameWin", gameWinDto)
				})
			})
		})

		newGame.start()

		users.forEach(user => {
			user.connections.forEach(connection => {
				connection.join(gameId)
				connection.emit("gameStart", { id: gameId, players: participants })
			})
		})
	})

	return (connection, next) => {
		connection.on("makeMove", (moveDto, callback) => {
			// TODO - ensure game exists
			// TODO - ensure player is a participant of the supplied game
			activeGames.get(moveDto.gameId)?.submitMove({
				mover: "",
				placement: moveDto.placement,
			})
			connection.to(moveDto.gameId).emit("moveMade", moveDto)
			connection.emit("moveMade", moveDto)

			callback && callback(0)
		})
		next()
	}
}
