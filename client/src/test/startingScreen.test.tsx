import { render, screen, fireEvent } from "@testing-library/react";
import HomePage from "../pages/HomePage/HomePage";
import { BrowserRouter } from "react-router-dom";

describe("Read StartingScreen", () => {
  test("renders page", () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    //check if they appear
    const button1 = screen.getByText("Create Game");
    const button2 = screen.getByText("Join Game");

    expect(button1).toBeInTheDocument();
    expect(button2).toBeInTheDocument();
  });
});
