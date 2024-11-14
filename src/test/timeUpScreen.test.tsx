import { render, screen, fireEvent } from "@testing-library/react";
import TimeUpPage from "../pages/TimeUpPage/TimeUpPage";
import { BrowserRouter } from "react-router-dom";

describe("Read TimeUpScreen", () => {
  test("renders page", () => {
    render(
      <BrowserRouter>
        <TimeUpPage />
      </BrowserRouter>
    );
    //check if they appear
    const button1 = screen.getByText("View Results");

    expect(button1).toBeInTheDocument();
  });
});
