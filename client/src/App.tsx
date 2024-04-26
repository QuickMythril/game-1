import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { AppContainer, MainContainer, WelcomeText } from './App-styles';
import socketService from './services/socketService';
import GameContext, { IGameContextProps, Player } from './contexts/gameContext';
import { JoinRoom } from './components/JoinRoom';
import { Game } from './components/game';

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

async function requestAuthentication() {
  try {
    const response = await sendRequestToExtension("REQUEST_AUTHENTICATION", {}, 30000);
    console.log("AUTH info response:", response);
    return response;
  } catch (error) {
    console.error("Error requesting user info:", error);
  }
}


async function requestConnection() {
  try {
    const response = await sendRequestToExtension("REQUEST_CONNECTION");
    console.log("User info response:", response);
    return response;
  } catch (error) {
    console.error("Error requesting user info:", error);
  }
}

async function requestUserInfo() {
  try {
    const response = await sendRequestToExtension("REQUEST_USER_INFO");
    console.log("User info response:", response);
    return response;
  } catch (error) {
    console.error("Error requesting user info:", error);
  }
}


function App() {
  const [isInRoom, setInRoom] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<"x" | "o">("x");
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [isInstalled, setIsInstalled] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [players, setPlayers] = useState<Record<string, Player>>({})
  const [gameFinished, setGameFinished] = useState<any>(null)
  const connectSocket = async () => {
    const socket = await socketService
      .connect("http://localhost:3001")
      .catch((err) => {
        console.log("Error: ", err);
      });
  };

  useEffect(() => {
    console.log('initial')
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
    gameFinished, 
    setGameFinished
  };


  const isExtensionInstalledFunc = useCallback(async () => {
    try {
      const response = await sendRequestToExtension("REQUEST_IS_INSTALLED", {}, 750);
      return response
    } catch (error) {

      console.log({ error });
    }
  }, []);

  const isInstalledFunc = async ()=> {
    try {

        const res = await isExtensionInstalledFunc();
        setIsInstalled(!!res?.version)
        if(!res?.version) return;
        const res2 = await requestConnection();
        if(res2 === true){
            const res3 = await requestAuthentication();
                if(res3 === true){
                   const res4 = await requestUserInfo()
                   if(res4?.address){
                    setUserInfo(res4)
                   }
                } else {

                }
        } else {
        }
      return;
    
    } catch (error) {
      
    }
  }

  useEffect(()=> {
    isInstalledFunc()
  }, [])

  console.log({userInfo})
  return (
    <GameContext.Provider value={gameContextValue}>

    <AppContainer>
      <WelcomeText>Welcome to Tic-Tac-Toe</WelcomeText>
      <MainContainer>
        {
        !isInRoom && <JoinRoom userAddress={userInfo?.address || ""} />
        }
        {isInRoom && <Game />}
        </MainContainer>
    </AppContainer>
    </GameContext.Provider>
  )
}

export default App
