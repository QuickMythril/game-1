import { useParams } from "react-router-dom";
import { AppContainer, MainContainer } from "../../App-styles";
import { Game } from "../../components/game";
import { useContext, useEffect, useMemo } from "react";
import gameContext from "../../contexts/gameContext";
import socketService from "../../services/socketService";
import gameService from "../../services/gameService";

export const GamePage = () => {
  const { userInfo , setInRoom, setGame} = useContext(gameContext);

  const { id } = useParams();

  const userAddress = useMemo(()=> {
    return userInfo?.address
  }, [userInfo])

  const joinRoom = async (roomId: string, userAddress: string) => {
    console.log('hello')
    if(!userAddress) return
    const socket = socketService.socket;
    if (!roomId || roomId.trim() === "" || !socket) return;
    console.log("going trough");

    const joined = await gameService
      .joinGameRoom(socket, roomId, userAddress)
      .catch((err) => {
        alert(err);
      });
    console.log(joined);
    if (joined) {
      setInRoom(true);
      if(joined?.game){
        setGame(joined.game)
    }

    }
  };
  useEffect(() => {
    if (id && userAddress) {
      joinRoom(id, userAddress);
    }
  }, [id]);


  return (
    <AppContainer>
      <MainContainer>
        <Game />
      </MainContainer>
    </AppContainer>
  );
};