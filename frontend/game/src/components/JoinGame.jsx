import { useState } from "react"
import "../styles/JoinGame.css"

export default function JoinGame({ onJoin, onBack }) {
  const [player1, setPlayer1] = useState("")
  const [player2, setPlayer2] = useState("")
  const [gameCode, setGameCode] = useState("")

  const handleJoin = () => {
    if (player1.trim() && player2.trim()) {
      onJoin(player1, player2)
    }
  }

  return (
    <div className="join-game-container">
      <div className="join-game-card">
        <h2 className="join-game-title">Online Game</h2>

        <div className="form-group">
          <label className="form-label">Player 1 Name:</label>
          <input
            type="text"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            placeholder="Enter your name"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Player 2 Name:</label>
          <input
            type="text"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            placeholder="Enter opponent name"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Game Code (Optional):</label>
          <input
            type="text"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value)}
            placeholder="Enter game code to join"
            className="form-input"
          />
        </div>

        <div className="button-group">
          <button onClick={handleJoin} className="btn btn-primary">
            Start Game
          </button>
          <button onClick={onBack} className="btn btn-secondary">
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
