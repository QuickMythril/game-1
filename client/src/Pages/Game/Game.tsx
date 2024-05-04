import { AppContainer, MainContainer } from "../../App-styles";
import { Game } from "../../components/game";

export const GamePage = () => {
  return (
    <AppContainer>
      <MainContainer>
        <Game />
      </MainContainer>
    </AppContainer>
  );
};