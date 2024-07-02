//takes an index (from 0 to 80) and converts it into row and column coordinates in a 9x9 Sudoku grid
const indexToRowCol = (index) => {
  return { row: Math.floor(index / 9), col: index % 9 };
};

//does the reverse, taking row and column coordinates and converting them into a single index
const rowColToIndex = (row, col) => row * 9 + col;

//checks if it's valid to place a specific value at a given index on the Sudoku board
//if the value is not present in the same row, column, or 3x3 subgrid
const  acceptable = (board, index, value) => {
  let { row, col } = indexToRowCol(index);
  for (let r = 0; r < 9; ++r) {
    if (board[rowColToIndex(r, col)] == value) return false;
  }
  for (let c = 0; c < 9; ++c) {
    if (board[rowColToIndex(row, c)] == value) return false;
  }

  let r1 = Math.floor(row / 3) * 3;
  let c1 = Math.floor(col / 3) * 3;
  for (let r = r1; r < r1 + 3; ++r) {
    for (let c = c1; c < c1 + 3; ++c) {
      if (board[rowColToIndex(r, c)] == value) return false;
    }
  }
  return true;
};

// returns an array of valid numbers that can be placed at a given index on the Sudoku board
const getChoices = (board, index) => {
  let choices = [];

  for (let value = 1; value <= 9; ++value) {
    if (acceptable(board, index, value)) {
      choices.push(value);
    }
  }
  return choices;
};

const bestBet = (board) => {
  let index,
    moves,
    bestLen = 100;

  for (let i = 0; i < 81; ++i) {
    if (board[i] === 0) {
      let m = getChoices(board, i);
      if (m.length < bestLen) {
        bestLen = m.length;
        moves = m;
        index = i;
        if (bestLen === 0) break;
      }
    }
  }
  return { index, moves };
};

export function flatTo2DArray(flatArray) {
  const size = Math.sqrt(flatArray.length);
  const result = [];
  for (let i = 0; i < size; i++) {
    result.push(flatArray.slice(i * size, (i + 1) * size));
  }
  return result;
}

export const solve = (board) => {
  let { index, moves } = bestBet(board);
  if (index == null) return true;
  for (let m of moves) {
    board[index] = m;
    if (solve(board)) return flatTo2DArray(board);
  }
  board[index] = 0;
  return 0;
};
