import React, { useState } from "react";
import SudokuBoard from "./SudokuBoard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { solve } from "./solver";

function App() {
  const [sudokuBoard, setSudokuBoard] = useState(
    Array.from({ length: 9 }, () => Array(9).fill(""))
  );

  const [error, setError] = useState(null);

  function flatTo2DArray(flatArray) {
    const size = Math.sqrt(flatArray.length);
    const result = [];
    for (let i = 0; i < size; i++) {
      result.push(flatArray.slice(i * size, (i + 1) * size));
    }
    return result;
  }

  const handleInputChange = (e, rowIndex, colIndex) => {
    const newValue = e.target.value;
    // Check if the entered value is a number
    if (!isNaN(newValue) && /^\d{0,1}$/.test(newValue)) {
      const newBoard = [...sudokuBoard];
      newBoard[rowIndex][colIndex] = newValue;
      setSudokuBoard(newBoard);
      setError(null); // Clear any previous error
    } else {
      const errorMessage = "Please enter a valid single digit (0-9).";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const solveSudoku = () => {
    const updatedBoard = Array.from({ length: 9 }, () => Array(9).fill(0));

    const inputs = document.querySelectorAll("input");
    let inputIndex = 0;

    for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
      for (let colIndex = 0; colIndex < 9; colIndex++) {
        const inputValue = inputs[inputIndex].value;
        if (!isNaN(inputValue) && inputValue !== "") {
          updatedBoard[rowIndex][colIndex] = parseInt(inputValue);
        }
        inputIndex++;
      }
    }

    const flatBoard = updatedBoard.flat();
    const solved = solve(flatBoard);
    if (solved) {
      let newBoard = flatTo2DArray(solved);
      setSudokuBoard(newBoard);
      inputIndex = 0;
      for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
        for (let colIndex = 0; colIndex < 9; colIndex++) {
          const value = newBoard[rowIndex][colIndex];
          if (value !== undefined) {
            inputs[inputIndex].value = value === 0 ? "" : value.toString();
          }
          inputIndex++;
        }
      }
    } else {
      const errorMessage = "No solution found.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const clearBoard = () => {
    const clearedBoard = Array.from({ length: 9 }, () => Array(9).fill(""));
    setSudokuBoard(clearedBoard);
    setError(null);
  };

  return (
    <div className="app-container">
      <h2>Sudoku Solver</h2>
      <div className="sudoku-container">
        <SudokuBoard
          sudokuBoard={sudokuBoard}
          handleInputChange={handleInputChange}
        />
        <div className="buttons-container">
          <button
            type="button"
            id="solve-button"
            className="solve-button"
            onClick={solveSudoku}
          >
            Solve
          </button>
          <button
            type="button"
            id="clear-button"
            className="clear-button"
            onClick={clearBoard}
          >
            Clear
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
