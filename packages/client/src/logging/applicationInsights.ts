import { ApplicationInsights } from "@microsoft/applicationinsights-web"
import { ReactPlugin } from "@microsoft/applicationinsights-react-js"

export default function loadApplicationInsights() {
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

		item.tags["ai.cloud.role"] = "tic-tac-woah.client"
		item.tags["ai.cloud.roleInstance"] = window.location.hostname
		item.ext["tic-tac-woah.source"] = "default"
		return true
	})

	appInsights.loadAppInsights()
}
