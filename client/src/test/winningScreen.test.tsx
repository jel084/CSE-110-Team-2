import { render, screen, fireEvent } from "@testing-library/react";
import WinningPage from "../pages/WinningPage/scoreScreen";
import { BrowserRouter } from "react-router-dom";

describe("Read WinningScreen", () => {
  test("renders page", () => {
    render(
      <BrowserRouter>
        <WinningPage />
      </BrowserRouter>
    );
    //check if they appear
    const text = screen.getByText("This is the WinningScreen");

    expect(text).toBeInTheDocument();
  });
});
