import { render, screen, fireEvent } from "@testing-library/react";
import LobbyScreen from "../pages/lobbyScreen";
import { BrowserRouter } from "react-router-dom";

describe("Read LobbyScreen", () => {
      test("renders page", () => {
        render(
            <BrowserRouter>
              <LobbyScreen />
            </BrowserRouter>
          );
        //check if they appear
        const button1 = screen.getByText("Scavenge");
    
        expect(button1).toBeInTheDocument();
      });
    });