import { render, screen, fireEvent } from "@testing-library/react";
import { TimeUpScreen } from "../pages/timeUpScreen";
import { BrowserRouter } from "react-router-dom";

describe("Read TimeUpScreen", () => {
      test("renders page", () => {
        render(
            <BrowserRouter>
              <TimeUpScreen />
            </BrowserRouter>
          );
        //check if they appear
        const button1 = screen.getByText("View Results");
    
        expect(button1).toBeInTheDocument();
      });
    });