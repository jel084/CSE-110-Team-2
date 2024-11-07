import { render, screen, fireEvent } from "@testing-library/react";
import { WinningScreen } from "../pages/winningScreen";
import { BrowserRouter } from "react-router-dom";

describe("Read WinningScreen", () => {
      test("renders page", () => {
        render(
            <BrowserRouter>
              <WinningScreen />
            </BrowserRouter>
          );
        //check if they appear
        const text = screen.getByText("This is the WinningScreen");
    
        expect(text).toBeInTheDocument();
      });
    });