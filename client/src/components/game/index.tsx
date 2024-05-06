import { useContext, useEffect, useState } from "react";
import gameContext from "../../contexts/gameContext";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import {
  Cell,
  GameContainer,
  O,
  PlayStopper,
  RowContainer,
  X,
} from "./Game-styles";

export type IPlayMatrix = Array<Array<string | null>>;
export interface IStartGame {
  start: boolean;
  symbol: "x" | "o";
}

export function Game() {
  const [matrix, setMatrix] = useState<IPlayMatrix>([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);

  const {
    playerSymbol,
    setPlayerSymbol,
    setPlayerTurn,
    isPlayerTurn,
    setGameStarted,
    isGameStarted,
    players,
    setPlayers,
    setGame,
    game,
  } = useContext(gameContext);

  console.log({ players });

  // const checkGameState = (matrix: IPlayMatrix) => {
  //   for (let i = 0; i < matrix.length; i++) {
  //     let row = [];
  //     for (let j = 0; j < matrix[i].length; j++) {
  //       row.push(matrix[i][j]);
  //     }

  //     if (row.every((value) => value && value === playerSymbol)) {
  //       return [true, false];
  //     } else if (row.every((value) => value && value !== playerSymbol)) {
  //       return [false, true];
  //     }
  //   }

  //   for (let i = 0; i < matrix.length; i++) {
  //     let column = [];
  //     for (let j = 0; j < matrix[i].length; j++) {
  //       column.push(matrix[j][i]);
  //     }

  //     if (column.every((value) => value && value === playerSymbol)) {
  //       return [true, false];
  //     } else if (column.every((value) => value && value !== playerSymbol)) {
  //       return [false, true];
  //     }
  //   }

  //   if (matrix[1][1]) {
  //     if (matrix[0][0] === matrix[1][1] && matrix[2][2] === matrix[1][1]) {
  //       if (matrix[1][1] === playerSymbol) return [true, false];
  //       else return [false, true];
  //     }

  //     if (matrix[2][0] === matrix[1][1] && matrix[0][2] === matrix[1][1]) {
  //       if (matrix[1][1] === playerSymbol) return [true, false];
  //       else return [false, true];
  //     }
  //   }

  //   //Check for a tie
  //   if (matrix.every((m) => m.every((v) => v !== null))) {
  //     return [true, true];
  //   }

  //   return [false, false];
  // };

  const updateGameMatrix = (column: number, row: number, symbol: "x" | "o") => {
    const newMatrix = [...matrix];

    if (newMatrix[row][column] === null || newMatrix[row][column] === "null") {
      newMatrix[row][column] = symbol;
      setMatrix(newMatrix);
    }

    if (socketService.socket) {
      gameService.updateGame(socketService.socket, { column, row, symbol });
      // const [currentPlayerWon, otherPlayerWon] = checkGameState(newMatrix);
      // if (currentPlayerWon && otherPlayerWon) {
      //   gameService.gameWin(socketService.socket, "The Game is a TIE!");
      //   alert("The Game is a TIE!");
      // } else if (currentPlayerWon && !otherPlayerWon) {
      //   gameService.gameWin(socketService.socket, "You Lost!");
      //   alert("You Won!");
      // }

      // setPlayerTurn(false);
    }
  };

  const handleGameUpdate = () => {
    if (socketService.socket)
      gameService.onGameUpdate(socketService.socket, (newMatrix) => {
        console.log({ newMatrix });
        console.log("handleGameUpdate");
        setMatrix(newMatrix);
        // checkGameState(newMatrix);
        // setPlayerTurn(true);
      });
  };

  const handleTurnUpdate = () => {
    if (socketService.socket)
      gameService.onTurnUpdate(socketService.socket, (isTurn) => {
        // checkGameState(newMatrix);
        setPlayerTurn(isTurn);
      });
  };

  const handleGameStart = () => {
    console.log("socketService.socket", socketService.socket);
    if (socketService.socket)
      gameService.onStartGame(socketService.socket, (options) => {
        console.log({ options });
        setGameStarted(true);
        setPlayerSymbol(options.symbol);
        if (options.start) setPlayerTurn(true);
        else setPlayerTurn(false);
      });
  };

  const handleGameResume = () => {
    console.log("socketService.socket", socketService.socket);
    if (socketService.socket)
      gameService.onResumeGame(socketService.socket, (options) => {
        console.log({ options });
        setMatrix(options.matrix);
        setPlayerSymbol(options.symbol);
        setGameStarted(true);
      });
  };

  const handleGameWin = () => {
    if (socketService.socket)
      try {
        console.log("after");
        gameService.onGameWin(
          socketService.socket,
          ({ matrix, players, game: gameFromBack }: any) => {
            console.log("handleGameWin");
            console.log({ game });
            if (matrix) {
              setMatrix(matrix);
            }

            console.log("Here");
            setPlayerTurn(false);
            if (players) {
              setPlayers(players);
            }

            setGame(gameFromBack);
          }
        );
      } catch (error) {
        console.log({ error });
      }
  };

  const handleGameTie = () => {
    if (socketService.socket)
      gameService.onGameTie(
        socketService.socket,
        ({ matrix, players, game: gameFromBack }: any) => {
          setMatrix(matrix);
          setPlayerTurn(false);
          setPlayers(players);
          setGame(gameFromBack);
        }
      );
  };

  const handlePlayersInfo = () => {
    if (socketService.socket)
      gameService.onPlayersInfo(socketService.socket, (message) => {
        console.log({ message });
        setPlayers(message);
      });
  };

  useEffect(() => {
    handleGameUpdate();
    handleTurnUpdate();
    handleGameStart();
    handleGameWin();
    handleGameResume();
    handlePlayersInfo();
    handleGameTie();
  }, []);

  console.log({ isGameStarted, isPlayerTurn, game });

  const GameDetails = (
    <div>
      {game?.series?.scores?.map((score) => {
        return (
          <p>
            {score?.player}: {score?.score}
          </p>
        );
      })}
    </div>
  );

  if (game?.status === "finished")
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {GameDetails}
        {game?.status === "finished" && <p>The winner is ${game.winner}</p>}
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {Object.keys(players)?.map((player) => {
        const val = players[player];
        return (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <p>{player}: </p>
            <p>{val?.isConnected ? "connected" : "disconnected"}</p>
          </div>
        );
      })}
      {GameDetails}
      <GameContainer>
        {!isGameStarted && (
          <h2>Waiting for Other Player to Join to Start the Game!</h2>
        )}

        {(!isGameStarted || !isPlayerTurn) && <PlayStopper />}
        {matrix.map((row, rowIdx) => {
          return (
            <RowContainer>
              {row.map((column, columnIdx) => (
                <Cell
                  borderRightStyle={columnIdx < 2 ? true : false}
                  borderLeftStyle={columnIdx > 0 ? true : false}
                  borderBottomStyle={rowIdx < 2 ? true : false}
                  borderTopStyle={rowIdx > 0 ? true : false}
                  onClick={() =>
                    updateGameMatrix(columnIdx, rowIdx, playerSymbol)
                  }
                >
                  {column && column !== "null" ? (
                    column === "x" ? (
                      <X />
                    ) : (
                      <O />
                    )
                  ) : null}
                </Cell>
              ))}
            </RowContainer>
          );
        })}
      </GameContainer>
    </div>
  );
}
