import React from "react";


export interface Player {
  isConnected: boolean;
  symbol: 'x' | 'o';
  hasWon?: boolean;
}
export interface GameFinished {
  status: 'win' | 'tie';
  players: Record<string, Player>;
}
export interface IGameContextProps {
  isInRoom: boolean;
  setInRoom: (inRoom: boolean) => void;
  playerSymbol: "x" | "o";
  setPlayerSymbol: (symbol: "x" | "o") => void;
  isPlayerTurn: boolean;
  setPlayerTurn: (turn: boolean) => void;
  isGameStarted: boolean;
  setGameStarted: (started: boolean) => void;
  setPlayers: (players: Record<string, Player>) => void;
  players: Record<string, Player>;
  gameFinished: GameFinished | null;
  setGameFinished: (val: GameFinished) => void;
}

const defaultState: IGameContextProps = {
  isInRoom: false,
  setInRoom: () => {},
  playerSymbol: "x",
  setPlayerSymbol: () => {},
  isPlayerTurn: false,
  setPlayerTurn: () => {},
  isGameStarted: false,
  setGameStarted: () => {},
  players: {},
  setPlayers: ()=> {},
  gameFinished: null,
  setGameFinished: () => {}
};

export default React.createContext(defaultState);