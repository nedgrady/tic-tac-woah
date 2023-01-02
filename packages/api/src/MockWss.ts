import { expect, it, suite, vi, vitest } from 'vitest'
import { GameServer, Player } from './gameServer'
import log from 'loglevel'
import { AddressInfo, Server, WebSocketServer, WebSocket, ServerOptions } from 'ws'
import { IncomingMessage } from 'http'
import { Duplex } from 'stream'
import { MockServer } from '@relaycorp/ws-mock'
import { MockClient } from '@relaycorp/ws-mock/build/main/lib/MockClient'
import { faker } from '@faker-js/faker'
import crypto from 'crypto'


export class MockWss implements WebSocketServer {
    options: ServerOptions = {}
    path: string = ""
    clients: Set<WebSocket> = new Set<WebSocket>()

    address(): string | AddressInfo {
        throw new Error('Method not implemented.')
    }
    close(cb?: ((err?: Error | undefined) => void) | undefined): void {
        throw new Error('Method not implemented.')
    }
    handleUpgrade(request: IncomingMessage, socket: Duplex, upgradeHead: Buffer, callback: (client: WebSocket, request: IncomingMessage) => void): void {
        throw new Error('Method not implemented.')
    }
    shouldHandle(request: IncomingMessage): boolean | Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    on(event: 'connection', cb: (this: Server<WebSocket>, socket: WebSocket, request: IncomingMessage) => void): this
    on(event: 'error', cb: (this: Server<WebSocket>, error: Error) => void): this
    on(event: 'headers', cb: (this: Server<WebSocket>, headers: string[], request: IncomingMessage) => void): this
    on(event: 'close' | 'listening', cb: (this: Server<WebSocket>) => void): this
    on(event: string | symbol, listener: (this: Server<WebSocket>, ...args: any[]) => void): this
    on(event: unknown, listener: unknown): this {
        throw new Error('Method not implemented.')
    }
    once(event: 'connection', cb: (this: Server<WebSocket>, socket: WebSocket, request: IncomingMessage) => void): this
    once(event: 'error', cb: (this: Server<WebSocket>, error: Error) => void): this
    once(event: 'headers', cb: (this: Server<WebSocket>, headers: string[], request: IncomingMessage) => void): this
    once(event: 'close' | 'listening', cb: (this: Server<WebSocket>) => void): this
    once(event: string | symbol, listener: (this: Server<WebSocket>, ...args: any[]) => void): this
    once(event: unknown, listener: unknown): this {
        throw new Error('Method not implemented.')
    }
    off(event: 'connection', cb: (this: Server<WebSocket>, socket: WebSocket, request: IncomingMessage) => void): this
    off(event: 'error', cb: (this: Server<WebSocket>, error: Error) => void): this
    off(event: 'headers', cb: (this: Server<WebSocket>, headers: string[], request: IncomingMessage) => void): this
    off(event: 'close' | 'listening', cb: (this: Server<WebSocket>) => void): this
    off(event: string | symbol, listener: (this: Server<WebSocket>, ...args: any[]) => void): this
    off(event: unknown, listener: unknown): this {
        throw new Error('Method not implemented.')
    }
    addListener(event: 'connection', cb: (client: WebSocket, request: IncomingMessage) => void): this
    addListener(event: 'error', cb: (err: Error) => void): this
    addListener(event: 'headers', cb: (headers: string[], request: IncomingMessage) => void): this
    addListener(event: 'close' | 'listening', cb: () => void): this
    addListener(event: string | symbol, listener: (...args: any[]) => void): this
    addListener(event: unknown, listener: unknown): this {
        throw new Error('Method not implemented.')
    }
    removeListener(event: 'connection', cb: (client: WebSocket) => void): this
    removeListener(event: 'error', cb: (err: Error) => void): this
    removeListener(event: 'headers', cb: (headers: string[], request: IncomingMessage) => void): this
    removeListener(event: 'close' | 'listening', cb: () => void): this
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this
    removeListener(event: unknown, listener: unknown): this {
        throw new Error('Method not implemented.')
    }
    removeAllListeners(event?: string | symbol | undefined): this {
        throw new Error('Method not implemented.')
    }
    setMaxListeners(n: number): this {
        throw new Error('Method not implemented.')
    }
    getMaxListeners(): number {
        throw new Error('Method not implemented.')
    }
    listeners(eventName: string | symbol): Function[] {
        throw new Error('Method not implemented.')
    }
    rawListeners(eventName: string | symbol): Function[] {
        throw new Error('Method not implemented.')
    }
    emit(eventName: string | symbol, ...args: any[]): boolean {
        throw new Error('Method not implemented.')
    }
    listenerCount(eventName: string | symbol): number {
        throw new Error('Method not implemented.')
    }
    prependListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.')
    }
    prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.')
    }
    eventNames(): (string | symbol)[] {
        throw new Error('Method not implemented.')
    }
    
}


const mockWebSocketServer: WebSocketServer = {
    options: {},
    path: '',
    clients: new Set<WebSocket>(),
    address: function (): string | AddressInfo {
        throw new Error('Function not implemented.')
    },
    close: function (cb?: ((err?: Error | undefined) => void) | undefined): void {
        throw new Error('Function not implemented.')
    },
    handleUpgrade: function (request: IncomingMessage, socket: Duplex, upgradeHead: Buffer, callback: (client: WebSocket, request: IncomingMessage) => void): void {
        throw new Error('Function not implemented.')
    },
    shouldHandle: function (request: IncomingMessage): boolean | Promise<boolean> {
        throw new Error('Function not implemented.')
    },
    on: (name, callback) => {
        return mockWebSocketServer
    },
    once: (name, callback) => {
        return mockWebSocketServer
    },
    off: (name, callback) => {
        return mockWebSocketServer
    },
    addListener: (name, callback) => {
        return mockWebSocketServer
    },
    removeListener: (name, callback) => {
        return mockWebSocketServer
    },
    removeAllListeners: function (event?: string | symbol | undefined): WebSocketServer {
        throw new Error('Function not implemented.')
    },
    setMaxListeners: function (n: number): WebSocketServer {
        throw new Error('Function not implemented.')
    },
    getMaxListeners: function (): number {
        throw new Error('Function not implemented.')
    },
    listeners: function (eventName: string | symbol): Function[] {
        throw new Error('Function not implemented.')
    },
    rawListeners: function (eventName: string | symbol): Function[] {
        throw new Error('Function not implemented.')
    },
    emit: function (eventName: string | symbol, ...args: any[]): boolean {
        throw new Error('Function not implemented.')
    },
    listenerCount: function (eventName: string | symbol): number {
        throw new Error('Function not implemented.')
    },
    prependListener: function (eventName: string | symbol, listener: (...args: any[]) => void): WebSocketServer {
        throw new Error('Function not implemented.')
    },
    prependOnceListener: function (eventName: string | symbol, listener: (...args: any[]) => void): WebSocketServer {
        throw new Error('Function not implemented.')
    },
    eventNames: function (): (string | symbol)[] {
        throw new Error('Function not implemented.')
    }
}