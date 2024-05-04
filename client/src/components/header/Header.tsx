import { useState } from "react";
import {
  CaretDownIcon,
  DropdownContainer,
  GameSelectDropdown,
  GameSelectDropdownMenu,
  GameSelectDropdownMenuItem,
  HeaderNav,
  HomeIcon,
  QortalLogoIcon,
} from "./Header-styles";
import { Game } from "../game";

export const Header = () => {
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);

  return (
    <HeaderNav>
      <DropdownContainer>
        <GameSelectDropdown onClick={() => setOpenDropdown(!openDropdown)}>
          QONNECT4 <CaretDownIcon height="8" width="15" color="none" />
        </GameSelectDropdown>
        <HomeIcon height="19" width="21" color="none" />
        {openDropdown && (
          <GameSelectDropdownMenu>
            <GameSelectDropdownMenuItem>Q-Apps</GameSelectDropdownMenuItem>
            <GameSelectDropdownMenuItem>QONNECT4</GameSelectDropdownMenuItem>
            <GameSelectDropdownMenuItem>Test App 1</GameSelectDropdownMenuItem>
            <GameSelectDropdownMenuItem>Test App 2</GameSelectDropdownMenuItem>
          </GameSelectDropdownMenu>
        )}
      </DropdownContainer>
      <QortalLogoIcon height="35" width="35" color="none" />
    </HeaderNav>
  );
};
