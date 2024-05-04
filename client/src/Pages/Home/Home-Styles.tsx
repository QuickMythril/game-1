import { Box } from "@mui/material";
import { styled } from "@mui/system";

export const BubbleBoard = styled(Box)({
  display: "grid",
  gridTemplateColumns: "repeat(9, 1fr)",
  gridTemplateRows: "repeat(4, 1fr)",
  gap: "15px",
  width: "815px",
  height: "353px",
  marginTop: "185px",
});

export const BubbleCard = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "77px",
  width: "77px",
  background: "#ffffff05",
  borderRadius: "50%",
  fontFamily: "Fredoka One, sans-serif",
  fontWeight: 500,
  fontSize: "40px",
  lineHeight: "48.4px",
  textAlign: "center",
  color: theme.palette.text.primary,
}));

export const BubbleCardBlue = styled(Box)(({ theme }) => ({
  height: "77px",
  width: "77px",
  background: theme.palette.primary.main,
  boxShadow: "0px 0px 25.8px -1px #1C5A93",
  borderRadius: "50%",
}));

export const MainCol = styled(Box)({
  marginTop: "100px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
});
