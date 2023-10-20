import React, { useState } from "react";
import SudokuBoard from "./SudokuBoard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { solve } from "./solver";
import { generateSudokuPuzzle } from "./loader";

function App() {
  const [sudokuBoard, setSudokuBoard] = useState(
    Array.from({ length: 9 }, () => Array(9).fill(""))
  );

  const [error, setError] = useState(null);
  const [isSolved, setIsSolved] = useState(false);

  function convertInputsToBoard() {
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

    return updatedBoard;
  }

  function loadSudoku() {
    setIsSolved(false);
    const sudokuProblem = generateSudokuPuzzle();
    const inputs = document.querySelectorAll("input");
    if (sudokuProblem) {
      setSudokuBoard(sudokuProblem);
      let inputIndex = 0;
      for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
        for (let colIndex = 0; colIndex < 9; colIndex++) {
          const value = sudokuProblem[rowIndex][colIndex];
          const input = inputs[inputIndex];

          if (value !== undefined) {
            if (value === 0) {
              input.value = ""; // Set the input field to be empty for zero.
              console.log("val aft", input.value);
              input.disabled = false; // Enable the input field for user input.
            } else {
              input.value = value.toString();
              input.disabled = true; // Disable the input field for pre-filled values.
            }
          }
          console.log(input);
          inputIndex++;
        }
      }
      //console.log(inputs);
    } else {
      const errorMessage = "Could not generate board.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }

  const handleInputChange = (e, rowIndex, colIndex) => {
    const newValue = e.target.value;
    // Check if the entered value is a number
    if (!isNaN(newValue) && /^\d{0,1}$/.test(newValue)) {
      const newBoard = [...sudokuBoard];
      newBoard[rowIndex][colIndex] = newValue;
      setSudokuBoard(newBoard);
      setError(null);
    } else {
      const errorMessage = "Please enter a valid single digit (1-9).";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const solveSudoku = () => {
    if (isSolved) {
      const errorMessage =
        "The board is already solved, no need to solve it again.";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    const flatBoard = convertInputsToBoard().flat();
    const inputs = document.querySelectorAll("input");
    const solved = solve(flatBoard);
    if (solved) {
      setSudokuBoard(solved);
      let inputIndex = 0;
      for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
        for (let colIndex = 0; colIndex < 9; colIndex++) {
          const value = solved[rowIndex][colIndex];
          if (value !== undefined) {
            inputs[inputIndex].value = value === 0 ? "" : value.toString();
          }
          inputIndex++;
        }
      }
      setIsSolved(true);
    } else {
      const errorMessage = "No solution found.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const clearBoard = () => {
    const clearedBoard = Array.from({ length: 9 }, () => Array(9).fill(""));
    setSudokuBoard(clearedBoard);
    setIsSolved(false);
    setError(null);
  };

  return (
    <div className="app-container">
      <h2>Sudoku Solver</h2>
      <div className="guide">
        <p>
          👉 Enter a valid sudoku puzzle, then click the Solve button to see the
          solution.
        </p>
        <p>👉 Click the Clear button to clear the board.</p>
        <p>
          👉 Hit Load to load a new random puzzle for you to solve. You can
          refer to the rules of the game below
        </p>
      </div>
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
          <button
            type="button"
            id="load-button"
            className="load-button"
            onClick={loadSudoku}
          >
            Load
          </button>
        </div>
      </div>
      <div className="rules">
        <h2>Rules</h2>
        <p>
          The goal of Sudoku is to fill in a 9×9 grid with digits so that each
          column, row, and 3×3 section contain the numbers between 1 to 9. At
          the beginning of the game, the 9×9 grid will have some of the squares
          filled in. Your job is to use logic to fill in the missing digits and
          complete the grid. Don’t forget, a move is incorrect if:
        </p>
        <p>👉 Any row contains more than one of the same number from 1 to 9</p>
        <p>
          👉 Any column contains more than one of the same number from 1 to 9
        </p>
        <p>
          👉 Any 3×3 grid contains more than one of the same number from 1 to 9
        </p>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
