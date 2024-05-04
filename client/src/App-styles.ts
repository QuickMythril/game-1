import { Box } from "@mui/material";
import { styled } from "@mui/system";

export const AppContainer = styled(Box)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1em;
  background-color: #27282c;
`;

export const WelcomeText = styled("h1")`
  margin: 0;
  color: #8e44ad;
`;

export const MainContainer = styled(Box)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const BubbleBoard = styled(Box)`
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 15px;
  width: 815px;
  height: 353px;
`;

export const BubbleCard = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 77px;
  width: 77px;
  background: #ffffff05;
  border-radius: 50%;
  font-family: Fredoka One, sans-serif;
  font-weight: 500;
  font-size: 40px;
  line-height: 48.4px;
  text-align: center;
  color: white;
`;

export const BubbleCardBlue = styled(Box)`
  height: 77px;
  width: 77px;
  background: #0085ff;
  border-radius: 50%;
`;
