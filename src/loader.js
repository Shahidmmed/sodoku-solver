import { hasBoardConflict, solveBoard } from "./solver";

// Function to generate a Sudoku puzzle and ensure it's solvable.
export function generateSudokuPuzzle() {
  let grid;
  let solvable = false;

  while (!solvable) {
    // Create an empty Sudoku grid (9x9 array).
    grid = Array.from({ length: 9 }, () => Array(9).fill(0));

    // Fill the grid with a solved Sudoku puzzle.
    const initialValuesCount = Math.floor(Math.random() * 11) + 20;

    for (let i = 0; i < initialValuesCount; i++) {
      insertRandomNumber(grid);
    }

    // Check if the puzzle has a unique solution.
    if (hasUniqueSolution([...grid])) {
      solvable = true;
    } else {
      // If it's not solvable, reset the grid and try again.
      grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    }
  }

  fillSudoku(grid);

  // Define the number of cells to remove to create the puzzle.
  const difficulty = 40; // Adjust this to control the puzzle's difficulty.

  // Randomly remove numbers while ensuring a unique solution.
  removeNumbers(grid, difficulty);

  return grid;
}

// Fill the Sudoku grid with a solved puzzle using your provided solver.
function fillSudoku(grid) {
  const solution = solveBoard(grid);

  if (solution) {
    grid.splice(0, grid.length, ...solution);
  }
}

// Define a function to insert a random number into the grid following Sudoku rules.
function insertRandomNumber(grid) {
  const emptyCells = [];

  // Find all empty cells in the grid.
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        emptyCells.push({ row, col });
      }
    }
  }

  if (emptyCells.length === 0) {
    return; // No empty cells left, we are done.
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  const { row, col } = emptyCells[randomIndex];

  // Generate a random number between 1 and 9.
  const value = Math.floor(Math.random() * 9) + 1;

  // Check if the generated number is valid in this position.
  if (isValidMove(grid, row, col, value)) {
    grid[row][col] = value;
  } else {
    // If the number is not valid, try again.
    insertRandomNumber(grid);
  }
}

// Define a function to check if a number can be placed in a cell following Sudoku rules.
function isValidMove(grid, row, col, value) {
  const nextGrid = grid.map((currentRow) => [...currentRow]);
  nextGrid[row][col] = value;
  return !hasBoardConflict(nextGrid);
}

// Remove numbers from the Sudoku grid while ensuring uniqueness.
function removeNumbers(grid, toRemove) {
  const cells = Array.from({ length: 81 }, (_, index) => index);
  const removedCells = [];

  while (toRemove > 0) {
    if (cells.length === 0) {
      break;
    }

    const randomIndex = Math.floor(Math.random() * cells.length);
    const cell = cells.splice(randomIndex, 1)[0];
    const row = Math.floor(cell / 9);
    const col = cell % 9;

    if (grid[row][col] === 0) {
      continue; // Skip already empty cells.
    }

    const backup = grid[row][col];
    grid[row][col] = 0;

    // Check if the puzzle still has a unique solution.
    if (!hasUniqueSolution([...grid])) {
      grid[row][col] = backup; // Restore the number.
    } else {
      removedCells.push({ row, col });
      toRemove--;
    }
  }

  // If you run out of available cells before reaching the desired difficulty level,
  // you can choose to reinsert some removed cells and try again.
  if (toRemove > 0) {
    for (const cell of removedCells) {
      grid[cell.row][cell.col] = 0;
    }
  }
}

// Check if a Sudoku puzzle has a unique solution using your provided solver.
function hasUniqueSolution(grid) {
  return solveBoard(grid) !== null;
}

