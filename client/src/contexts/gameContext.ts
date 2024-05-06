import React from "react";


export interface Player {
  isConnected: boolean;
  symbol: 'x' | 'o';
  hasWon?: boolean;
}
export interface Game {
  status: 'waiting' | 'active' | 'finished';
  players: Record<string, Player>;
  winner: {
    qortAddress: string;
      _id: string;
  }
  series: {
    totalGames: number; // Default to a best-of-3 series
    scores: { player: {
      qortAddress: string;
      _id: string;
    }; score: number }[], // Track scores per player
  };
  roomId: string;
  history: {
    state: [[string]],  // 2D array representing the game's final state
    winner: {
      qortAddress: string;
      _id: string;
    },  // Game winner
    startedAt: Date,
    tie: boolean,  // Indicates if the game ended in a tie
  }[];
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
  game: Game | null;
  setGame: (val: Game) => void;
  userInfo: any;
  setUserInfo: (val: any)=> void;

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
  game: null,
  setGame: () => {},
  userInfo: null,
  setUserInfo: ()=> {}
};

export default React.createContext(defaultState);