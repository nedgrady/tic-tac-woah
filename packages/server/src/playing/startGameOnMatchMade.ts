import { Game } from "domain/Game"
import { GameFactory } from "playing/GameFactory"
import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"
import { GameWinDto, CompletedMoveDto, GameDrawDto, GameStartDto } from "types"

export function startGameOnMatchMade(
	matchmakingBroker: MatchmakingBroker,
	gameFactory: GameFactory,
): TicTacWoahSocketServerMiddleware {
	const activeGames = new Map<string, Game>()

	matchmakingBroker.onMatchMade(madeMatch => {
		const aiParticipants = madeMatch.aiCount == 1 ? ["AI"] : []
		const participants = [
			...madeMatch.participants.map(participant => participant.uniqueIdentifier),
			...aiParticipants,
		]

		const gameId = crypto.randomUUID()

		const newGame = gameFactory.createGame(madeMatch)
		activeGames.set(gameId, newGame)

		newGame.onParticipantMayMove("AI", () => {
			madeMatch.participants[0].connections.forEach(firstCon => {
				firstCon.emit("moveMade", {
					gameId: "TODO",
					mover: "TODO",
					placement: {
						x: 0,
						y: 0,
					},
				})
			})
		})

		newGame.onMoveCompleted(completedMove => {
			const completedMoveDto: CompletedMoveDto = {
				mover: completedMove.mover,
				placement: completedMove.placement,
				gameId,
			}
			madeMatch.participants.forEach(user => {
				user.connections.forEach(connection => {
					connection.emit("moveMade", completedMoveDto)
				})
			})
		})

		newGame.onWin(winningMoves => {
			const winningMoveDtos: CompletedMoveDto[] = winningMoves.map(winningMove => ({
				mover: winningMove.mover,
				placement: winningMove.placement,
				gameId,
			}))

			// TODO - add a top level gameId
			const gameWinDto: GameWinDto = {
				winningMoves: winningMoveDtos,
			}

			madeMatch.participants.forEach(user => {
				user.connections.forEach(connection => {
					connection.emit("gameWin", gameWinDto)
				})
			})
		})

		newGame.onDraw(() => {
			const gameDrawDto: GameDrawDto = {
				gameId,
			}
			madeMatch.participants.forEach(user => {
				user.connections.forEach(connection => {
					connection.emit("gameDraw", gameDrawDto)
				})
			})
		})

		newGame.start()

		madeMatch.participants.forEach(user => {
			user.connections.forEach(connection => {
				connection.join(gameId)
				const gameStart: GameStartDto = {
					id: gameId,
					players: participants,
					rules: madeMatch.rules,
				}
				connection.emit("gameStart", gameStart)
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

			callback && callback(0)
		})
		next()
	}
}
