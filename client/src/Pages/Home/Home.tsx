import { useCallback, useContext, useEffect, useState } from "react";
import gameContext from "../../contexts/gameContext";
import { JoinRoom } from "../../components/JoinRoom";
import {
  AppContainer,
  BubbleBoard,
  BubbleCard,
  BubbleCardBlue,
  MainContainer,
  WelcomeText,
} from "../../App-styles";
import { sendRequestToExtension } from "../../App";

export const HomePage = () => {
  const { isInRoom } = useContext(gameContext);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<any>(null);

  const isExtensionInstalledFunc = useCallback(async () => {
    try {
      const response = await sendRequestToExtension(
        "REQUEST_IS_INSTALLED",
        {},
        750
      );
      return response;
    } catch (error) {
      console.log({ error });
    }
  }, []);

  async function requestConnection() {
    try {
      const response = await sendRequestToExtension("REQUEST_CONNECTION");
      console.log("User info response:", response);
      return response;
    } catch (error) {
      console.error("Error requesting user info:", error);
    }
  }

  async function requestAuthentication() {
    try {
      const response = await sendRequestToExtension(
        "REQUEST_AUTHENTICATION",
        {},
        30000
      );
      console.log("AUTH info response:", response);
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

  const isInstalledFunc = async () => {
    try {
      const res = await isExtensionInstalledFunc();
      setIsInstalled(!!res?.version);
      if (!res?.version) return;
      const res2 = await requestConnection();
      if (res2 === true) {
        const res3 = await requestAuthentication();
        if (res3 === true) {
          const res4 = await requestUserInfo();
          if (res4?.address) {
            setUserInfo(res4);
          }
        } else {
        }
      } else {
      }
      return;
    } catch (error) {}
  };

  useEffect(() => {
    isInstalledFunc();
  }, []);

  console.log({ userInfo });
  return (
    <AppContainer>
      <WelcomeText>Welcome to Tic-Tac-Toe</WelcomeText>
      <BubbleBoard>
        {/* Row 1 */}
        <BubbleCard />
        <BubbleCardBlue />
        <BubbleCard>F</BubbleCard>
        <BubbleCard />
        <BubbleCard />
        <BubbleCard />
        <BubbleCard />
        <BubbleCard />
        <BubbleCard />
        {/* Row 2 */}
        <BubbleCard />
        <BubbleCard>Q</BubbleCard>
        <BubbleCardBlue />
        <BubbleCard>O</BubbleCard>
        <BubbleCard>N</BubbleCard>
        <BubbleCard>N</BubbleCard>
        <BubbleCard>E</BubbleCard>
        <BubbleCard>C</BubbleCard>
        <BubbleCard>T</BubbleCard>
        {/* Row 3 */}
        <BubbleCard />
        <BubbleCard />
        <BubbleCard>U</BubbleCard>
        <BubbleCardBlue />
        <BubbleCard />
        <BubbleCard />
        <BubbleCard />
        <BubbleCard />
        <BubbleCard />
        {/* Row 4 */}
        <BubbleCard />
        <BubbleCard />
        <BubbleCard>R</BubbleCard>
        <BubbleCard />
        <BubbleCardBlue />
        <BubbleCard />
        <BubbleCard />
        <BubbleCard />
        <BubbleCard />
      </BubbleBoard>
      <MainContainer>
        {!isInRoom && <JoinRoom userAddress={userInfo?.address || ""} />}
      </MainContainer>
    </AppContainer>
  );
};
