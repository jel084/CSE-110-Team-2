import { render, screen, fireEvent } from "@testing-library/react";
import { PinScreen } from "../pages/pinScreen";
import { BrowserRouter } from "react-router-dom";

describe("Read PinScreen", () => {
      test("renders page", () => {
        render(
            <BrowserRouter>
              <PinScreen />
            </BrowserRouter>
          );
        //check if they appear
        const button1 = screen.getByText("Start Game");
    
        expect(button1).toBeInTheDocument();
      });
    });