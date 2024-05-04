import { useEffect, useState } from "react";
import "./App.css";
import socketService from "./services/socketService";
import GameContext, { IGameContextProps, Player } from "./contexts/gameContext";
import { Route, Routes } from "react-router-dom";
import { HomePage } from "./Pages/Home/Home";
import { GamePage } from "./Pages/Game/Game";

export function sendRequestToExtension(
  requestType: string,
  payload?: any,
  timeout: number = 20000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestId = Math.random().toString(36).substring(2, 15); // Generate a unique ID for the request
    const detail = {
      type: requestType,
      payload,
      requestId,
      timeout: timeout / 1000,
    };

    // Store the timeout ID so it can be cleared later
    const timeoutId = setTimeout(() => {
      document.removeEventListener("qortalExtensionResponses", handleResponse);
      reject(new Error("Request timed out"));
    }, timeout); // Adjust timeout as necessary

    function handleResponse(event: any) {
      const { requestId: responseId, data } = event.detail;
      if (requestId === responseId) {
        // Match the response with the request
        document.removeEventListener(
          "qortalExtensionResponses",
          handleResponse
        );
        clearTimeout(timeoutId); // Clear the timeout upon successful response
        resolve(data);
      }
    }

    document.addEventListener("qortalExtensionResponses", handleResponse);
    document.dispatchEvent(
      new CustomEvent("qortalExtensionRequests", { detail })
    );
  });
}

let serverUrl: string;
if (import.meta.env.MODE === "production") {
  serverUrl = "https://game-1-production.up.railway.app";
} else {
  serverUrl = "http://localhost:3001";
}

function App() {
  const [isInRoom, setInRoom] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<"x" | "o">("x");
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Record<string, Player>>({})
  const [game, setGame] = useState<any>(null)
  const connectSocket = async () => {
    const socket = await socketService.connect(serverUrl).catch((err) => {
      console.log("Error: ", err);
    });
  };

  useEffect(() => {
    console.log("initial");
    connectSocket();

    return () => {
      socketService.disconnect(); // You would need to implement this method
    };
  }, []);

  const gameContextValue: IGameContextProps = {
    isInRoom,
    setInRoom,
    playerSymbol,
    setPlayerSymbol,
    isPlayerTurn,
    setPlayerTurn,
    isGameStarted,
    setGameStarted,
    setPlayers,
    players,
    game, 
    setGame
  };

  return (
    <GameContext.Provider value={gameContextValue}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </GameContext.Provider>
  );
}

export default App;
