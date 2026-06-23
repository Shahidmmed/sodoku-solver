import { useEffect, useState } from "react";
import SudokuBoard from "./SudokuBoard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { hasBoardConflict, hasCellConflict, solveBoard } from "./solver";
import { generateSudokuPuzzle } from "./loader";

const createEmptyBoard = (value = "") =>
  Array.from({ length: 9 }, () => Array(9).fill(value));

const DIFFICULTIES = {
  easy: { label: "Easy", cellsToRemove: 32 },
  medium: { label: "Medium", cellsToRemove: 40 },
  hard: { label: "Hard", cellsToRemove: 48 },
};

const FEEDBACK_MODES = {
  alert: {
    label: "Alert",
    description: "Shows mistakes as you type.",
  },
  passive: {
    label: "Passive",
    description: "Shows mistakes after the board is filled.",
  },
};

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

const createInputHighlightCells = (fixedCells) =>
  fixedCells.map((row) => row.map((isFixed) => !isFixed));

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

function App() {
  const [sudokuBoard, setSudokuBoard] = useState(createEmptyBoard);
  const [fixedCells, setFixedCells] = useState(() => createEmptyBoard(false));
  const [inputHighlightCells, setInputHighlightCells] = useState(() =>
    createEmptyBoard(false)
  );

  const [isSolved, setIsSolved] = useState(false);
  const [solved, setSolved] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [feedbackMode, setFeedbackMode] = useState("alert");
  const [revealedMistakeCells, setRevealedMistakeCells] = useState(() =>
    createEmptyBoard(false)
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Load a puzzle or enter your own numbers to get started."
  );

  const currentMistakeCells = createIncorrectCells(sudokuBoard, solved);
  const incorrectCells =
    feedbackMode === "alert" ? currentMistakeCells : revealedMistakeCells;

  useEffect(() => {
    if (!isTimerRunning) return undefined;

    const timerId = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isTimerRunning]);

  function loadSudoku() {
    setIsSolved(false);

    const sudokuProblem = generateSudokuPuzzle(
      DIFFICULTIES[difficulty].cellsToRemove
    );

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
      setInputHighlightCells(createEmptyBoard(false));
      setRevealedMistakeCells(createEmptyBoard(false));
      setElapsedSeconds(0);
      setIsTimerRunning(true);
      setStatusMessage(
        `${DIFFICULTIES[difficulty].label} puzzle loaded. Fill the empty cells to solve it.`
      );
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
      setRevealedMistakeCells(createEmptyBoard(false));
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
    setInputHighlightCells(createEmptyBoard(false));
    setIsTimerRunning(true);

    if (feedbackMode === "passive") {
      if (!isBoardComplete(nextBoard)) {
        setRevealedMistakeCells(createEmptyBoard(false));
        setStatusMessage("Move recorded.");
        return;
      }

      const mistakeCells = createIncorrectCells(nextBoard, solved);
      const hasMistakes = mistakeCells.flat().some(Boolean);

      if (hasMistakes) {
        setRevealedMistakeCells(mistakeCells);
        setStatusMessage("Board filled. Review the highlighted cells.");
        return;
      }

      setRevealedMistakeCells(createEmptyBoard(false));
      setIsSolved(true);
      setIsTimerRunning(false);
      setInputHighlightCells(createInputHighlightCells(fixedCells));
      setFixedCells(createEmptyBoard(true));
      setStatusMessage(
        `Great job, the puzzle is complete in ${formatTime(elapsedSeconds)}.`
      );
      toast.success("Puzzle complete!");
      return;
    }

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
      setIsTimerRunning(false);
      setInputHighlightCells(createInputHighlightCells(fixedCells));
      setFixedCells(createEmptyBoard(true));
      setStatusMessage(
        `Great job, the puzzle is complete in ${formatTime(elapsedSeconds)}.`
      );
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
      setRevealedMistakeCells(currentMistakeCells);
      const errorMessage = "Fix the highlighted conflicts before solving.";
      setStatusMessage(errorMessage);
      toast.error(errorMessage);
      return;
    }

    const solvedPuzzle = solveBoard(sudokuBoard);

    if (solvedPuzzle) {
      setSolved(solvedPuzzle);
      setSudokuBoard(solvedPuzzle);
      setInputHighlightCells(createInputHighlightCells(fixedCells));
      setFixedCells(createEmptyBoard(true));
      setIsSolved(true);
      setIsTimerRunning(false);
      setStatusMessage(`Solved the current board in ${formatTime(elapsedSeconds)}.`);
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
    setInputHighlightCells(createEmptyBoard(false));
    setRevealedMistakeCells(createEmptyBoard(false));
    setSolved(null);
    setIsSolved(false);
    setElapsedSeconds(0);
    setIsTimerRunning(false);
    setStatusMessage("Board cleared. Enter a puzzle or load a new one.");
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <p className="eyebrow">Interactive Sudoku</p>
        <h1>Sudoku Solver</h1>
        <p className="subtitle">
          Load a fresh puzzle, play through it with instant feedback, or enter
          your own board and solve it.
        </p>
      </header>

      <main className="game-card">
        <div className="game-panel">
          <div className="panel-header">
            <div>
              <p className="section-label">Board</p>
              <h2>Make your next move</h2>
            </div>
            <div className="game-meta">
              <span className="timer" aria-label="Elapsed time">
                {formatTime(elapsedSeconds)}
              </span>
              <span className={isSolved ? "game-state solved" : "game-state"}>
                {isSolved ? "Solved" : "In progress"}
              </span>
            </div>
          </div>

          <p className="status-message" role="status">
            {statusMessage}
          </p>

          <div className="game-options" aria-label="Game settings">
            <label>
              Difficulty
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
              >
                {Object.entries(DIFFICULTIES).map(([value, option]) => (
                  <option key={value} value={value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Feedback
              <select
                value={feedbackMode}
                onChange={(event) => {
                  setFeedbackMode(event.target.value);
                  setRevealedMistakeCells(createEmptyBoard(false));
                  setStatusMessage(FEEDBACK_MODES[event.target.value].description);
                }}
              >
                {Object.entries(FEEDBACK_MODES).map(([value, option]) => (
                  <option key={value} value={value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <SudokuBoard
            sudokuBoard={sudokuBoard}
            fixedCells={fixedCells}
            incorrectCells={incorrectCells}
            inputHighlightCells={inputHighlightCells}
            handleInputChange={handleInputChange}
          />

          <div className="buttons-container" aria-label="Sudoku actions">
            <button
              type="button"
              id="load-button"
              className="load-button"
              onClick={loadSudoku}
            >
              New Puzzle
            </button>
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

        <aside className="rules-card">
          <p className="section-label">How to Play</p>
          <h2>Simple rules, smart feedback</h2>
          <p>
            Fill every empty cell with digits from 1 to 9. Each row, column,
            and 3x3 box can contain each digit only once.
          </p>
          <ul>
            <li>Choose Easy, Medium, or Hard before loading a new puzzle.</li>
            <li>Alert mode shows mistakes as you type.</li>
            <li>Passive mode waits until the board is filled to reveal mistakes.</li>
            <li>Prefilled puzzle cells are locked so you can focus on gaps.</li>
          </ul>
        </aside>
      </main>
      <ToastContainer />
    </div>
  );
}

export default App;
