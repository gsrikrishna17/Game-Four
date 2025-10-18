import { useEffect } from "react"
import "../styles/GameResults.css"

export default function GameResults({ result, onPlayAgain, onBack }) {
  const isWin = result.winner !== "Draw"
  const totalScore = (result.bonusTime || 0) + (result.bonusWin || 0)

  useEffect(() => {
    if (isWin && result.winner !== "Bot") {
      try {
        const stored = localStorage.getItem("connectFourLeaderboard")
        const leaderboard = stored ? JSON.parse(stored) : []

        // Find or create player entry
        let playerEntry = leaderboard.find((p) => p.name === result.winner)
        if (!playerEntry) {
          playerEntry = { name: result.winner, wins: 0, losses: 0 }
          leaderboard.push(playerEntry)
        }

        playerEntry.wins = (playerEntry.wins || 0) + 1
        localStorage.setItem("connectFourLeaderboard", JSON.stringify(leaderboard))
      } catch (err) {
        console.error("Error saving to leaderboard:", err)
      }
    } else if (isWin && result.loser && result.loser !== "Bot") {
      // Save loser's loss
      try {
        const stored = localStorage.getItem("connectFourLeaderboard")
        const leaderboard = stored ? JSON.parse(stored) : []

        let playerEntry = leaderboard.find((p) => p.name === result.loser)
        if (!playerEntry) {
          playerEntry = { name: result.loser, wins: 0, losses: 0 }
          leaderboard.push(playerEntry)
        }

        playerEntry.losses = (playerEntry.losses || 0) + 1
        localStorage.setItem("connectFourLeaderboard", JSON.stringify(leaderboard))
      } catch (err) {
        console.error("Error saving to leaderboard:", err)
      }
    }
  }, [result, isWin])

  return (
    <div className="results-container">
      <div className="results-card">
        <div className="results-header">
          <h2 className="results-title">{result.winner === "Draw" ? "DRAW" : `${result.winner.toUpperCase()} WINS`}</h2>
        </div>

        {isWin && (
          <div className="results-stats">
            <div className="stat">
              <span className="stat-label">BONUS TIME:</span>
              <span className="stat-value">{result.bonusTime}</span>
            </div>
            <div className="stat">
              <span className="stat-label">BONUS WIN:</span>
              <span className="stat-value">{result.bonusWin}</span>
            </div>
            <div className="stat total">
              <span className="stat-label">TOTAL SCORE</span>
              <span className="stat-value">{totalScore}</span>
            </div>
          </div>
        )}

        {!isWin && (
          <div className="draw-message">
            <p>The board is full! No winner this time.</p>
          </div>
        )}

        <div className="results-buttons">
          <button className="btn btn-primary" onClick={onPlayAgain}>
            Play Again
          </button>
          <button className="btn btn-secondary" onClick={onBack}>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  )
}
