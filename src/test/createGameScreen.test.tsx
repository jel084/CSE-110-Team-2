import { render, screen, fireEvent } from "@testing-library/react";
import { CreateGameScreen } from "../pages/createGameScreen";
import { BrowserRouter } from "react-router-dom";

describe("Read CreateGameScreen", () => {
      test("renders page", () => {
        render(
            <BrowserRouter>
              <CreateGameScreen />
            </BrowserRouter>
          );
        //check if they appear
        const button1 = screen.getByText("Start Game");
    
        expect(button1).toBeInTheDocument();
      });
    });