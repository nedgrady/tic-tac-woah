import { expect, it, suite, vi, vitest, withCallback } from 'vitest'
import { GameServer, Player } from './gameServer'
import { AddressInfo, Server, WebSocketServer, WebSocket, ServerOptions } from 'ws'
import { IncomingMessage } from 'http'
import { Duplex } from 'stream'
import { MockServer } from '@relaycorp/ws-mock'
import { MockClient } from '@relaycorp/ws-mock/build/main/lib/MockClient'
import { faker } from '@faker-js/faker'
import crypto from 'crypto'
import { WebSocketCodes } from '@tic-tac-woah/types'

suite('One person connecting', () => {
    it('is stored in the queue', () => withCallback((done) => {
        const wss = new WebSocketServer({
            port: 9999
        });

        const gameServer = new GameServer(wss)

        wss.on('listening', () => {
            const ws = new WebSocket("ws://localhost:9999?name=AnyName")

            ws.on('open', () => {
                expect(gameServer.queue).toHaveLength(1)

                ws.close()
                wss.close()
                done()
            })
        })
    }))

    it('Player name is stored', () => withCallback((done) => {
        const wss = new WebSocketServer({
            port: 9999
        });

        const gameServer = new GameServer(wss)

        wss.on('listening', () => {
            const playerName = faker.name.fullName()

            const ws = new WebSocket(`ws://localhost:9999?name=${encodeURIComponent(playerName)}`)

            ws.on('open', () => {
                const enqueuedPlayer = gameServer.queue[0].player
                expect(enqueuedPlayer.name).toBe(playerName)

                ws.close()
                wss.close()
                done()
            })
        })
    }))

    it("The player's connection is captured", () => withCallback((done) => {
        const wss = new WebSocketServer({
            port: 9999
        });

        const gameServer = new GameServer(wss)

        wss.on('listening', () => {
            const ws = new WebSocket(`ws://localhost:9999?name=AnyName`)

            ws.on('open', () => {
                const enqueuedPlayer = gameServer.queue[0].player

                expect(enqueuedPlayer.connection).toBeInstanceOf(WebSocket)
                ws.close()
                wss.close()
                done()
            })
        })
    }))

    it('Requested number of participants is stored', () => withCallback((done) => {
        const wss = new WebSocketServer({
            port: 9999
        });

        const gameServer = new GameServer(wss)

        wss.on('listening', () => {
            const playerCount = faker.datatype.number({ min: 1, max: 10 })

            const ws = new WebSocket(`ws://localhost:9999?name=AnyName&playerCount=${playerCount}`)

            ws.on('open', () => {
                const gameRequest = gameServer.queue[0]

                expect(gameRequest.configuration.playerCount).toBe(playerCount)
                ws.close()
                wss.close()
                done()
            })
        })
    }))
})


suite("Invalid name", () => {
    it("closes the connection", () => withCallback((done) => {
        const wss = new WebSocketServer({
            port: 9999
        });
    
        const gameServer = new GameServer(wss)
    
        wss.on('listening', () => {
            const ws = new WebSocket("ws://localhost:9999")

            ws.on('close', (code: number, reason: Buffer) => {
                expect(code).toBe(WebSocketCodes.UNSUPPORTED_DATA)
                ws.close()
                wss.close()
                done()
            })
        })
    }))

    it("Doesn't add the player to the queue", () => withCallback((done) => {
        const wss = new WebSocketServer({
            port: 9999
        });
    
        const gameServer = new GameServer(wss)
    
        wss.on('listening', () => {
            const ws = new WebSocket("ws://localhost:9999")

            ws.on('close', (code: number, reason: Buffer) => {
                expect(gameServer.queue).toHaveLength(0)
                ws.close()
                wss.close()
                done()
            })
        })
    }))
})

