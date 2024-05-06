import { useContext, useState } from "react";
import {
  DoubleCaretRightIcon,
  DoubleCaretRightIcon2,
  DoubleCaretRightIcon3,
  SliderContainer,
  SliderDiv,
  SliderText,
  SliderTextSuccess,
  StyledSlider,
} from "./Slider-styles";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import gameContext from "../../contexts/gameContext";
import { useNavigate } from "react-router-dom";

export const CustomSlider = () => {
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const { userInfo } = useContext(gameContext);
  const navigate = useNavigate();
  const handleSlideChange = async (event: any, value: number | number[]) => {
    const newValue = typeof value === "number" ? value : value[0]; // Handle both single and range sliders
    setSliderValue(newValue as number);
    if (newValue >= 100) {
      setIsUnlocked(true);
      // CHANGE THIS TO THE GAME PAGE
      navigate("qonnect-four");
      return;
      const userAddress = userInfo.address;
      console.log({ userAddress });
      if (!userAddress) return;
      const socket = socketService.socket;
      console.log({ socket });
      if (!socket) return;
      const game = await gameService
        .generateGame(socket, userAddress)
        .catch((err) => {
          alert(err);
        });
      console.log({ game });
      const roomId = game.roomId;
      console.log({ roomId });
      navigate(`/game/${roomId}`);
      // start game function goes here
    }
  };

  const handleRelease = () => {
    if (sliderValue < 100) {
      setSliderValue(0); // Reset slider value to 0
    }
  };

  console.log(sliderValue);

  return (
    <SliderContainer>
      <SliderText>SWIPE TO PLAY</SliderText>
      {/* <SliderDiv> */}
      <StyledSlider
        value={sliderValue}
        onChange={handleSlideChange}
        onChangeCommitted={handleRelease}
        aria-labelledby="continuous-slider"
      />
      <DoubleCaretRightIcon height="29px" width="38px" color="none" />
      <DoubleCaretRightIcon2 height="29px" width="38px" color="none" />
      <DoubleCaretRightIcon3 height="29px" width="38px" color="none" />
      {/* </SliderDiv>  */}
      {isUnlocked && <SliderTextSuccess>Joining Game...</SliderTextSuccess>}
    </SliderContainer>
  );
};
