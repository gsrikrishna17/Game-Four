"use client"

import { useState } from "react"
import GameModeSelector from "./components/GameModeSelector"
import LocalGame from "./components/LocalGame"
import BotGame from "./components/BotGame"
import Leaderboard from "./components/Leaderboard"
import "./App.css"

export default function App() {
  const [gameState, setGameState] = useState("mode-select")
  const [player1Name, setPlayer1Name] = useState("")
  const [player2Name, setPlayer2Name] = useState("")

  const handleModeSelect = (mode) => {
    setGameState(mode)
  }

  const handleBackToMenu = () => {
    setGameState("mode-select")
    setPlayer1Name("")
    setPlayer2Name("")
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Connect Four</h1>
        <p>4 in a Row Game</p>
      </header>

      <main className="app-main">
        {gameState === "mode-select" && <GameModeSelector onSelectMode={handleModeSelect} />}
        {gameState === "local" && <LocalGame onBack={handleBackToMenu} />}
        {gameState === "bot" && <BotGame onBack={handleBackToMenu} />}
        {gameState === "leaderboard" && <Leaderboard onBack={handleBackToMenu} />}
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 Connect Four Game. All rights reserved.</p>
      </footer>
    </div>
  )
}
