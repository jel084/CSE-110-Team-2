import { render, screen, fireEvent } from "@testing-library/react";
import WinningPage from "../pages/WinningPage/ScoreScreen";
import { BrowserRouter } from "react-router-dom";

describe("Read ScoreScreen", () => {
  test("renders page", () => {
    render(
      <BrowserRouter>
        <WinningPage />
      </BrowserRouter>
    );
    //check if they appear
    const text = screen.getByText("Time is up!");

    expect(text).toBeInTheDocument();
  });
});
