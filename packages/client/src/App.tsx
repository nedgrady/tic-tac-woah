import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffectOnce } from "react-use"
import { io } from "socket.io-client"
import { MoveDtoSchema } from "types"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useAppDispatch, useAppSelector } from "./redux/hooks"
import { newMove, selectBoardState } from "./redux/boardSlice"
import { CoordinatesDto } from "types"
import React from "react"
import { ApplicationInsights } from "@microsoft/applicationinsights-web"
import { ReactPlugin, withAITracking } from "@microsoft/applicationinsights-react-js"
import * as applicationInsightsCore from "applicationinsights"

const webSocketUrl = `${import.meta.env.VITE_WEBSOCKET_URL}:${import.meta.env.VITE_WEBSOCKET_PORT}`

export const socket = io(webSocketUrl, {
	autoConnect: false,
})

const queryClient = new QueryClient()

var reactPlugin = new ReactPlugin()
var appInsights = new ApplicationInsights({
	config: {
		instrumentationKey: "691cf8f7-d5ef-45df-a5ff-385d9429be4b",
		extensions: [reactPlugin],
	},
})

appInsights.addTelemetryInitializer(item => {
	if (!item.tags) item.tags = []
	if (!item.ext) item.ext = []

	item.tags[applicationInsightsCore.defaultClient.context.keys.cloudRole] = "tic-tac-woah.client"
	item.tags[applicationInsightsCore.defaultClient.context.keys.cloudRoleInstance] = window.location.hostname
	item.ext["tic-tac-woah.source"] = "default"
	return true
})

const thing = appInsights.loadAppInsights()

thing.trackEvent({ name: "test" })

function App() {
	useEffectOnce(() => {
		socket.connect()

		socket.on("game start", args => {
			console.log(JSON.stringify(args))
		})
		socket.on("move", args => {
			console.log(args)
			const move = MoveDtoSchema.parse(args)

			dispatch(newMove(move))
		})

		return () => {
			socket.disconnect()
		}
	})

	const dispatch = useAppDispatch()

	return (
		<QueryClientProvider client={queryClient}>
			<button
				onClick={() => {
					const coordinates: CoordinatesDto = {
						x: Math.floor(Math.random() * 20),
						y: Math.floor(Math.random() * 20),
					}
					socket.emit("move", JSON.stringify(coordinates))
				}}
			>
				Clik me
			</button>
			<Queue />
			<hr />
			<Game />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	)
}

function Game() {
	const thing = useAppSelector(selectBoardState)

	return <>{JSON.stringify(thing)}</>
}

function Queue() {
	//const { queue } = useQueue()

	//return <>Currently {queue?.depth ?? "?"} people in the queue...</>
	return <></>
}

export default App
