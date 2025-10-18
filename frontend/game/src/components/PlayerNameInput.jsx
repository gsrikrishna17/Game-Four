import { useState } from "react"
import "../styles/PlayerNameInput.css"

export default function PlayerNameInput({ onSubmit, onBack, isBotMode }) {
  const [player1, setPlayer1] = useState("")
  const [player2, setPlayer2] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isBotMode) {
      if (player1.trim()) {
        onSubmit(player1)
      }
    } else {
      if (player1.trim() && player2.trim()) {
        onSubmit(player1, player2)
      }
    }
  }

  return (
    <div className="name-input-container">
      <form onSubmit={handleSubmit} className="name-form">
        <h2>Enter Player Names</h2>

        <div className="form-group">
          <label htmlFor="player1">Player 1 Name</label>
          <input
            id="player1"
            type="text"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            placeholder="Enter your name"
            maxLength="20"
            required
          />
        </div>

        {!isBotMode && (
          <div className="form-group">
            <label htmlFor="player2">Player 2 Name</label>
            <input
              id="player2"
              type="text"
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              placeholder="Enter opponent name"
              maxLength="20"
              required
            />
          </div>
        )}

        <div className="form-buttons">
          <button type="submit" className="btn btn-primary">
            Start Game
          </button>
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
        </div>
      </form>
    </div>
  )
}
