import { render, screen, fireEvent } from "@testing-library/react";
import ScavengerPage from "../pages/ScavengerPage/scavengeScreen";
import { BrowserRouter } from "react-router-dom";
import { testItems } from "../constants/constants";

describe("Read ScavengeScreen", () => {
  test("renders page", () => {
    render(
      <BrowserRouter>
        <ScavengerPage name={'player1'} points={0} items={testItems} />
      </BrowserRouter>
    );
    //check if they appear
    const button1 = screen.getByText("Submit");

    expect(button1).toBeInTheDocument();
  });
});
