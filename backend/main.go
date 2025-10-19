package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
	"os"

	"github.com/gorilla/websocket"
	_ "github.com/mattn/go-sqlite3"
)

var (
	db *sql.DB
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	gameQueue []*Player
	queueMutex sync.Mutex
	games = make(map[string]*Game)
	gamesMutex sync.Mutex
)

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Max-Age", "3600")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

type Player struct {
	Username string
	Conn *websocket.Conn
	GameID string
	IsBot bool
}

type Game struct {
	ID string
	Player1 *Player
	Player2 *Player
	Board [6][7]int
	CurrentPlayer int
	GameOver bool
	Winner int
	Moves []Move
}

type Move struct {
	Column int
	Player int
	Timestamp time.Time
}

type Message struct {
	Type string `json:"type"`
	Data interface{} `json:"data"`
}

func init() {
	var err error
	db, err = sql.Open("sqlite3", "./game.db")
	if err != nil {
		log.Fatal(err)
	}
	
	createTables()
}

func createTables() {
	schema := `
	CREATE TABLE IF NOT EXISTS players (
		id INTEGER PRIMARY KEY,
		username TEXT UNIQUE,
		wins INTEGER DEFAULT 0,
		losses INTEGER DEFAULT 0,
		draws INTEGER DEFAULT 0,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	
	CREATE TABLE IF NOT EXISTS games (
		id TEXT PRIMARY KEY,
		player1 TEXT,
		player2 TEXT,
		winner TEXT,
		moves TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`
	
	db.Exec(schema)
}

func main() {
	port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    http.HandleFunc("/ws", handleWebSocket)
    http.HandleFunc("/api/leaderboard", corsMiddleware(handleLeaderboard))
    http.HandleFunc("/api/player/", corsMiddleware(handlePlayerStats))

    fmt.Printf("Server running on :%s\n", port)
    log.Fatal(http.ListenAndServe("0.0.0.0:"+port, nil))
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()
	
	var username string
	
	// Read join message
	var msg Message
	err = conn.ReadJSON(&msg)
	if err != nil {
		log.Println("Error reading join message:", err)
		return
	}
	
	if msg.Type == "join_game" || msg.Type == "join" {
		if msg.Data != nil {
			data, ok := msg.Data.(map[string]interface{})
			if ok {
				if playerName, ok := data["playerName"]; ok {
					username = playerName.(string)
				} else if playerNameAlt, ok := data["username"]; ok {
					username = playerNameAlt.(string)
				}
			}
		}
	}
	
	if username == "" {
		username = fmt.Sprintf("Player_%d", time.Now().UnixNano())
	}
	
	db.Exec("INSERT OR IGNORE INTO players (username) VALUES (?)", username)
	
	player := &Player{
		Username: username,
		Conn: conn,
	}
	
	// Add to queue
	queueMutex.Lock()
	gameQueue = append(gameQueue, player)
	queueMutex.Unlock()
	
	log.Printf("Player %s joined queue. Queue size: %d\n", username, len(gameQueue))
	
	// Check for match after 10 seconds
	go func() {
		time.Sleep(10 * time.Second)
		matchPlayers()
	}()
	
	// Listen for moves
	for {
		var moveMsg Message
		err := conn.ReadJSON(&moveMsg)
		if err != nil {
			log.Printf("Error reading message from %s: %v\n", username, err)
			removePlayerFromQueue(player)
			break
		}
		
		log.Printf("Received message type: %s from %s\n", moveMsg.Type, username)
		
		if moveMsg.Type == "move" || moveMsg.Type == "make_move" {
			handleMove(player, moveMsg.Data)
		}
	}
}

func matchPlayers() {
	queueMutex.Lock()
	defer queueMutex.Unlock()
	
	if len(gameQueue) >= 2 {
		player1 := gameQueue[0]
		player2 := gameQueue[1]
		gameQueue = gameQueue[2:]
		
		log.Printf("Matched %s vs %s\n", player1.Username, player2.Username)
		createGame(player1, player2)
	} else if len(gameQueue) == 1 {
		// Create bot opponent
		player1 := gameQueue[0]
		gameQueue = gameQueue[1:]
		
		botPlayer := &Player{
			Username: "Bot",
			IsBot: true,
		}
		
		log.Printf("Creating bot game for %s\n", player1.Username)
		createGame(player1, botPlayer)
	}
}

func createGame(p1, p2 *Player) {
	gameID := fmt.Sprintf("%d", time.Now().UnixNano())
	game := &Game{
		ID: gameID,
		Player1: p1,
		Player2: p2,
		CurrentPlayer: 1,
	}
	
	p1.GameID = gameID
	p2.GameID = gameID
	
	gamesMutex.Lock()
	games[gameID] = game
	gamesMutex.Unlock()
	
	// Send game start message to player 1
	startMsg := Message{
		Type: "game_start",
		Data: map[string]interface{}{
			"gameID": gameID,
			"opponent": p2.Username,
			"playerNumber": 1,
		},
	}
	p1.Conn.WriteJSON(startMsg)
	
	if !p2.IsBot {
		startMsg.Data = map[string]interface{}{
			"gameID": gameID,
			"opponent": p1.Username,
			"playerNumber": 2,
		}
		p2.Conn.WriteJSON(startMsg)
	}
	
	// Send initial board state
	broadcastGameState(game)
}

func handleMove(player *Player, data interface{}) {
	if data == nil {
		log.Println("Move data is nil")
		return
	}
	
	moveData, ok := data.(map[string]interface{})
	if !ok {
		log.Printf("Invalid move data format: %T\n", data)
		return
	}
	
	columnVal, ok := moveData["column"]
	if !ok {
		log.Println("Column not found in move data")
		return
	}
	
	column := int(columnVal.(float64))
	
	gamesMutex.Lock()
	game, exists := games[player.GameID]
	gamesMutex.Unlock()
	
	if !exists || game == nil {
		log.Printf("Game not found for player %s\n", player.Username)
		return
	}
	
	playerNum := 1
	if player == game.Player2 {
		playerNum = 2
	}
	
	if game.CurrentPlayer != playerNum || game.GameOver {
		log.Printf("Invalid move: current player is %d, move player is %d, game over: %v\n", game.CurrentPlayer, playerNum, game.GameOver)
		return
	}
	
	// Validate move
	if column < 0 || column >= 7 || game.Board[0][column] != 0 {
		log.Printf("Invalid column: %d\n", column)
		return
	}
	
	// Place piece
	for row := 5; row >= 0; row-- {
		if game.Board[row][column] == 0 {
			game.Board[row][column] = game.CurrentPlayer
			break
		}
	}
	
	log.Printf("Player %d placed piece at column %d\n", game.CurrentPlayer, column)
	
	// Check win
	if checkWin(game.Board, game.CurrentPlayer) {
		game.GameOver = true
		game.Winner = game.CurrentPlayer
		saveGameResult(game)
		
		broadcastGameState(game)
		return
	}
	
	// Switch player
	if game.CurrentPlayer == 1 {
		game.CurrentPlayer = 2
	} else {
		game.CurrentPlayer = 1
	}
	
	broadcastGameState(game)
	
	if game.Player2.IsBot && game.CurrentPlayer == 2 {
		go func() {
			time.Sleep(1 * time.Second)
			botMove(game)
			
			// Check if bot won
			if game.GameOver {
				broadcastGameState(game)
			} else {
				// Switch back to player 1
				game.CurrentPlayer = 1
				broadcastGameState(game)
			}
		}()
	}
}

func botMove(game *Game) {
	column := getBotMove(game.Board)
	
	// Validate column is valid
	if column < 0 || column >= 7 || game.Board[0][column] != 0 {
		// Find any valid move
		for col := 0; col < 7; col++ {
			if game.Board[0][col] == 0 {
				column = col
				break
			}
		}
	}
	
	log.Printf("Bot placing piece at column %d\n", column)
	
	// Place bot piece
	for row := 5; row >= 0; row-- {
		if game.Board[row][column] == 0 {
			game.Board[row][column] = 2
			break
		}
	}
	
	// Check if bot won
	if checkWin(game.Board, 2) {
		game.GameOver = true
		game.Winner = 2
		saveGameResult(game)
		log.Println("Bot won!")
	}
}

func checkWin(board [6][7]int, player int) bool {
	// Check horizontal
	for row := 0; row < 6; row++ {
		for col := 0; col < 4; col++ {
			if board[row][col] == player && board[row][col+1] == player &&
				board[row][col+2] == player && board[row][col+3] == player {
				return true
			}
		}
	}
	
	// Check vertical
	for col := 0; col < 7; col++ {
		for row := 0; row < 3; row++ {
			if board[row][col] == player && board[row+1][col] == player &&
				board[row+2][col] == player && board[row+3][col] == player {
				return true
			}
		}
	}
	
	// Check diagonal (top-left to bottom-right)
	for row := 0; row < 3; row++ {
		for col := 0; col < 4; col++ {
			if board[row][col] == player && board[row+1][col+1] == player &&
				board[row+2][col+2] == player && board[row+3][col+3] == player {
				return true
			}
		}
	}
	
	// Check diagonal (top-right to bottom-left)
	for row := 0; row < 3; row++ {
		for col := 3; col < 7; col++ {
			if board[row][col] == player && board[row+1][col-1] == player &&
				board[row+2][col-2] == player && board[row+3][col-3] == player {
				return true
			}
		}
	}
	
	return false
}

func broadcastGameState(game *Game) {
	state := Message{
		Type: "board_update",
		Data: map[string]interface{}{
			"board": game.Board,
			"currentPlayer": game.CurrentPlayer,
			"gameOver": game.GameOver,
			"winner": game.Winner,
		},
	}
	
	if game.Player1.Conn != nil {
		game.Player1.Conn.WriteJSON(state)
	}
	if !game.Player2.IsBot && game.Player2.Conn != nil {
		game.Player2.Conn.WriteJSON(state)
	}
}

func saveGameResult(game *Game) {
	winner := ""
	if game.Winner == 1 {
		winner = game.Player1.Username
	} else if game.Winner == 2 {
		winner = game.Player2.Username
	}
	
	movesJSON, _ := json.Marshal(game.Moves)
	
	_, err := db.Exec(
		"INSERT INTO games (id, player1, player2, winner, moves) VALUES (?, ?, ?, ?, ?)",
		game.ID, game.Player1.Username, game.Player2.Username, winner, string(movesJSON),
	)
	
	if err != nil {
		log.Println("Error saving game:", err)
	}
	
	// Update player stats
	if game.Winner == 1 {
		db.Exec("UPDATE players SET wins = wins + 1 WHERE username = ?", game.Player1.Username)
		if !game.Player2.IsBot {
			db.Exec("UPDATE players SET losses = losses + 1 WHERE username = ?", game.Player2.Username)
		}
	} else if game.Winner == 2 {
		db.Exec("UPDATE players SET losses = losses + 1 WHERE username = ?", game.Player1.Username)
		if !game.Player2.IsBot {
			db.Exec("UPDATE players SET wins = wins + 1 WHERE username = ?", game.Player2.Username)
		}
	}
}

func handleLeaderboard(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, username, wins, losses FROM players ORDER BY wins DESC LIMIT 10")
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer rows.Close()
	
	var leaderboard []map[string]interface{}
	for rows.Next() {
		var id int
		var username string
		var wins, losses int
		rows.Scan(&id, &username, &wins, &losses)
		
		total := wins + losses
		winRate := 0.0
		if total > 0 {
			winRate = float64(wins) / float64(total)
		}
		
		leaderboard = append(leaderboard, map[string]interface{}{
			"id": id,
			"name": username,
			"wins": wins,
			"losses": losses,
			"winRate": winRate,
		})
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(leaderboard)
}

func handlePlayerStats(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Path[len("/api/player/"):]
	
	var wins, losses, draws int
	err := db.QueryRow("SELECT wins, losses, draws FROM players WHERE username = ?", username).Scan(&wins, &losses, &draws)
	
	if err != nil {
		http.Error(w, "Player not found", 404)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"username": username,
		"wins": wins,
		"losses": losses,
		"draws": draws,
		"winRate": float64(wins) / float64(wins + losses + draws),
	})
}

func removePlayerFromQueue(player *Player) {
	queueMutex.Lock()
	defer queueMutex.Unlock()
	
	for i, p := range gameQueue {
		if p == player {
			gameQueue = append(gameQueue[:i], gameQueue[i+1:]...)
			break
		}
	}
}

func getBotMove(board [6][7]int) int {
	// Try to win
	for col := 0; col < 7; col++ {
		if isValidMove(board, col) {
			testBoard := board
			for row := 5; row >= 0; row-- {
				if testBoard[row][col] == 0 {
					testBoard[row][col] = 2
					if checkWin(testBoard, 2) {
						return col
					}
					break
				}
			}
		}
	}
	
	// Try to block opponent
	for col := 0; col < 7; col++ {
		if isValidMove(board, col) {
			testBoard := board
			for row := 5; row >= 0; row-- {
				if testBoard[row][col] == 0 {
					testBoard[row][col] = 1
					if checkWin(testBoard, 1) {
						return col
					}
					break
				}
			}
		}
	}
	
	// Prefer center
	for col := 3; col < 4; col++ {
		if isValidMove(board, col) {
			return col
		}
	}
	
	// Random valid move
	for col := 0; col < 7; col++ {
		if isValidMove(board, col) {
			return col
		}
	}
	
	return 0
}

func isValidMove(board [6][7]int, col int) bool {
	return col >= 0 && col < 7 && board[0][col] == 0
}
