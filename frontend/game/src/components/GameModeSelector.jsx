import { Trophy, Bot, Users } from "lucide-react";
import "../styles/GameModeSelector.css";

export default function GameModeSelector({ onSelectMode }) {
  return (
    <div className="mode-selector-container">
      <h2>CHOOSE GAME MODE</h2>

      <div className="mode-buttons">
        <button
          className="mode-button player-vs-bot"
          onClick={() => onSelectMode("bot")}
        >
          <div className="mode-icon">
            <Bot size={70} />
          </div>
          <div className="mode-label">Player vs Bot</div>
        </button>

        <button
          className="mode-button player-vs-player"
          onClick={() => onSelectMode("local")}
        >
          <div className="mode-icon">
            <Users size={70} />
          </div>
          <div className="mode-label">Player vs Player</div>
        </button>
      </div>

      <button
        className="leaderboard-btn"
        onClick={() => onSelectMode("leaderboard")}
      >
        <Trophy size={24} />
        <span>View Leaderboard</span>
      </button>
    </div>
  );
}
