import { useState, useEffect } from "react"
import "../styles/Leaderboard.css"

export default function Leaderboard({ onBack }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [sortBy, setSortBy] = useState("wins")

  useEffect(() => {
    try {
      const stored = localStorage.getItem("connectFourLeaderboard")
      const data = stored ? JSON.parse(stored) : []
      setLeaderboard(data)
    } catch (err) {
      console.error("Error loading leaderboard:", err)
    }
  }, [])

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (sortBy === "wins") {
      return (b.wins || 0) - (a.wins || 0)
    } else if (sortBy === "losses") {
      return (b.losses || 0) - (a.losses || 0)
    } else {
      const aWinRate = (a.wins || 0) / ((a.wins || 0) + (a.losses || 0)) || 0
      const bWinRate = (b.wins || 0) / ((b.wins || 0) + (b.losses || 0)) || 0
      return bWinRate - aWinRate
    }
  })

  const clearLeaderboard = () => {
    if (window.confirm("Are you sure you want to clear the leaderboard?")) {
      localStorage.removeItem("connectFourLeaderboard")
      setLeaderboard([])
    }
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <h1 className="leaderboard-title">🏆 LEADERBOARD 🏆</h1>
          <p className="leaderboard-subtitle">Connect Four Champions</p>
        </div>

        <div className="sort-buttons">
          <button className={`sort-btn ${sortBy === "wins" ? "active" : ""}`} onClick={() => setSortBy("wins")}>
            Most Wins
          </button>
          <button className={`sort-btn ${sortBy === "losses" ? "active" : ""}`} onClick={() => setSortBy("losses")}>
            Most Losses
          </button>
          <button className={`sort-btn ${sortBy === "winrate" ? "active" : ""}`} onClick={() => setSortBy("winrate")}>
            Win Rate
          </button>
        </div>

        {leaderboard.length === 0 ? (
          <div className="empty-state">
            <p className="empty-message">No players yet. Start playing to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="leaderboard-table">
            <div className="table-header">
              <div className="rank-col">Rank</div>
              <div className="name-col">Player Name</div>
              <div className="wins-col">Wins</div>
              <div className="losses-col">Losses</div>
              <div className="winrate-col">Win Rate</div>
            </div>

            {sortedLeaderboard.map((player, index) => {
              const totalGames = (player.wins || 0) + (player.losses || 0)
              const winRate = totalGames > 0 ? (((player.wins || 0) / totalGames) * 100).toFixed(1) : 0
              const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`

              return (
                <div key={player.name} className={`table-row ${index < 3 ? "top-player" : ""}`}>
                  <div className="rank-col medal">{medal}</div>
                  <div className="name-col">{player.name}</div>
                  <div className="wins-col">{player.wins || 0}</div>
                  <div className="losses-col">{player.losses || 0}</div>
                  <div className="winrate-col">{winRate}%</div>
                </div>
              )
            })}
          </div>
        )}

        <div className="leaderboard-buttons">
          <button className="btn btn-primary" onClick={onBack}>
            Back to Menu
          </button>
          <button className="btn btn-danger" onClick={clearLeaderboard}>
            Clear Leaderboard
          </button>
        </div>
      </div>
    </div>
  )
}
