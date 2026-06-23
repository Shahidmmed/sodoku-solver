const BOARD_SIZE = 9;
const BOX_SIZE = 3;
const BOARD_CELLS = BOARD_SIZE * BOARD_SIZE;

const indexToRowCol = (index) => ({
  row: Math.floor(index / BOARD_SIZE),
  col: index % BOARD_SIZE,
});

const rowColToIndex = (row, col) => row * BOARD_SIZE + col;

const normalizeCell = (cell) => {
  const value = Number(cell);
  return Number.isInteger(value) && value >= 1 && value <= 9 ? value : 0;
};

export function flatTo2DArray(flatArray) {
  const result = [];

  for (let i = 0; i < BOARD_SIZE; i++) {
    result.push(flatArray.slice(i * BOARD_SIZE, (i + 1) * BOARD_SIZE));
  }

  return result;
}

export function boardToFlat(board) {
  const cells = Array.isArray(board[0]) ? board.flat() : board;
  return cells.map(normalizeCell);
}

const canPlaceValue = (board, index, value) => {
  const { row, col } = indexToRowCol(index);

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[rowColToIndex(r, col)] === value) return false;
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    if (board[rowColToIndex(row, c)] === value) return false;
  }

  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
    for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
      if (board[rowColToIndex(r, c)] === value) return false;
    }
  }

  return true;
};

const getChoices = (board, index) => {
  const choices = [];

  for (let value = 1; value <= BOARD_SIZE; value++) {
    if (canPlaceValue(board, index, value)) {
      choices.push(value);
    }
  }

  return choices;
};

const findBestEmptyCell = (board) => {
  let bestIndex = null;
  let bestChoices = [];

  for (let index = 0; index < BOARD_CELLS; index++) {
    if (board[index] === 0) {
      const choices = getChoices(board, index);

      if (bestIndex === null || choices.length < bestChoices.length) {
        bestIndex = index;
        bestChoices = choices;
      }

      if (bestChoices.length === 0) break;
    }
  }

  return { index: bestIndex, choices: bestChoices };
};

export function hasBoardConflict(board) {
  const flatBoard = boardToFlat(board);

  for (let index = 0; index < BOARD_CELLS; index++) {
    const value = flatBoard[index];

    if (value !== 0) {
      flatBoard[index] = 0;

      if (!canPlaceValue(flatBoard, index, value)) {
        return true;
      }

      flatBoard[index] = value;
    }
  }

  return false;
}

export function hasCellConflict(board, row, col) {
  const flatBoard = boardToFlat(board);
  const index = rowColToIndex(row, col);
  const value = flatBoard[index];

  if (value === 0) return false;

  flatBoard[index] = 0;
  return !canPlaceValue(flatBoard, index, value);
}

const solveFlatBoard = (board) => {
  const { index, choices } = findBestEmptyCell(board);

  if (index === null) return true;

  for (const choice of choices) {
    board[index] = choice;

    if (solveFlatBoard(board)) {
      return true;
    }
  }

  board[index] = 0;
  return false;
};

export function solveBoard(board) {
  const flatBoard = boardToFlat(board);

  if (flatBoard.length !== BOARD_CELLS || hasBoardConflict(flatBoard)) {
    return null;
  }

  return solveFlatBoard(flatBoard) ? flatTo2DArray(flatBoard) : null;
}

export const solve = (board) => solveBoard(board) ?? 0;
