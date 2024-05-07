import { createRef, useEffect, useRef, useState } from "react";
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
  WinnerRow as TurnRow,
  WinnerText as TurnText,
  WinnerText,
  WinnerRow,
  AnimatedPiece,
} from "./QonnectFour-Styles";
import { StarSVG } from "../common/icons/StarSVG";
import { formatTime } from "../../utils/formatTime";

// Define the Piece Colors interface for the QonnectFourCell component props
export interface PieceColors {
  player: string;
  isWinningCell?: boolean;
  winner?: string | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}
// Winning Info Interface
interface WinningInfo {
  player: Player | null;
  winningCells: number[][] | null;
}
export interface AnimationInfo {
  top?: number;
  left?: number;
  dropHeight: number;
  player: Player;
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

  const hoverCellRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  const boardContainerRef = useRef<HTMLDivElement>(null);

  // Initialize the board as a 2D array of Player types
  const [board, setBoard] = useState<Board>(() => {
    const initialBoard: Board = [];
    for (let i = 0; i < rows; i++) {
      initialBoard.push(Array(columns).fill(""));
    }
    return initialBoard;
  });
  const [hoverColumn, setHoverColumn] = useState<number>(-1);
  const [currColumns, setCurrColumns] = useState<number[]>([
    5, 5, 5, 5, 5, 5, 5,
  ]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(playerRed);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [gameWinningCells, setGameWinningCells] = useState<number[][] | null>(
    null
  );
  const [animationInfo, setAnimationInfo] = useState<AnimationInfo | null>(
    null
  );
  // Timer State
  const [timeRed, setTimeRed] = useState<number>(120);
  const [timeBlue, setTimeBlue] = useState<number>(120);

  // Randomize the starting player
  const startingPlayer = Math.random() < 0.5 ? playerRed : playerBlue;
  useEffect(() => {
    setCurrentPlayer(startingPlayer);
  }, []);

  // useEffect to reduce the timer of each player when it's their turn
  useEffect(() => {
    // Check if the game has started or if there is a winner, if so, stop the timer
    if (!gameStarted || gameWinner) return;
    const timer = setInterval(() => {
      if (currentPlayer === playerRed) {
        setTimeRed((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      } else {
        setTimeBlue((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPlayer]);

  // Handle timer hitting 0
  useEffect(() => {
    if (timeRed === 0) {
      setGameWinner(playerBlue);
    } else if (timeBlue === 0) {
      setGameWinner(playerRed);
    }
  }, [timeRed, timeBlue]);

  // Initialize each ref in the array to a new ref object
  useEffect(() => {
    hoverCellRefs.current = Array(columns)
      .fill(null)
      .map((_, i) => hoverCellRefs.current[i] || createRef<HTMLDivElement>());
  }, [columns]);
  console.log({ hoverCellRefs });

  // Function to generate the hover row for the piece drop animation
  const generateHoverRow = () => {
    const hoverRow: JSX.Element[] = [];
    for (let j = 0; j < columns; j++) {
      hoverRow.push(
        <QonnectFourCell
          ref={hoverCellRefs.current[j]}
          key={`hover-${j}`}
          onClick={() => setPieceFunc(currColumns[j], j)}
          onMouseEnter={() => setHoverColumn(j)}
          onMouseLeave={() => setHoverColumn(-1)}
          player={
            hoverColumn === j ? (currentPlayer === playerRed ? "R" : "B") : ""
          }
          className={hoverColumn === j ? "floatingPiece" : ""}
          style={{ opacity: hoverColumn === j ? 1 : 0 }}
        />
      );
    }
    if (gameWinner) return null;
    return (
      <QonnectFourRow style={{ position: "absolute", top: "-90px", zIndex: 1 }}>
        {hoverRow}
      </QonnectFourRow>
    );
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
            onMouseEnter={() => setHoverColumn(j)}
            onMouseLeave={() => setHoverColumn(-1)}
            player={board[i][j]}
            isWinningCell={isWinningCell}
            winner={gameWinner}
            onClick={() => setPieceFunc(i, j)}
            key={`${i}-${j}`}
          >
            {isWinningCell && (
              <StarSVG color="#fff" height={"34"} width={"36"} />
            )}
          </QonnectFourCell>
        );
      }
      newBoard.push(
        <QonnectFourRow className={"hover-row"} key={i}>
          {row}
        </QonnectFourRow>
      );
    }
    return newBoard;
  };

  const generateAnimatedLayer = () => {
    if (!animationInfo) return null;
    return (
      <AnimatedPiece
        style={{
          top: `${animationInfo.top}px`,
          left: `${animationInfo.left}px`,
        }}
        dropHeight={animationInfo.dropHeight}
        player={animationInfo.player}
        onAnimationEnd={() => setAnimationInfo(null)}
      />
    );
  };

  // Function to handle piece drop animation
  const animatePieceDrop = (rowIndex: number, colIndex: number) => {
    const baseHeight = 100;  // base height for scaling duration
    const baseDuration = 0.11;  // base duration for the base height
    const hoverCell = hoverCellRefs.current[colIndex].current;
    const boardContainer = boardContainerRef.current;
    // Destination row top calculation (simple approach)
    const rowHeight = 77 + 15; // cell height + gap
    // Calculate the drop height based on the rowIndex
    const destinationTopRelativeToBoard = rowIndex * rowHeight;

    if (hoverCell && boardContainer) {
      const hoverRect = hoverCell.getBoundingClientRect();
      const boardRect = boardContainer?.getBoundingClientRect();
      // Calculate the top of the hover cell relative to the board
      const hoverCellTopRelativeToBoard = hoverRect.top - boardRect.top;
      // Drop height is the difference between the hover cell's bottom and the destination row's top
      const dropHeight =
        destinationTopRelativeToBoard - hoverCellTopRelativeToBoard;
      // Calculate the duration of the animation based on the drop height
      const duration = (dropHeight / baseHeight) * baseDuration * 1000;  
      setAnimationInfo({
        top: hoverRect.top - boardRect.top, // Adjust for relative positioning
        left: hoverRect.left - boardRect.left,
        dropHeight: dropHeight,
        player: currentPlayer,
      });
      return duration
    }
  };

  // Function to handle placing a piece on the board
  const setPieceFunc = (rowIndex: number, colIndex: number) => {
    // Start the game if it hasn't started
    if (!gameStarted) {
      setGameStarted(true);
    }
    // Check if the game is over
    if (gameWinner) return;
    // Check if an animation is already in progress
    if (animationInfo) return;
    // Check if the column is full
    rowIndex = currColumns[colIndex];
    if (rowIndex < 0) return;

    // Start the drop animation
   const animationDuration = animatePieceDrop(rowIndex, colIndex);
    console.log(animationDuration);
    // Delay state updates until after the animation completes
    setTimeout(() => {
      // Update the board with the current player's piece
      const newBoard: Board = [...board];
      newBoard[rowIndex][colIndex] = currentPlayer;
      setBoard(newBoard);
      const newCurrentPlayer: Player =
        currentPlayer === playerRed ? playerBlue : playerRed;
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
    }, animationDuration);
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
            <QonnectFourPlayerTimer>
              {formatTime(timeRed)}
            </QonnectFourPlayerTimer>
          </QonnectFourPlayerCol>
          <QonnectFourAvatar />
        </QonnectFourPlayer>
        <QonnectFourVSText>VS</QonnectFourVSText>
        <QonnectFourPlayer>
          <QonnectFourPlayerCol>
            <QonnectFourPlayerText>Player 2</QonnectFourPlayerText>
            <QonnectFourPlayerTimer>
              {formatTime(timeBlue)}
            </QonnectFourPlayerTimer>
          </QonnectFourPlayerCol>
          <QonnectFourAvatar />
        </QonnectFourPlayer>
      </QonnectFourScoreboard>
      <QonnectFourBoard ref={boardContainerRef}>
        {generateAnimatedLayer()}
        {generateHoverRow()}
        {generateBoard()}
      </QonnectFourBoard>
      {/* Turn Logic */}
      {gameWinner === null && (
        <TurnRow>
          <QonnectFourCell
            player={currentPlayer === playerRed ? "R" : "B"}
            // Always auto cursor for the current player's piece
            winner={"true"}
            onClick={() => {
              return;
            }}
          />
          <TurnText>
            {currentPlayer === playerRed
              ? "Player 1's Turn"
              : "Player 2's Turn"}
          </TurnText>
        </TurnRow>
      )}
      {gameWinner && (
        <>
          {/* Winner Logic */}
          <WinnerRow>
            {gameWinner === playerRed && (
              <QonnectFourCell
                player={"R"}
                winner={gameWinner}
                onClick={() => {
                  return;
                }}
              />
            )}
            {gameWinner === playerBlue && (
              <QonnectFourCell
                player={"B"}
                winner={gameWinner}
                onClick={() => {
                  return;
                }}
              />
            )}
            {gameWinner === "TIE" && (
              <QonnectFourCell
                player={"TIE"}
                winner={gameWinner}
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
          </WinnerRow>
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
              setTimeRed(120);
              setTimeBlue(120);
              setGameStarted(false);
            }}
          >
            Restart
          </ResetButton>
        </>
      )}
    </QonnectFourContainer>
  );
};
