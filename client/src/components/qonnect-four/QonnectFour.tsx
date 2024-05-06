import { useState } from "react";
import {
  QonnectFourAvatar,
  QonnectFourBoard,
  QonnectFourCell,
  QonnectFourContainer,
  QonnectFourPlayer,
  QonnectFourPlayerCol,
  QonnectFourPlayerText,
  QonnectFourPlayerTimer,
  QonnectFourRow,
  QonnectFourScoreboard,
  QonnectFourVSText,
  ResetButton,
  WinnerText,
  WinnnerRow,
} from "./QonnectFour-Styles";
import { StarSVG } from "../common/icons/StarSVG";

// Define the Piece Colors interface for the QonnectFourCell component props
export interface PieceColors {
  player: string;
  isWinningCell?: boolean;
  onClick?: () => void;
}
// Winning Info Interface
interface WinningInfo {
  player: Player | null;
  winningCells: number[][] | null;
}
// Define the type for the board cell (each cell will hold a player's piece)
type Player = "R" | "B" | ""; // "R" for red, "B" for blue, "" for empty
// Define the type for the board, which is a 2D array of Player types
type Board = Player[][];

export const QonnectFour = () => {
  // Qonnect Four Board
  const rows = 6;
  const columns = 7;
  const playerRed = "R";
  const playerBlue = "B";

  // Initialize the board as a 2D array of Player types
  const [board, setBoard] = useState<Board>(() => {
    const initialBoard: Board = [];
    for (let i = 0; i < rows; i++) {
      initialBoard.push(Array(columns).fill(""));
    }
    return initialBoard;
  });
  const [currColumns, setCurrColumns] = useState<number[]>([
    5, 5, 5, 5, 5, 5, 5,
  ]);
  const [currentPlayer, setCurrentPlayer] = useState<string>(playerRed);
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [gameWinningCells, setGameWinningCells] = useState<number[][] | null>(
    null
  );

  // Function to handle placing a piece on the board
  const setPieceFunc = (rowIndex: number, colIndex: number) => {
    if (gameWinner) return;
    // Get the current player
    const newCurrentPlayer: Player =
      currentPlayer === playerRed ? playerBlue : playerRed;

    // Check if the column is full
    rowIndex = currColumns[colIndex];
    if (rowIndex < 0) return;

    // Update the board with the current player's piece
    const newBoard: Board = [...board];
    newBoard[rowIndex][colIndex] = newCurrentPlayer;
    setBoard(newBoard);
    // Update the current player state
    setCurrentPlayer(newCurrentPlayer);
    // Decrements the value stored in newCurrColumns at the index colIndex. This effectively simulates placing a piece in the specified column, reducing the number of available empty spaces in that column by 1.
    const newCurrColumns = [...currColumns];
    newCurrColumns[colIndex]--;
    // Update the current column state
    setCurrColumns(newCurrColumns);
    // Check for game winner, and if it exists, set it in the state
    const winner = checkWinner();
    if (Object.keys(winner).length > 0) {
      setGameWinner(winner.player);
      setGameWinningCells(winner.winningCells);
    }
    // Check for a tie game
    checkTie();
  };

  // Function to generate the game board
  const generateBoard = () => {
    const newBoard: JSX.Element[] = [];
    for (let i = 0; i < rows; i++) {
      const row: JSX.Element[] = [];
      for (let j = 0; j < columns; j++) {
        const isWinningCell =
          gameWinningCells?.some(
            ([rowIndex, colIndex]) => rowIndex === i && colIndex === j
          ) || false;
        row.push(
          <QonnectFourCell
            player={board[i][j]}
            isWinningCell={isWinningCell}
            onClick={() => setPieceFunc(i, j)}
            key={`${i}-${j}`}
          >
            {isWinningCell && (
              <StarSVG color="#fff" height={"34"} width={"36"} />
            )}
          </QonnectFourCell>
        );
      }
      newBoard.push(<QonnectFourRow key={i}>{row}</QonnectFourRow>);
    }
    return newBoard;
  };

  // Check Winner Function
  const checkWinner = (): WinningInfo => {
    let winningInfo: WinningInfo = {
      player: null,
      winningCells: null,
    };

    // Check horizontally
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col <= columns - 4; col++) {
        const player = board[row][col];
        if (
          player !== "" &&
          player === board[row][col + 1] &&
          player === board[row][col + 2] &&
          player === board[row][col + 3]
        ) {
          winningInfo = {
            player,
            winningCells: [
              [row, col],
              [row, col + 1],
              [row, col + 2],
              [row, col + 3],
            ],
          };
          return winningInfo;
        }
      }
    }

    // Check vertically
    for (let row = 0; row <= rows - 4; row++) {
      for (let col = 0; col < columns; col++) {
        const player = board[row][col];
        if (
          player !== "" &&
          player === board[row + 1][col] &&
          player === board[row + 2][col] &&
          player === board[row + 3][col]
        ) {
          winningInfo = {
            player,
            winningCells: [
              [row, col],
              [row + 1, col],
              [row + 2, col],
              [row + 3, col],
            ],
          };
          return winningInfo;
        }
      }
    }

    // Check diagonally (top-left to bottom-right)
    for (let row = 0; row <= rows - 4; row++) {
      for (let col = 0; col <= columns - 4; col++) {
        const player = board[row][col];
        if (
          player !== "" &&
          player === board[row + 1][col + 1] &&
          player === board[row + 2][col + 2] &&
          player === board[row + 3][col + 3]
        ) {
          winningInfo = {
            player,
            winningCells: [
              [row, col],
              [row + 1, col + 1],
              [row + 2, col + 2],
              [row + 3, col + 3],
            ],
          };
          return winningInfo;
        }
      }
    }

    // Check diagonally (top-right to bottom-left)
    for (let row = 0; row <= rows - 4; row++) {
      for (let col = 3; col < columns; col++) {
        const player = board[row][col];
        if (
          player !== "" &&
          player === board[row + 1][col - 1] &&
          player === board[row + 2][col - 2] &&
          player === board[row + 3][col - 3]
        ) {
          winningInfo = {
            player,
            winningCells: [
              [row, col],
              [row + 1, col - 1],
              [row + 2, col - 2],
              [row + 3, col - 3],
            ],
          };
          return winningInfo;
        }
      }
    }

    // No winner found
    return winningInfo;
  };

  const checkTie = (): boolean => {
    // Iterate over the entire board
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // If any cell is empty, the game is not a tie
        if (board[row][col] === "") {
          return false;
        }
      }
    }
    // If all cells are filled and no winner is found, the game is a tie
    setGameWinner("TIE");
    return true;
  };

  return (
    <QonnectFourContainer>
      <QonnectFourScoreboard>
        <QonnectFourPlayer>
          <QonnectFourPlayerCol>
            <QonnectFourPlayerText>Player 1</QonnectFourPlayerText>
            <QonnectFourPlayerTimer>2:00</QonnectFourPlayerTimer>
          </QonnectFourPlayerCol>
          <QonnectFourAvatar />
        </QonnectFourPlayer>
        <QonnectFourVSText>VS</QonnectFourVSText>
        <QonnectFourPlayer>
          <QonnectFourPlayerCol>
            <QonnectFourPlayerText>Player 2</QonnectFourPlayerText>
            <QonnectFourPlayerTimer>2:00</QonnectFourPlayerTimer>
          </QonnectFourPlayerCol>
          <QonnectFourAvatar />
        </QonnectFourPlayer>
      </QonnectFourScoreboard>
      <QonnectFourBoard>{generateBoard()}</QonnectFourBoard>
      <WinnnerRow>
        {gameWinner === playerRed && (
          <QonnectFourCell
            player={"R"}
            onClick={() => {
              return;
            }}
          />
        )}
        {gameWinner === playerBlue && (
          <QonnectFourCell
            player={"B"}
            onClick={() => {
              return;
            }}
          />
        )}
        {gameWinner === "TIE" && (
          <QonnectFourCell
            player={"TIE"}
            onClick={() => {
              return;
            }}
          />
        )}
        <WinnerText>
          {gameWinner === playerRed ? "Player 1 Wins!" : ""}
          {gameWinner === playerBlue ? "Player 2 Wins!" : ""}
          {gameWinner === "TIE" ? "It's a Tie!" : ""}
        </WinnerText>
      </WinnnerRow>
      {gameWinner && (
        <ResetButton
          onClick={() => {
            setBoard(() => {
              const initialBoard: Board = [];
              for (let i = 0; i < rows; i++) {
                initialBoard.push(Array(columns).fill(""));
              }
              return initialBoard;
            });
            setCurrColumns([5, 5, 5, 5, 5, 5, 5]);
            setCurrentPlayer(playerRed);
            setGameWinner(null);
            setGameWinningCells(null);
          }}
        >
          Restart
        </ResetButton>
      )}
    </QonnectFourContainer>
  );
};
