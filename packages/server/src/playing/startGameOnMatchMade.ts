import Coordinates from "domain/Coordinates"
import { Game } from "domain/Game"
import { Move } from "domain/Move"
import { GameFactory } from "GameFactory"
import _ from "lodash"
import { MatchmakingBroker } from "MatchmakingBroker"
import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"
import { GameWinDto, CompletedMoveDto, GameDrawDto } from "types"

export function startGameOnMatchMade(
	matchmakingBroker: MatchmakingBroker,
	gameFactory: GameFactory
): TicTacWoahSocketServerMiddleware {
	const activeGames = new Map<string, Game>()

	matchmakingBroker.onMatchMade((users, aiParticipantCount) => {
		const aiParticiapnts = Array(aiParticipantCount).fill("AI-" + crypto.randomUUID())
		const participants = [...users.map(user => user.uniqueIdentifier), ...aiParticiapnts]

		const gameId = crypto.randomUUID()

		const newGame = gameFactory.createGame(participants)
		activeGames.set(gameId, newGame)

		newGame.onMoveCompleted(completedMove => {
			const completedMoveDto: CompletedMoveDto = {
				mover: completedMove.mover,
				placement: completedMove.placement,
				gameId,
			}
			users.forEach(user => {
				user.connections.forEach(connection => {
					connection.emit("moveMade", completedMoveDto)
				})
			})
		})

		newGame.onMoveCompleted(move => {
			if (move.mover.startsWith("AI-")) return
			// create all possible placement pairings from 0,0 to 20,20
			const allPossiblePlacements: Coordinates[] = _.range(0, 20).flatMap(x =>
				_.range(0, 20).map(y => ({ x, y }))
			)

			const availablePlacements = allPossiblePlacements.filter(
				placement => !newGame.moves().some(move => _.isEqual(move.placement, placement))
			)

			const randomPlacement = availablePlacements[Math.floor(Math.random() * availablePlacements.length)]

			aiParticiapnts.forEach(aiParticipant => {
				const aiMove: Move = {
					mover: aiParticipant,
					placement: randomPlacement,
				}
				newGame.submitMove(aiMove)
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

			users.forEach(user => {
				user.connections.forEach(connection => {
					connection.emit("gameWin", gameWinDto)
				})
			})
		})

		newGame.onDraw(() => {
			const gameDrawDto: GameDrawDto = {
				gameId,
			}
			users.forEach(user => {
				user.connections.forEach(connection => {
					connection.emit("gameDraw", gameDrawDto)
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

			callback && callback(0)
		})
		next()
	}
}
