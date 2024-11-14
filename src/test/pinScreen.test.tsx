import { render, screen, fireEvent } from "@testing-library/react";
import PinPage from "../pages/PinPage/PinPage";
import { BrowserRouter } from "react-router-dom";

describe("Read PinScreen", () => {
  test("renders page", () => {
    render(
      <BrowserRouter>
        <PinPage />
      </BrowserRouter>
    );
    //check if they appear
    const button1 = screen.getByText("Start Game");

    expect(button1).toBeInTheDocument();
  });
});
