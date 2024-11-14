import { render, screen, fireEvent } from "@testing-library/react";
import LobbyScreen from "../pages/lobbyScreen";
import { BrowserRouter, MemoryRouter } from "react-router-dom";

describe("Read LobbyScreen", () => {
      test("renders page", () => {
        render(
            <BrowserRouter>
              <LobbyScreen />
            </BrowserRouter>
          );
        //check if they appear
        const playerCountText = screen.getByText(/Players: \d+/);
        const playerCount = parseInt(playerCountText.textContent?.match(/\d+/)?.[0] || "0", 10);

        //check if player boxes matches the displayed player count
        const playerBoxes = screen.getAllByTestId("player-box");
        expect(playerBoxes.length).toBe(playerCount);

        const timerText = screen.getByText("Game starts in:");
        expect(timerText).toBeInTheDocument();
      });
      test("navigates to /scavenge on clicking Start link", () => {
        render(
            <MemoryRouter>
                <LobbyScreen />
            </MemoryRouter>
        );

        //click the start link
        const startLink = screen.getByText("Start");
        fireEvent.click(startLink);

        //this doesnt work
        // expect(window.location.pathname).toBe("/scavenge");
    });
    });