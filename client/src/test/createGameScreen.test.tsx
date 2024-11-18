import { render, screen, fireEvent } from "@testing-library/react";
import CreateGamePage from "../pages/CreateGamePage/hostview";
import { BrowserRouter } from "react-router-dom";

describe("Read CreateGameScreen", () => {
  test("renders page", () => {
    render(
      <BrowserRouter>
        <CreateGamePage />
      </BrowserRouter>
    );
    //check if they appear
    const button1 = screen.getByText("Start Game");

    expect(button1).toBeInTheDocument();
  });
});
