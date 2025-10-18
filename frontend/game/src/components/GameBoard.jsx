import "../styles/GameBoard.css"

export default function GameBoard({ board, onMove, currentPlayer, isYourTurn, isThinking }) {
  const cols = 7
  const rows = 6

  const handleColumnClick = (column) => {
    if (!isYourTurn || isThinking) return
    onMove(column)
  }

  const renderCell = (index) => {
    const piece = board[index]
    let pieceClass = "empty"
    if (piece === 1) pieceClass = "player1"
    if (piece === 2) pieceClass = "player2"

    const column = index % cols

    return (
      <div key={index} className={`cell ${pieceClass}`} onClick={() => handleColumnClick(column)}>
        <div className="piece"></div>
      </div>
    )
  }

  return (
    <div className="game-board-container">
      <div className="board-wrapper">
        <div className="board-grid">{Array.from({ length: 42 }).map((_, index) => renderCell(index))}</div>

        <div className="column-numbers">
          {Array.from({ length: cols }).map((_, col) => (
            <div key={col} className="column-number">
              {col + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
