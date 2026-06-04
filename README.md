# TapTapRace

TapTapRace is a simple multiplayer typing-race application. It provides an ASP.NET Core backend using SignalR to manage rooms, players, and real-time race synchronization. This README contains the essential information to run and understand the project.

## Quick overview
- Backend: ASP.NET Core (C#) in `testbackend/`
- Realtime: SignalR hub at `/typeracehub`
- REST: Read-only endpoints under `api/TypeRace`
- Deployment config: `zerops.yml` (build & run instructions)

## Key features
- Create / join rooms
- Ready system and automatic countdown when all players are ready
- Real-time progress updates and final results
- WPM calculation (server assumes 5 characters per word)

## Important files
- `testbackend/Hub/TypeRaceHub.cs` — SignalR hub, main game logic
- `testbackend/Controllers/TypeRaceController.cs` — REST endpoints for rooms
- `testbackend/Models/Room.cs` — Room and Player models, GameState enum
- `testbackend/Models/TextContent.cs` — text samples used for races
- `testbackend/wwwroot/` — static frontend assets (HTML/JS/CSS)
- `zerops.yml` — Zerops build & run configuration

## How to run locally
Prerequisites: .NET SDK (matching runtime; `zerops.yml` uses dotnet 9)

From repository root:

1. Restore and build

```bash
dotnet restore
dotnet build
```

2. Run the backend

```bash
dotnet run --project testbackend
```

The app serves static files from `testbackend/wwwroot` and maps the SignalR hub at `/typeracehub`. By default, it listens on the port configured by ASP.NET (commonly 5000 for HTTP). CORS is configured to allow the frontend to connect to the hub.

Alternatively, publish and run the compiled output:

```bash
dotnet publish testbackend/testbackend.csproj -c Release -o app
dotnet app/testbackend.dll --environment Development
```

## REST API (read-only)

Example requests:

```http
GET /api/TypeRace/rooms
```
- Returns list of rooms: `{ id, name, playerCount, gameState, isGameActive }`

```http
GET /api/TypeRace/rooms/{roomId}
```
- Returns room details including players: `{ name, isReady, wordsPerMinute, accuracy, hasCompleted }`

## SignalR: hub methods (server-side) — call these from clients
- CreateRoom(roomName, playerName)
- JoinRoom(roomId, playerName)
- SetReady(roomId, isReady)
- StartGame(roomId)  (the server also auto-starts when all players are ready)
- UpdateProgress(roomId, position, accuracy)
- LeaveRoom(roomId)

## SignalR: client events (server emits)
- RoomCreated(roomId, roomName)
- RoomJoined(roomId, roomName)
- PlayerJoined(playerName)
- PlayerList(arrayOfNames)
- PlayerReady(playerName, isReady)
- GameCountdown(number)
- GameStarted(textToType)
- ProgressUpdate(playerName, position, wpm, accuracy)
- PlayerCompleted(playerName, wpm, accuracy)
- GameCompleted(results)
- PlayerLeft(playerName)
- Error(message)

## Notes & assumptions
- WPM calculation: server computes WPM as (characters / 5) divided by elapsed minutes.
- Game flow: Waiting → Countdown → InProgress → Finished → Waiting (after reset).
- The server uses `ConcurrentDictionary` for thread-safe player management.

## Deployment
`zerops.yml` shows a Zerops configuration that builds using `dotnet@9`, publishes the `testbackend` project to `app/`, and runs `dotnet testbackend.dll --environment Development`. The app exposes the configured HTTP port.

## Contributing
- Fork the repo, create a branch, and open a pull request.
- For backend logic changes, add/update tests and consider concurrency implications.

---
