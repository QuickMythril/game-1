import { styled } from "@mui/system";
import { Box } from "@mui/material";
import { HomeSVG } from "../icons/HomeSVG";
import { QortalLogoSVG } from "../icons/QortalLogoSVG";
import { CaretDownSVG } from "../icons/CaretDownSVG";

export const HeaderNav = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  padding: "0 30px",
  [theme.breakpoints.only("xs")]: {
    padding: "0",
  },
}));

export const HomeIcon = styled(HomeSVG)({
  cursor: "pointer",
});

export const QortalLogoIcon = styled(QortalLogoSVG)({
  cursor: "pointer",
});

export const CaretDownIcon = styled(CaretDownSVG)({
  color: "none",
});

export const DropdownContainer = styled(Box)({
  position: "relative",
  display: "flex",
  flexDirection: "row",
  gap: "18px",
  alignItems: "center",
  justifyContent: "center",
});

export const GameSelectDropdown = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px",
  width: "fit-content",
  height: "35px",
  top: "38px",
  left: "38px",
  opacity: "0px",
  fontFamily: "Fira Sans, sans-serif",
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "19.2px",
  border: `1px solid ${theme.palette.text.secondary}`,
  color: theme.palette.text.secondary,
  borderRadius: "30px",
  gap: "11px",
  userSelect: "none",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    border: `1px solid #5f5e5e`,
    color: "#5f5e5e",
    "& ${CaretDownIcon}": {
      "& path": {
        transition: "all 0.3s ease-in-out",
        stroke: "#5f5e5e",
      },
    },
  },
}));

export const GameSelectDropdownMenu = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: "-210px",
  left: 0,
  backgroundColor: "#222222",
  border: "1.07px solid #0000001A",
  borderRadius: "5px",
  width: "425px",
  height: "200px",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0px 4.27px 14.93px 0px #00000026",
  "& :first-child": {
    borderTopLeftRadius: "5px",
    borderTopRightRadius: "5px",
  },
  "& :last-child": {
    borderBottomLeftRadius: "5px",
    borderBottomRightRadius: "5px",
  },
}));

export const GameSelectDropdownMenuItem = styled(Box)(({ theme }) => ({
  fontFamily: "Inter, sans-serif",
  color: theme.palette.text.primary,
  fontSize: "18px",
  lineHeight: "19.36px",
  fontWeight: 400,
  height: "50px",
  width: "100%",
  padding: "15px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    backgroundColor: theme.palette.primary.main,
    cursor: "pointer",
  },
}));
