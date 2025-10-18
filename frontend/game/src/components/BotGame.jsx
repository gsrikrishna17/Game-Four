import { useState } from "react"
import GameBoard from "./GameBoard"
import PlayerNameInput from "./PlayerNameInput"
import GameResults from "./GameResults"
import "../styles/BotGame.css"

export default function BotGame({ onBack }) {
  const [gameState, setGameState] = useState("input") // 'input', 'playing', 'finished'
  const [playerName, setPlayerName] = useState("")
  const [board, setBoard] = useState(Array(42).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [winner, setWinner] = useState(null)
  const [gameResult, setGameResult] = useState(null)
  const [moveCount, setMoveCount] = useState(0)
  const [isThinking, setIsThinking] = useState(false)

  const handleNameSubmit = (name) => {
    setPlayerName(name)
    setGameState("playing")
    setBoard(Array(42).fill(null))
    setCurrentPlayer(1)
    setWinner(null)
    setMoveCount(0)
  }

  const checkWinner = (boardState) => {
    const rows = 6
    const cols = 7

    // Check horizontal
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols - 3; c++) {
        const idx = r * cols + c
        if (
          boardState[idx] &&
          boardState[idx] === boardState[idx + 1] &&
          boardState[idx] === boardState[idx + 2] &&
          boardState[idx] === boardState[idx + 3]
        ) {
          return boardState[idx]
        }
      }
    }

    // Check vertical
    for (let r = 0; r < rows - 3; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c
        if (
          boardState[idx] &&
          boardState[idx] === boardState[idx + cols] &&
          boardState[idx] === boardState[idx + cols * 2] &&
          boardState[idx] === boardState[idx + cols * 3]
        ) {
          return boardState[idx]
        }
      }
    }

    // Check diagonal (top-left to bottom-right)
    for (let r = 0; r < rows - 3; r++) {
      for (let c = 0; c < cols - 3; c++) {
        const idx = r * cols + c
        if (
          boardState[idx] &&
          boardState[idx] === boardState[idx + cols + 1] &&
          boardState[idx] === boardState[idx + (cols + 1) * 2] &&
          boardState[idx] === boardState[idx + (cols + 1) * 3]
        ) {
          return boardState[idx]
        }
      }
    }

    // Check diagonal (top-right to bottom-left)
    for (let r = 0; r < rows - 3; r++) {
      for (let c = 3; c < cols; c++) {
        const idx = r * cols + c
        if (
          boardState[idx] &&
          boardState[idx] === boardState[idx + cols - 1] &&
          boardState[idx] === boardState[idx + (cols - 1) * 2] &&
          boardState[idx] === boardState[idx + (cols - 1) * 3]
        ) {
          return boardState[idx]
        }
      }
    }

    return null
  }

  const countThreats = (boardState, column, player) => {
    const testBoard = [...boardState]
    const cols = 7

    // Find where piece would land
    for (let row = 5; row >= 0; row--) {
      const idx = row * cols + column
      if (testBoard[idx] === null) {
        testBoard[idx] = player
        break
      }
    }

    // Count potential wins
    let score = 0
    const rows = 6

    // Check horizontal
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols - 3; c++) {
        const idx = r * cols + c
        let count = 0
        for (let i = 0; i < 4; i++) {
          if (testBoard[idx + i] === player) count++
        }
        if (count === 3) score += 100
        if (count === 2) score += 10
      }
    }

    // Check vertical
    for (let r = 0; r < rows - 3; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c
        let count = 0
        for (let i = 0; i < 4; i++) {
          if (testBoard[idx + i * cols] === player) count++
        }
        if (count === 3) score += 100
        if (count === 2) score += 10
      }
    }

    return score
  }

  const getBotMove = (boardState) => {
    const cols = 7
    let bestColumn = -1
    let bestScore = Number.NEGATIVE_INFINITY

    // Try each column
    for (let col = 0; col < cols; col++) {
      // Check if column is full
      if (boardState[col] !== null) continue

      // Check if bot can win
      const botWinScore = countThreats(boardState, col, 2)
      if (botWinScore >= 100) {
        return col
      }

      // Check if need to block player
      const playerWinScore = countThreats(boardState, col, 1)
      if (playerWinScore >= 100) {
        return col
      }

      // Otherwise pick best strategic move
      const score = botWinScore + playerWinScore + Math.random() * 10
      if (score > bestScore) {
        bestScore = score
        bestColumn = col
      }
    }

    // If no good move found, pick random valid column
    if (bestColumn === -1) {
      const validColumns = []
      for (let col = 0; col < cols; col++) {
        if (boardState[col] === null) {
          validColumns.push(col)
        }
      }
      bestColumn = validColumns[Math.floor(Math.random() * validColumns.length)]
    }

    return bestColumn
  }

  const handleMove = (column) => {
    if (winner || gameState !== "playing" || currentPlayer !== 1) return

    const newBoard = [...board]
    const cols = 7

    // Find the lowest empty row in the column
    for (let row = 5; row >= 0; row--) {
      const idx = row * cols + column
      if (newBoard[idx] === null) {
        newBoard[idx] = 1
        setBoard(newBoard)
        setMoveCount(moveCount + 1)

        // Check for player winner
        let gameWinner = checkWinner(newBoard)
        if (gameWinner) {
          setWinner(gameWinner)
          setGameResult({
            winner: gameWinner === 1 ? playerName : "Bot",
            loser: gameWinner === 1 ? "Bot" : playerName,
            bonusTime: Math.floor(Math.random() * 10000) + 5000,
            bonusWin: 1000,
          })
          setGameState("finished")
          return
        }

        // Check for draw
        if (moveCount + 1 === 42) {
          setGameResult({
            winner: "Draw",
            loser: null,
            bonusTime: 0,
            bonusWin: 0,
          })
          setGameState("finished")
          return
        }

        // Bot's turn
        setCurrentPlayer(2)
        setIsThinking(true)

        // Simulate thinking delay
        setTimeout(() => {
          const botColumn = getBotMove(newBoard)
          const botBoard = [...newBoard]

          for (let row = 5; row >= 0; row--) {
            const idx = row * cols + botColumn
            if (botBoard[idx] === null) {
              botBoard[idx] = 2
              setBoard(botBoard)
              setMoveCount(moveCount + 2)

              // Check for bot winner
              gameWinner = checkWinner(botBoard)
              if (gameWinner) {
                setWinner(gameWinner)
                setGameResult({
                  winner: gameWinner === 1 ? playerName : "Bot",
                  loser: gameWinner === 1 ? "Bot" : playerName,
                  bonusTime: Math.floor(Math.random() * 10000) + 5000,
                  bonusWin: 1000,
                })
                setGameState("finished")
                setIsThinking(false)
                return
              }

              // Check for draw
              if (moveCount + 2 === 42) {
                setGameResult({
                  winner: "Draw",
                  loser: null,
                  bonusTime: 0,
                  bonusWin: 0,
                })
                setGameState("finished")
                setIsThinking(false)
                return
              }

              setCurrentPlayer(1)
              setIsThinking(false)
              return
            }
          }
        }, 1000)

        return
      }
    }
  }

  const handlePlayAgain = () => {
    setGameState("input")
    setBoard(Array(42).fill(null))
    setCurrentPlayer(1)
    setWinner(null)
    setGameResult(null)
    setMoveCount(0)
    setIsThinking(false)
  }

  return (
    <div className="bot-game-container">
      {gameState === "input" && (
        <PlayerNameInput onSubmit={(name) => handleNameSubmit(name)} onBack={onBack} isBotMode={true} />
      )}

      {gameState === "playing" && (
        <div className="playing-container">
          <div className="player-info">
            <div className={`player ${currentPlayer === 1 ? "active" : ""}`}>
              <span className="player-number">YOU</span>
              <span className="player-name">{playerName}</span>
              <div className="player-piece piece-1"></div>
            </div>
            <div className="vs">VS</div>
            <div className={`player ${currentPlayer === 2 ? "active" : ""}`}>
              <span className="player-number">BOT</span>
              <span className="player-name">AI Opponent</span>
              <div className="player-piece piece-2"></div>
            </div>
          </div>

          <GameBoard
            board={board}
            onMove={handleMove}
            currentPlayer={currentPlayer}
            isYourTurn={currentPlayer === 1}
            isThinking={isThinking}
          />

          <div className="turn-indicator">
            {isThinking ? "Bot is thinking..." : currentPlayer === 1 ? "Your Turn" : "Bot Turn"}
          </div>
        </div>
      )}

      {gameState === "finished" && <GameResults result={gameResult} onPlayAgain={handlePlayAgain} onBack={onBack} />}
    </div>
  )
}
