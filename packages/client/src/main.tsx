import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { Provider } from "react-redux"
import { store } from "./redux/store"
import ErrorBoundary from "./logging/ErrorBoundary"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SocketHistoryProvider, SocketProvider } from "./ticTacWoahSocket"

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<SocketProvider>
					<SocketHistoryProvider>
						<App />
					</SocketHistoryProvider>
				</SocketProvider>
			</QueryClientProvider>
		</Provider>
	</React.StrictMode>,
)
