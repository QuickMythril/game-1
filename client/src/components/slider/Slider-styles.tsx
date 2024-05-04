import { Box, Slider, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { DoubleCaretRightSVG } from "../icons/DoubleCaretRightSVG";

export const StyledSlider = styled(Slider)(({ theme }) => ({
  " & .MuiSlider-thumb": {
    width: "77px",
    height: "77px",
    zIndex: 2,
    background: theme.palette.primary.main,
  },
  "& .MuiSlider-rail": {
    width: "378px",
    height: "87px",
    background: "#2B2B2B",
    borderRadius: "50px",
  },
  "& .MuiSlider-track": {
    display: "none",
  },
}));

export const SliderContainer = styled(Box)({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "35px",
  width: "100%",
});

export const SliderDiv = styled(Box)({
  position: "relative",
  display: "flex",
  alignSelf: "flex-start",
});

export const SliderText = styled(Typography)(({ theme }) => ({
  fontFamily: "Fredoka One",
  fontSize: "16px",
  fontWeight: "400",
  lineHeight: "19.36px",
  textAlign: "left",
  color: theme.palette.text.primary,
}));

export const SliderTextSuccess = styled(Typography)({
  fontFamily: "Fredoka One",
  fontSize: "18px",
  fontWeight: "500",
  lineHeight: "19.36px",
  textAlign: "left",
  color: "#02b802",
  textTransform: "uppercase",
});

export const DoubleCaretRightIcon = styled(DoubleCaretRightSVG)({
  position: "absolute",
  top: "55px",
  left: "60px",
  userSelect: "none",
});

export const DoubleCaretRightIcon2 = styled(DoubleCaretRightSVG)({
  position: "absolute",
  top: "55px",
  left: "165px",
  userSelect: "none",
});

export const DoubleCaretRightIcon3 = styled(DoubleCaretRightSVG)({
  position: "absolute",
  top: "55px",
  left: "270px",
  userSelect: "none",
});
