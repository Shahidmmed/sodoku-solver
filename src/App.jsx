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

const ACCENT_COLORS = [
  { color: "#14b8a6", hover: "#0f766e", focus: "rgba(20, 184, 166, 0.32)" },
  { color: "#f97316", hover: "#c2410c", focus: "rgba(249, 115, 22, 0.32)" },
  { color: "#22c55e", hover: "#15803d", focus: "rgba(34, 197, 94, 0.32)" },
  { color: "#0ea5e9", hover: "#0369a1", focus: "rgba(14, 165, 233, 0.32)" },
  { color: "#eab308", hover: "#a16207", focus: "rgba(234, 179, 8, 0.32)" },
  { color: "#ec4899", hover: "#be185d", focus: "rgba(236, 72, 153, 0.32)" },
  { color: "#ef4444", hover: "#b91c1c", focus: "rgba(239, 68, 68, 0.32)" },
  { color: "#84cc16", hover: "#4d7c0f", focus: "rgba(132, 204, 22, 0.32)" },
  { color: "#06b6d4", hover: "#0e7490", focus: "rgba(6, 182, 212, 0.32)" },
  { color: "#3b82f6", hover: "#1d4ed8", focus: "rgba(59, 130, 246, 0.32)" },
  { color: "#8b5cf6", hover: "#6d28d9", focus: "rgba(139, 92, 246, 0.32)" },
  { color: "#d946ef", hover: "#a21caf", focus: "rgba(217, 70, 239, 0.32)" },
  { color: "#f43f5e", hover: "#be123c", focus: "rgba(244, 63, 94, 0.32)" },
  { color: "#f59e0b", hover: "#b45309", focus: "rgba(245, 158, 11, 0.32)" },
  { color: "#10b981", hover: "#047857", focus: "rgba(16, 185, 129, 0.32)" },
  { color: "#38bdf8", hover: "#0284c7", focus: "rgba(56, 189, 248, 0.32)" },
  { color: "#a3e635", hover: "#65a30d", focus: "rgba(163, 230, 53, 0.32)" },
  { color: "#fb7185", hover: "#e11d48", focus: "rgba(251, 113, 133, 0.32)" },
];

const getRandomAccent = (currentAccent) => {
  const availableAccents = ACCENT_COLORS.filter(
    (accent) => accent.color !== currentAccent?.color
  );
  const accents = availableAccents.length ? availableAccents : ACCENT_COLORS;
  const randomIndex = Math.floor(Math.random() * accents.length);

  return accents[randomIndex];
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
  const [accentColor, setAccentColor] = useState(() => getRandomAccent());
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
    setAccentColor((currentAccent) => getRandomAccent(currentAccent));

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
    <div
      className="app-container"
      style={{
        "--accent-color": accentColor.color,
        "--accent-hover": accentColor.hover,
        "--accent-focus": accentColor.focus,
      }}
    >
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
