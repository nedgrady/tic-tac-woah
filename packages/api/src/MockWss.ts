import { expect, it, suite, vi, vitest } from 'vitest'
import { GameServer, Player } from './gameServer'
import log from 'loglevel'
import { AddressInfo, Server, WebSocketServer, WebSocket, ServerOptions, RawData, CloseEvent, ErrorEvent, Event, MessageEvent } from 'ws'
import { IncomingMessage, ClientRequest } from 'http'
import { Duplex } from 'stream'
import { MockServer } from '@relaycorp/ws-mock'
import { MockClient } from '@relaycorp/ws-mock/build/main/lib/MockClient'
import { faker } from '@faker-js/faker'
import crypto from 'crypto'
import { EventEmitter } from 'node:events';

type WssSubsetUsed = Pick<WebSocketServer, "on">

type WsSubsetUsed = Pick<WebSocket, "on" | "close" | "CLOSED" | "OPEN" | "CLOSING" | "CONNECTING" | "bufferedAmount" | "readyState">

export type WsSubsetUsedRo = WsSubsetUsed

type GenericSpyFn = Function


export class MockWs implements WsSubsetUsed {
    CLOSED: 3 = 3
    OPEN: 1 = 1
    CLOSING: 2 = 2
    CONNECTING: 0 = 0
    bufferedAmount: number = 0

    // TODO - Make readyState readonly
    readyState: 0 | 3 | 1 | 2 = this.CLOSED
    // readonly #spyFactory
    // readonly #invocations : Map<Function, GenericSpyFn> = new Map()

    /**
     *
     */

            // this.#spyFactory = spyFactory ?? (() => () => {})

        // const x = vi.fn(() => {})
        // const spy = this.#spyFactory()
        // const oldClose = this.close
        // this.close = spy((code?: number | undefined, data?: string | Buffer | undefined) => oldClose(code, data))
    constructor(spyFactory: (...args: any) => GenericSpyFn) {
        const oldClose = this.close.bind(this);
        this.close = vi.fn((code?: number | undefined, data?: string | Buffer | undefined) => oldClose(code, data))

    }

    close(code?: number | undefined, data?: string | Buffer | undefined): void {
        this.readyState = this.CLOSED
    }

    on(event: 'close', listener: (this: import("ws"), code: number, reason: Buffer) => void): WebSocket
    on(event: 'error', listener: (this: import("ws"), err: Error) => void): WebSocket
    on(event: 'upgrade', listener: (this: import("ws"), request: IncomingMessage) => void): WebSocket
    on(event: 'message', listener: (this: import("ws"), data: RawData, isBinary: boolean) => void): WebSocket
    on(event: 'open', listener: (this: import("ws")) => void): WebSocket
    on(event: 'ping' | 'pong', listener: (this: import("ws"), data: Buffer) => void): WebSocket
    on(event: 'unexpected-response', listener: (this: import("ws"), request: ClientRequest, response: IncomingMessage) => void): WebSocket
    on(event: string | symbol, listener: (this: import("ws"), ...args: any[]) => void): WebSocket
    on(event: unknown, listener: unknown): WebSocket {
        throw new Error('Method not implemented.')
    }
    
}

export class MockWss implements WssSubsetUsed {

    emitter : EventEmitter = new EventEmitter()

    on(event: 'connection', cb: (this: Server<WebSocket>, socket: WebSocket, request: IncomingMessage) => void): WebSocketServer
    on(event: 'error', cb: (this: Server<WebSocket>, error: Error) => void): WebSocketServer
    on(event: 'headers', cb: (this: Server<WebSocket>, headers: string[], request: IncomingMessage) => void): WebSocketServer
    on(event: 'close' | 'listening', cb: (this: Server<WebSocket>) => void): WebSocketServer
    on(event: unknown, listener: unknown): WebSocketServer {
        switch(event) {
            case "connection":
            case "listening":
                this.emitter.addListener(event, listener as any)
                return this as any
            default:
                throw new Error(`Method '${event}' not implemented.`)
        }
    }

    emit(event: "listening") : void{
        this.emitter.emit("listening")
    }

    emitConnection(socket: WebSocket, request: IncomingMessage) : void {
        this.emitter.emit("connection", socket, request)
    }
}



// class MockWs implements WebSocket {
//     capturedEvents: Set<Event> = new Set<Event>()
//     capturedErrors: Set<ErrorEvent> = new Set<ErrorEvent>()
//     capturedCloseEvents: Set<ErrorEvent> = new Set<ErrorEvent>()

//     binaryType: 'nodebuffer' | 'arraybuffer' | 'fragments' = "nodebuffer"
//     bufferedAmount: number = 0
//     extensions: string = ""
//     isPaused: boolean = false
//     protocol: string = "In memory"
//     readyState: 0 | 1 | 2 | 3 = 1
//     url: string = "In memory"
//     CONNECTING: 0 = 0
//     OPEN: 1 = 1
//     CLOSING: 2 = 2
//     CLOSED: 3 = 3
//     onopen: ((event: Event) => void) | null = (event) => {this.capturedEvents.add(event)}
//     onerror: ((event: ErrorEvent) => void) | null = (event) => {this.capturedErrors.add(event)}
//     onclose: ((event: CloseEvent) => void) | null
//     onmessage: ((event: MessageEvent) => void) | null
//     // binaryType: 'nodebuffer' | 'arraybuffer' | 'fragments'
//     // bufferedAmount: number
//     // extensions: string
//     // isPaused: boolean
//     // protocol: string
//     // readyState: 0 | 1 | 2 | 3
//     // url: string
//     // CONNECTING: 0
//     // OPEN: 1
//     // CLOSING: 2
//     // CLOSED: 3
//     // onopen: ((event: Event) => void) | null
//     // onerror: ((event: ErrorEvent) => void) | null
//     // onclose: ((event: CloseEvent) => void) | null
//     // onmessage: ((event: MessageEvent) => void) | null
//     close(code?: number | undefined, data?: string | Buffer | undefined): void {
//         throw new Error('Method not implemented.')
//     }
//     ping(data?: any, mask?: boolean | undefined, cb?: ((err: Error) => void) | undefined): void {
//         throw new Error('Method not implemented.')
//     }
//     pong(data?: any, mask?: boolean | undefined, cb?: ((err: Error) => void) | undefined): void {
//         throw new Error('Method not implemented.')
//     }
//     send(data: string | number | readonly any[] | Buffer | Uint8Array | DataView | ArrayBufferView | ArrayBuffer | SharedArrayBuffer | readonly number[] | { valueOf(): ArrayBuffer } | { valueOf(): SharedArrayBuffer } | { valueOf(): Uint8Array } | { valueOf(): readonly number[] } | { valueOf(): string } | { [Symbol.toPrimitive](hint: string): string }, cb?: ((err?: Error | undefined) => void) | undefined): void
//     send(data: string | number | readonly any[] | Buffer | Uint8Array | DataView | ArrayBufferView | ArrayBuffer | SharedArrayBuffer | readonly number[] | { valueOf(): ArrayBuffer } | { valueOf(): SharedArrayBuffer } | { valueOf(): Uint8Array } | { valueOf(): readonly number[] } | { valueOf(): string } | { [Symbol.toPrimitive](hint: string): string }, options: { mask?: boolean | undefined; binary?: boolean | undefined; compress?: boolean | undefined; fin?: boolean | undefined }, cb?: ((err?: Error | undefined) => void) | undefined): void
//     send(data: unknown, options?: unknown, cb?: unknown): void {
//         throw new Error('Method not implemented.')
//     }
//     terminate(): void {
//         throw new Error('Method not implemented.')
//     }
//     pause(): void {
//         throw new Error('Method not implemented.')
//     }
//     resume(): void {
//         throw new Error('Method not implemented.')
//     }

//     // addEventListener(method: 'message', cb: (event: MessageEvent) => void, options?: EventListenerOptions | undefined): void
//     // addEventListener(method: 'close', cb: (event: CloseEvent) => void, options?: EventListenerOptions | undefined): void
//     // addEventListener(method: 'error', cb: (event: ErrorEvent) => void, options?: EventListenerOptions | undefined): void
//     // addEventListener(method: 'open', cb: (event: Event) => void, options?: EventListenerOptions | undefined): void
//     addEventListener(method: unknown, cb: unknown, options?: unknown): void {
//         throw new Error('Method not implemented.')
//     }

//     // removeEventListener(method: 'message', cb: (event: MessageEvent) => void): void
//     // removeEventListener(method: 'close', cb: (event: CloseEvent) => void): void
//     // removeEventListener(method: 'error', cb: (event: ErrorEvent) => void): void
//     // removeEventListener(method: 'open', cb: (event: Event) => void): void
//     removeEventListener(method: unknown, cb: unknown): void {
//         throw new Error('Method not implemented.')
//     }
//     on(event: 'close', listener: (this: import("ws"), code: number, reason: Buffer) => void): this
//     on(event: 'error', listener: (this: import("ws"), err: Error) => void): this
//     on(event: 'upgrade', listener: (this: import("ws"), request: IncomingMessage) => void): this
//     on(event: 'message', listener: (this: import("ws"), data: RawData, isBinary: boolean) => void): this
//     on(event: 'open', listener: (this: import("ws")) => void): this
//     on(event: 'ping' | 'pong', listener: (this: import("ws"), data: Buffer) => void): this
//     on(event: 'unexpected-response', listener: (this: import("ws"), request: ClientRequest, response: IncomingMessage) => void): this
//     on(event: string | symbol, listener: (this: import("ws"), ...args: any[]) => void): this
//     on(event: unknown, listener: unknown): this {
//         throw new Error('Method not implemented.')
//     }
//     once(event: 'close', listener: (this: import("ws"), code: number, reason: Buffer) => void): this
//     once(event: 'error', listener: (this: import("ws"), err: Error) => void): this
//     once(event: 'upgrade', listener: (this: import("ws"), request: IncomingMessage) => void): this
//     once(event: 'message', listener: (this: import("ws"), data: RawData, isBinary: boolean) => void): this
//     once(event: 'open', listener: (this: import("ws")) => void): this
//     once(event: 'ping' | 'pong', listener: (this: import("ws"), data: Buffer) => void): this
//     once(event: 'unexpected-response', listener: (this: import("ws"), request: ClientRequest, response: IncomingMessage) => void): this
//     once(event: string | symbol, listener: (this: import("ws"), ...args: any[]) => void): this
//     once(event: unknown, listener: unknown): this {
//         throw new Error('Method not implemented.')
//     }
//     off(event: 'close', listener: (this: import("ws"), code: number, reason: Buffer) => void): this
//     off(event: 'error', listener: (this: import("ws"), err: Error) => void): this
//     off(event: 'upgrade', listener: (this: import("ws"), request: IncomingMessage) => void): this
//     off(event: 'message', listener: (this: import("ws"), data: RawData, isBinary: boolean) => void): this
//     off(event: 'open', listener: (this: import("ws")) => void): this
//     off(event: 'ping' | 'pong', listener: (this: import("ws"), data: Buffer) => void): this
//     off(event: 'unexpected-response', listener: (this: import("ws"), request: ClientRequest, response: IncomingMessage) => void): this
//     off(event: string | symbol, listener: (this: import("ws"), ...args: any[]) => void): this
//     off(event: unknown, listener: unknown): this {
//         throw new Error('Method not implemented.')
//     }
//     addListener(event: 'close', listener: (code: number, reason: Buffer) => void): this
//     addListener(event: 'error', listener: (err: Error) => void): this
//     addListener(event: 'upgrade', listener: (request: IncomingMessage) => void): this
//     addListener(event: 'message', listener: (data: RawData, isBinary: boolean) => void): this
//     addListener(event: 'open', listener: () => void): this
//     addListener(event: 'ping' | 'pong', listener: (data: Buffer) => void): this
//     addListener(event: 'unexpected-response', listener: (request: ClientRequest, response: IncomingMessage) => void): this
//     addListener(event: string | symbol, listener: (...args: any[]) => void): this
//     addListener(event: unknown, listener: unknown): this {
//         throw new Error('Method not implemented.')
//     }
//     removeListener(event: 'close', listener: (code: number, reason: Buffer) => void): this
//     removeListener(event: 'error', listener: (err: Error) => void): this
//     removeListener(event: 'upgrade', listener: (request: IncomingMessage) => void): this
//     removeListener(event: 'message', listener: (data: RawData, isBinary: boolean) => void): this
//     removeListener(event: 'open', listener: () => void): this
//     removeListener(event: 'ping' | 'pong', listener: (data: Buffer) => void): this
//     removeListener(event: 'unexpected-response', listener: (request: ClientRequest, response: IncomingMessage) => void): this
//     removeListener(event: string | symbol, listener: (...args: any[]) => void): this
//     removeListener(event: unknown, listener: unknown): this {
//         throw new Error('Method not implemented.')
//     }
//     removeAllListeners(event?: string | symbol | undefined): this {
//         throw new Error('Method not implemented.')
//     }
//     setMaxListeners(n: number): this {
//         throw new Error('Method not implemented.')
//     }
//     getMaxListeners(): number {
//         throw new Error('Method not implemented.')
//     }
//     listeners(eventName: string | symbol): Function[] {
//         throw new Error('Method not implemented.')
//     }
//     rawListeners(eventName: string | symbol): Function[] {
//         throw new Error('Method not implemented.')
//     }
//     emit(eventName: string | symbol, ...args: any[]): boolean {
//         throw new Error('Method not implemented.')
//     }
//     listenerCount(eventName: string | symbol): number {
//         throw new Error('Method not implemented.')
//     }
//     prependListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
//         throw new Error('Method not implemented.')
//     }
//     prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
//         throw new Error('Method not implemented.')
//     }
//     eventNames(): (string | symbol)[] {
//         throw new Error('Method not implemented.')
//     }
    
// }


export class MockWss2 implements WebSocketServer {
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
    emit(event: "asda", client: WebSocket) : boolean
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

const c = new MockWss();
