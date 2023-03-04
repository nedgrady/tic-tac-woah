import * as Colyseus from "colyseus.js" // not necessary if included via <script> tag.

var client = new Colyseus.Client("wss://server-0mi6.onrender.com")

client
	.joinOrCreate("room_name")
	.then(room => {
		console.log(room.sessionId, "joined", room.name)
	})
	.catch(e => {
		console.log("JOIN ERROR", e)
	})

// const client = new WebSocket("ws://server-0mi6.onrender.com")

// client.onopen = () => console.log("OPEN")
// client.onclose = () => console.log("CLOSE")

function App() {
	document.title = `${document.title} (${__COMMIT_HASH__})`
	return <>👀</>
}

export default App
