import { expect, it, suite, withCallback, test, vi } from 'vitest'
import { GameQueue, GameRequest, GameServer } from './gameServer'
import { WebSocketServer, WebSocket, Server, AddressInfo, ServerOptions, EventListenerOptions, MessageEvent, CloseEvent, ErrorEvent, Event, RawData } from 'ws'
import { faker } from '@faker-js/faker'
import { WebSocketCodes } from '@tic-tac-woah/types'
import http, { ClientRequest, IncomingMessage } from 'http'
import { Socket } from 'net'
import { Duplex } from 'stream'
import { MockWs, MockWss } from './MockWss'
import log from 'loglevel'

vi.mock('loglevel')

test('The server logs a message when it starts listening.', async () => {
    const wss = new MockWss()
    const gameQueue = new GameQueue()
    const gameServer = new GameServer(wss as any, gameQueue)

    wss.emit("listening")

    expect(log.info).toHaveBeenCalledWith("Server started")
})

suite('One person connecting', () => {
    it('is stored in the queue nice', async () => {
        const wss = new MockWss()
        const gameQueue = new GameQueue()
        const gameServer = new GameServer(wss as any, gameQueue)

        const req = new IncomingMessage(new Socket())
        req.url = "ws://localhost:9999?name=AnyName"

        const ws = new WebSocket("ws://nowhere")

        wss.emitConnection(ws, req)

        expect(gameQueue.items()).toHaveLength(1)
    })

    it('Player name is stored nice', async () => {
        const playerName = faker.name.fullName()
        const wss = new MockWss()
        const gameQueue = new GameQueue()
        const gameServer = new GameServer(wss as any, gameQueue)

        const req = new IncomingMessage(new Socket())
        req.url = `ws://localhost:9999?name=${playerName}`;

        const ws = new WebSocket("ws://nowhere")

        wss.emitConnection(ws, req)

        expect(gameQueue.get(0).player.name).toBe(playerName)
    })

    it.skip('Player name is stored', async () => {
        const wss = new WebSocketServer({
            port: 9999
        })
        const gameQueue = new GameQueue()
        const gameServer = new GameServer(wss, gameQueue)
        const playerName = faker.name.fullName()

        expect(gameQueue.get(0)).toBeUndefined()

        await new Promise((resolve) => {
            wss.on('listening', () => {
                const ws = new WebSocket(`ws://localhost:9999?name=${playerName}`)

                ws.on('open', () => {
                    ws.close()
                    wss.close()
                    resolve("")
                })
            })
        })

        expect(gameQueue.get(0).player.name).toBe(playerName)
    })


    it.skip("The player's connection is captured", async () => {
        const wss = new WebSocketServer({
            port: 9999
        })
        const gameQueue = new GameQueue()
        const gameServer = new GameServer(wss, gameQueue)

        await new Promise((resolve) => {
            wss.on('listening', () => {
                const ws = new WebSocket(`ws://localhost:9999?name=AnyName&playerCount=2`)

                ws.on('open', () => {
                    ws.close()
                    wss.close()
                    resolve("")
                })
            })
        })

        expect(gameQueue.get(0).player.connection).toBeInstanceOf(WebSocket)
    })

    it("The player's connection is captured nice", async () => {
        const wss = new MockWss()
        const gameQueue = new GameQueue()
        const gameServer = new GameServer(wss as any, gameQueue)

        const req = new IncomingMessage(new Socket())
        req.url = `ws://localhost:9999?name=AnyName`;

        const ws = new WebSocket("ws://nowhere")

        wss.emitConnection(ws, req)

        expect(gameQueue.get(0).player.connection).toBeInstanceOf(WebSocket)
    })

    it('Requested number of participants is stored nice', async () => {
        const wss = new MockWss()
        const gameQueue = new GameQueue()
        const gameServer = new GameServer(wss as any, gameQueue)

        const req = new IncomingMessage(new Socket())
        const playerCount = faker.datatype.number({ min: 1, max: 10 })
        req.url = `ws://localhost:9999?name=AnyName&playerCount=${playerCount}`;
        const ws = new WebSocket("ws://nowhere")

        wss.emitConnection(ws, req)

        const gameRequest = gameQueue.get(0)
        expect(gameRequest.configuration.playerCount).toBe(playerCount)
    })

    it.skip('Requested number of participants is stored', async () => {
        const wss = new WebSocketServer({
            port: 9999
        })

        const gameQueue = new GameQueue()
        const gameServer = new GameServer(wss, gameQueue)

        const playerCount = faker.datatype.number({ min: 1, max: 10 })
        await new Promise((resolve) => {
            wss.on('listening', () => {
                const ws = new WebSocket(`ws://localhost:9999?name=AnyName&playerCount=${playerCount}`)
                ws.on('open', () => {
                    ws.close()
                    wss.close()
                    resolve("")
                })
            })
        })
        const gameRequest = gameQueue.get(0)
        expect(gameRequest.configuration.playerCount).toBe(playerCount)

    })
})


suite("Invalid name", () => {
    it("closes the connection nice", async () => {
        const wss = new MockWss()
        const gameQueue = new GameQueue()
        const gameServer = new GameServer(wss as any, gameQueue)

        const req = new IncomingMessage(new Socket())
        const playerCount = faker.datatype.number({ min: 1, max: 10 })
        req.url = `ws://localhost:9999`;

        const ws = new MockWs(vi.fn)

        wss.emitConnection(ws as any, req)

        expect(ws.close).toHaveBeenCalledWith(WebSocketCodes.UNSUPPORTED_DATA, "")
    })

    it.skip("closes the connection", async () => {
        const wss = new WebSocketServer({
            port: 9999
        })

        const gameQueue = new GameQueue()
        const gameServer = new GameServer(wss, gameQueue)
        const closeCodePromise = new Promise<number>((resolve) => {
            wss.on('listening', () => {
                const ws = new WebSocket("ws://localhost:9999")

                ws.on('close', (code: number, reason: Buffer) => {
                    ws.close()
                    wss.close()
                    resolve(code)
                })
            })
        })

        await expect(closeCodePromise).resolves.toBe(WebSocketCodes.UNSUPPORTED_DATA)
    })

    it.skip("Doesn't add the player to the queue", async () => {
        const wss = new WebSocketServer({
            port: 9999
        })

        const gameQueue = new GameQueue()
        const gameServer = new GameServer(wss, gameQueue)

        await new Promise((resolve) => {
            wss.on('listening', () => {
                const ws = new WebSocket("ws://localhost:9999")

                ws.on('close', (code: number, reason: Buffer) => {
                    ws.close()
                    wss.close()
                    resolve("")
                })
            })
        })
        expect(gameQueue.items()).toHaveLength(0)
    })
})



suite('Second person connecting', () => {
    it.todo('is stored in the queue', async () => {
        const wss = new WebSocketServer({
            port: 9999
        })

        const gameQueue = new GameQueue()
        const gameServer = new GameServer(wss, gameQueue)
        await new Promise((resolve) => {
            wss.on('listening', () => {
                const ws1 = new WebSocket("ws://localhost:9999?name=AnyName&playerCount=2")
                const ws2 = new WebSocket("ws://localhost:9999?name=AnyName&playerCount=2")

                ws2.on('open', () => {

                    ws1.close()
                    ws2.close()
                    wss.close()
                    resolve("")
                })
            })
            expect(gameQueue.items()).toHaveLength(2)
        })
    })
})