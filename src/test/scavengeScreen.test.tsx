import { render, screen, fireEvent } from "@testing-library/react";
import { ScavengeScreen } from "../pages/ScavengerPage.tsx/ScavengerPage";
import { BrowserRouter } from "react-router-dom";

describe("Read ScavengeScreen", () => {
  test("renders page", () => {
    render(
      <BrowserRouter>
        <ScavengeScreen />
      </BrowserRouter>
    );
    //check if they appear
    const button1 = screen.getByText("Submit");

    expect(button1).toBeInTheDocument();
  });
});
