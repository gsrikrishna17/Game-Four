import { useState } from "react"
import GameBoard from "./GameBoard"
import PlayerNameInput from "./PlayerNameInput"
import GameResults from "./GameResults"
import "../styles/LocalGame.css"

export default function LocalGame({ onBack }) {
  const [gameState, setGameState] = useState("input") // 'input', 'playing', 'finished'
  const [player1Name, setPlayer1Name] = useState("")
  const [player2Name, setPlayer2Name] = useState("")
  const [board, setBoard] = useState(Array(42).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [winner, setWinner] = useState(null)
  const [gameResult, setGameResult] = useState(null)
  const [moveCount, setMoveCount] = useState(0)

  const handleNamesSubmit = (p1, p2) => {
    setPlayer1Name(p1)
    setPlayer2Name(p2)
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

  const handleMove = (column) => {
    if (winner || gameState !== "playing") return

    const newBoard = [...board]
    const cols = 7

    // Find the lowest empty row in the column
    for (let row = 5; row >= 0; row--) {
      const idx = row * cols + column
      if (newBoard[idx] === null) {
        newBoard[idx] = currentPlayer
        setBoard(newBoard)
        setMoveCount(moveCount + 1)

        // Check for winner
        const gameWinner = checkWinner(newBoard)
        if (gameWinner) {
          setWinner(gameWinner)
          setGameResult({
            winner: gameWinner === 1 ? player1Name : player2Name,
            loser: gameWinner === 1 ? player2Name : player1Name,
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

        // Switch player
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
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
  }

  return (
    <div className="local-game-container">
      {gameState === "input" && <PlayerNameInput onSubmit={handleNamesSubmit} onBack={onBack} />}

      {gameState === "playing" && (
        <div className="playing-container">
          <div className="player-info">
            <div className={`player ${currentPlayer === 1 ? "active" : ""}`}>
              <span className="player-number">PLAYER 1</span>
              <span className="player-name">{player1Name}</span>
              <div className="player-piece piece-1"></div>
            </div>
            <div className="vs">VS</div>
            <div className={`player ${currentPlayer === 2 ? "active" : ""}`}>
              <span className="player-number">PLAYER 2</span>
              <span className="player-name">{player2Name}</span>
              <div className="player-piece piece-2"></div>
            </div>
          </div>

          <GameBoard board={board} onMove={handleMove} currentPlayer={currentPlayer} isYourTurn={true} />

          <div className="turn-indicator">{currentPlayer === 1 ? player1Name : player2Name}'s Turn</div>
        </div>
      )}

      {gameState === "finished" && <GameResults result={gameResult} onPlayAgain={handlePlayAgain} onBack={onBack} />}
    </div>
  )
}
