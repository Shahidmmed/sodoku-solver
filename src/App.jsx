import { useState } from "react";
import SudokuBoard from "./SudokuBoard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { hasBoardConflict, hasCellConflict, solveBoard } from "./solver";
import { generateSudokuPuzzle } from "./loader";

const createEmptyBoard = (value = "") =>
  Array.from({ length: 9 }, () => Array(9).fill(value));

const createFixedCells = (board) =>
  board.map((row) => row.map((cell) => cell !== 0 && cell !== ""));

const updateCell = (board, rowIndex, colIndex, value) =>
  board.map((row, currentRowIndex) =>
    currentRowIndex === rowIndex
      ? row.map((cell, currentColIndex) =>
          currentColIndex === colIndex ? value : cell
        )
      : row
  );

const isBoardEmpty = (board) =>
  board.every((row) => row.every((cell) => cell === 0 || cell === ""));

const isBoardComplete = (board) =>
  board.every((row) => row.every((cell) => cell !== 0 && cell !== ""));

const createIncorrectCells = (board, solvedBoard) =>
  board.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      if (cell === 0 || cell === "") return false;
      if (hasCellConflict(board, rowIndex, colIndex)) return true;

      return Boolean(
        solvedBoard?.length && Number(cell) !== solvedBoard[rowIndex][colIndex]
      );
    })
  );

function App() {
  const [sudokuBoard, setSudokuBoard] = useState(createEmptyBoard);
  const [fixedCells, setFixedCells] = useState(() => createEmptyBoard(false));

  const [isSolved, setIsSolved] = useState(false);
  const [solved, setSolved] = useState(null);
  const [statusMessage, setStatusMessage] = useState(
    "Load a puzzle or enter your own numbers to get started."
  );

  const incorrectCells = createIncorrectCells(sudokuBoard, solved);

  function loadSudoku() {
    setIsSolved(false);

    const sudokuProblem = generateSudokuPuzzle();

    if (sudokuProblem) {
      const solvedPuzzle = solveBoard(sudokuProblem);

      if (!Array.isArray(solvedPuzzle)) {
        const errorMessage = "Could not solve generated board.";
        setStatusMessage(errorMessage);
        toast.error(errorMessage);
        return;
      }

      setSolved(solvedPuzzle);
      setSudokuBoard(sudokuProblem);
      setFixedCells(createFixedCells(sudokuProblem));
      setStatusMessage("New puzzle loaded. Fill the empty cells to solve it.");
    } else {
      const errorMessage = "Could not generate board.";
      setStatusMessage(errorMessage);
      toast.error(errorMessage);
    }
  }

  const handleInputChange = (e, rowIndex, colIndex) => {
    if (fixedCells[rowIndex][colIndex] || isSolved) return;

    const newValue = e.target.value.trim();

    if (newValue === "") {
      setSudokuBoard((currentBoard) =>
        updateCell(currentBoard, rowIndex, colIndex, "")
      );
      setStatusMessage("Cell cleared.");
      return;
    }

    if (!/^[1-9]$/.test(newValue)) {
      setStatusMessage("Use digits 1 through 9 only.");
      return;
    }

    const parsedValue = Number(newValue);
    const nextBoard = updateCell(
      sudokuBoard,
      rowIndex,
      colIndex,
      parsedValue
    );

    setSudokuBoard(nextBoard);
    setIsSolved(false);

    if (hasCellConflict(nextBoard, rowIndex, colIndex)) {
      setStatusMessage(
        "That digit conflicts with the current row, column, or box."
      );
      return;
    }

    if (solved?.length && parsedValue !== solved[rowIndex][colIndex]) {
      setStatusMessage(
        "That digit does not match the loaded puzzle's solution."
      );
      return;
    }

    if (
      isBoardComplete(nextBoard) &&
      !createIncorrectCells(nextBoard, solved).flat().some(Boolean)
    ) {
      setIsSolved(true);
      setFixedCells(createEmptyBoard(true));
      setStatusMessage("Great job, the puzzle is complete.");
      toast.success("Puzzle complete!");
      return;
    }

    setStatusMessage("Good move.");
  };

  const solveSudoku = () => {
    if (isSolved) {
      const errorMessage =
        "The board is already solved, no need to solve it again.";
      setStatusMessage(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (isBoardEmpty(sudokuBoard)) {
      const errorMessage = "Enter a puzzle or load one before solving.";
      setStatusMessage(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (hasBoardConflict(sudokuBoard)) {
      const errorMessage = "Fix the highlighted conflicts before solving.";
      setStatusMessage(errorMessage);
      toast.error(errorMessage);
      return;
    }

    const solvedPuzzle = solveBoard(sudokuBoard);

    if (solvedPuzzle) {
      setSolved(solvedPuzzle);
      setSudokuBoard(solvedPuzzle);
      setFixedCells(createEmptyBoard(true));
      setIsSolved(true);
      setStatusMessage("Solved the current board.");
      toast.success("Solved!");
    } else {
      const errorMessage = "No solution found.";
      setStatusMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  const clearBoard = () => {
    setSudokuBoard(createEmptyBoard());
    setFixedCells(createEmptyBoard(false));
    setSolved(null);
    setIsSolved(false);
    setStatusMessage("Board cleared. Enter a puzzle or load a new one.");
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
      <p className="status-message" role="status">
        {statusMessage}
      </p>
      <div className="sudoku-container">
        <SudokuBoard
          sudokuBoard={sudokuBoard}
          fixedCells={fixedCells}
          incorrectCells={incorrectCells}
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
