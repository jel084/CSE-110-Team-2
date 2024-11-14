import { render, screen, fireEvent } from "@testing-library/react";
import LobbyPage from "../pages/LobbyPage/LobbyPage";
import { BrowserRouter } from "react-router-dom";

describe("Read LobbyScreen", () => {
  test("renders page", () => {
    render(
      <BrowserRouter>
        <LobbyPage />
      </BrowserRouter>
    );
    //check if they appear
    const button1 = screen.getByText("Scavenge");

    expect(button1).toBeInTheDocument();
  });
});
