import { Game } from "domain/Game"
import { GameFactory } from "GameFactory"
import { MatchmakingBroker } from "MatchmakingBroker"
import { TicTacWoahQueue } from "queue/addConnectionToQueue"
import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"
import { GameWinDto, CompletedMoveDto } from "types"

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

export function startGameOnMatchMade(
	matchmakingBroker: MatchmakingBroker,
	gameFactory: GameFactory
): TicTacWoahSocketServerMiddleware {
	const activeGames = new Map<string, Game>()

	matchmakingBroker.onMatchMade(users => {
		const participants = users.map(user => user.uniqueIdentifier)

		const gameId = crypto.randomUUID()

		const newGame = gameFactory.createGame(participants)
		activeGames.set(gameId, newGame)

		newGame.onWin(winningMoves => {
			const winningMoveDtos: CompletedMoveDto[] = winningMoves.map(winningMove => ({
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
				mover: connection.data.activeUser.uniqueIdentifier,
				placement: moveDto.placement,
			})
			const completedMoveDto: CompletedMoveDto = {
				mover: connection.data.activeUser.uniqueIdentifier,
				placement: moveDto.placement,
				gameId: moveDto.gameId,
			}
			connection.to(moveDto.gameId).emit("moveMade", completedMoveDto)
			connection.emit("moveMade", completedMoveDto)

			callback && callback(0)
		})
		next()
	}
}
