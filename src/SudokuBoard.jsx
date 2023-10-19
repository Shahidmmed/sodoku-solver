import React from "react";

function SudokuBoard({ sudokuBoard, handleInputChange }) {
  function getSquareColor(rowIndex, colIndex) {
    // Calculate the square index (0 to 8) based on row and column indices.
    const squareIndex =
      Math.floor(rowIndex / 3) * 3 + Math.floor(colIndex / 3) * 3;

    // Apply different colors to alternating 3x3 squares.
    return squareIndex % 2 === 0 ? "square-color-1" : "square-color-2";
  }

  const handleKeyDown = (e, rowIndex, colIndex) => {
    if (e.key === "Backspace") {
      const mockEvent = { target: { value: "" } };
      handleInputChange(mockEvent, rowIndex, colIndex);
    }
  };

  return (
    <div className="sudoku-board">
      {sudokuBoard.map((row, rowIndex) => (
        <div className="sudoku-row" key={rowIndex}>
          {row.map((cell, colIndex) => (
            <input
              type="text"
              className={`sudoku-cell ${getSquareColor(rowIndex, colIndex)}`}
              key={colIndex}
              value={cell}
              onChange={(e) => handleInputChange(e, rowIndex, colIndex)}
              onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default SudokuBoard;
