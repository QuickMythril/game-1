// Qonnect Four Styles
import { Box, Button, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { PieceColors } from "./QonnectFour";

export const QonnectFourContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "50px",
});

export const QonnectFourBoard = styled(Box)({
  width: "669px",
  height: "auto",
  padding: "20px",
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  marginBottom: "50px",
  gap: "0px",
  borderRadius: "20px",
  backgroundColor: "#3F3F3F",
  border: "3px solid #272626",
});

export const QonnectFourScoreboard = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: "26px",
  width: "1078px",
  height: "77px",
  marginBottom: "161px",
});

export const QonnectFourPlayer = styled(Box)({
  display: "flex",
  alignItems: "center",
  flexDirection: "row",
  gap: "37px",
});

export const QonnectFourAvatar = styled(Box)({
  width: "77px",
  height: "77px",
  backgroundColor: "#3F3F3F",
  borderRadius: "50%",
});

export const QonnectFourPlayerCol = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "3px",
});

export const QonnectFourPlayerText = styled(Typography)(({ theme }) => ({
  fontFamily: "Inter",
  fontSize: "20px",
  fontWeight: "700",
  lineHeight: "24.2px",
  textAlign: "right",
  color: theme.palette.text.primary,
}));

export const QonnectFourVSText = styled(Typography)(({ theme }) => ({
  fontFamily: "Fredoka One",
  fontSize: "40px",
  fontWeight: "600",
  lineHeight: "48.4px",
  textAlign: "left",
  color: theme.palette.text.primary,
}));

export const QonnectFourPlayerTimer = styled(Typography)(({ theme }) => ({
  fontFamily: "Inter",
  fontSize: "20px",
  fontWeight: "700",
  lineHeight: "24.2px",
  textAlign: "right",
  color: theme.palette.text.primary,
  padding: "6px 18px 5px 22px",
  borderRadius: "10px",
  backgroundColor: "#3F3F3F",
}));

export const QonnectFourRow = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "15px",
  "&:not(:last-child)": {
    marginBottom: "15px",
  },
});

export const QonnectFourCell = styled(Box)<PieceColors>(
  ({ player, isWinningCell }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "77px",
    height: "77px",
    background:
      player === "R"
        ? "#F29999"
        : player === "B"
        ? "#70BAFF"
        : player === "TIE"
        ? "linear-gradient(to right, #F29999 0%, #F29999 50%, #70BAFF 50%, #70BAFF 100%)"
        : "#27282C",
    borderRadius: "50%",
    border:
      player === "R"
        ? "3px solid #F29999"
        : player === "B"
        ? "3px solid#70BAFF"
        : player === "TIE"
        ? "none"
        : "3px solid #272626",
    boxShadow:
      isWinningCell && player === "R"
        ? "0px 0px 23.1px 6px #9C4646"
        : isWinningCell && player === "B"
        ? "0px 0px 23.1px 6px #46739C"
        : "none",
    "&:hover": {
      cursor: "pointer",
    },
  })
);

export const WinnnerRow = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: "15px",
  width: "100%",
  height: "77px",
});

export const WinnerText = styled(Typography)(({ theme }) => ({
  fontFamily: "Fredoka One",
  fontSize: "22px",
  fontWeight: "400",
  lineHeight: "19.36px",
  textAlign: "left",
  color: theme.palette.text.primary,
  userSelect: "none",
}));

export const ResetButton = styled(Button)(({ theme }) => ({
  marginTop: "50px",
  width: "150px",
  height: "40px",
  borderRadius: "10px",
  backgroundColor: "#0140b4",
  color: theme.palette.text.primary,
  fontSize: "20px",
  fontWeight: "700",
  "&:hover": {
    backgroundColor: "#023592",
  },
}));
