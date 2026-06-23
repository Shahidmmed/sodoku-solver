/* eslint-disable react/prop-types */

function SudokuBoard({
  sudokuBoard,
  fixedCells,
  incorrectCells,
  inputHighlightCells,
  handleInputChange,
}) {
  function getSquareColor(rowIndex, colIndex) {
    // Calculate the square index (0 to 8) based on row and column indices.
    const squareIndex =
      Math.floor(rowIndex / 3) * 3 + Math.floor(colIndex / 3);

    // Apply different colors to alternating 3x3 squares.
    return squareIndex % 2 === 0 ? "square-color-1" : "square-color-2";
  }

  return (
    <div className="sudoku-board">
      {sudokuBoard.map((row, rowIndex) => (
        <div className="sudoku-row" key={rowIndex}>
          {row.map((cell, colIndex) => {
            const className = [
              "sudoku-cell",
              getSquareColor(rowIndex, colIndex),
              inputHighlightCells[rowIndex][colIndex] ? "solved-input" : "",
              incorrectCells[rowIndex][colIndex] ? "incorrect-input" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <input
                id={`${rowIndex}-${colIndex}`}
                type="text"
                inputMode="numeric"
                pattern="[1-9]"
                maxLength="1"
                aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}`}
                className={className}
                disabled={fixedCells[rowIndex][colIndex]}
                key={colIndex}
                value={cell === 0 ? "" : cell}
                onChange={(e) => handleInputChange(e, rowIndex, colIndex)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default SudokuBoard;
