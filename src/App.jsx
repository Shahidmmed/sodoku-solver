import React, { useState } from "react";
import SudokuBoard from "./SudokuBoard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [sudokuBoard, setSudokuBoard] = useState(
    Array.from({ length: 9 }, () => Array(9).fill(""))
  );

  const [error, setError] = useState(null);

  const handleInputChange = (e, rowIndex, colIndex) => {
    const newValue = e.target.value;
    // Check if the entered value is a number
    if (!isNaN(newValue) && newValue !== "") {
      const newBoard = [...sudokuBoard];
      newBoard[rowIndex][colIndex] = newValue;
      setSudokuBoard(newBoard);
      setError(null); // Clear any previous error
    } else {
      const errorMessage = "Please enter a valid number.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
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
          <button type="button" id="solve-button" className="solve-button">
            Solve
          </button>
          <button type="button" id="clear-button" className="clear-button">
            Clear
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
