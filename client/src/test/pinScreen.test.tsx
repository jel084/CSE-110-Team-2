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
    // check if page renders
    const pinTitle = screen.getByText("Enter Lobby Code");
    const pinInput = screen.getByPlaceholderText("Lobby PIN");
    const playerInput = screen.getByPlaceholderText("Player Name");
    const joinButton = screen.getByText("Join Game");
    expect(pinTitle).toBeInTheDocument();
    expect(pinInput).toBeInTheDocument();
    expect(playerInput).toBeInTheDocument();
    expect(joinButton).toBeInTheDocument();
  });


  test("enters no PIN", async () => {
    render(
      <BrowserRouter>
        <PinPage />
      </BrowserRouter>
    );
    const playerInput = screen.getByPlaceholderText("Player Name");
    const joinButton = screen.getByText("Join Game");
    fireEvent.change(playerInput, { target: { value: "Player 1" } });
    fireEvent.click(joinButton);
    setTimeout(() => {
        const errorMessage = screen.getByText("Error: Invalid Lobby Code or User ID");
        const okButton = screen.getByText("OK");
        expect(errorMessage).toBeInTheDocument();
        expect(okButton).toBeInTheDocument();
      }, 1000);
  });

  test("enters no player name", async () => {
    render(
      <BrowserRouter>
        <PinPage />
      </BrowserRouter>
    );
    const pinInput = screen.getByPlaceholderText("Lobby PIN");
    const joinButton = screen.getByText("Join Game");
    fireEvent.change(pinInput, { target: { value: "5678" } });
    fireEvent.click(joinButton);
    setTimeout(() => {
        const errorMessage = screen.getByText("Error: Invalid Lobby Code or User ID");
        const okButton = screen.getByText("OK");
        expect(errorMessage).toBeInTheDocument();
        expect(okButton).toBeInTheDocument();
      }, 1000);
  });

  test("enters no pin and no player", async () => {
    render(
      <BrowserRouter>
        <PinPage />
      </BrowserRouter>
    );
    const joinButton = screen.getByText("Join Game");
    fireEvent.click(joinButton);
    setTimeout(() => {
        const errorMessage = screen.getByText("Error: Invalid Lobby Code or User ID");
        const okButton = screen.getByText("OK");
        expect(errorMessage).toBeInTheDocument();
        expect(okButton).toBeInTheDocument();
      }, 1000);
  });

  test("enters 1 digit", async () => {
    render(
      <BrowserRouter>
        <PinPage />
      </BrowserRouter>
    );
    const pinInput = screen.getByPlaceholderText("Lobby PIN");
    const joinButton = screen.getByText("Join Game");
    const playerInput = screen.getByPlaceholderText("Player Name");
    fireEvent.change(pinInput, { target: { value: "1" } });
    fireEvent.change(playerInput, { target: { value: "Player 1" } });
    fireEvent.click(joinButton);
    setTimeout(() => {
        const errorMessage = screen.getByText("Error: Invalid Lobby Code or User ID");
        const okButton = screen.getByText("OK");
        expect(errorMessage).toBeInTheDocument();
        expect(okButton).toBeInTheDocument();
      }, 1000);
  });

  test("enters 2 digit", async () => {
    render(
      <BrowserRouter>
        <PinPage />
      </BrowserRouter>
    );
    const pinInput = screen.getByPlaceholderText("Lobby PIN");
    const joinButton = screen.getByText("Join Game");
    const playerInput = screen.getByPlaceholderText("Player Name");
    fireEvent.change(pinInput, { target: { value: "12" } });
    fireEvent.change(playerInput, { target: { value: "Player 1" } });
    fireEvent.click(joinButton);
    setTimeout(() => {
        const errorMessage = screen.getByText("Error: Invalid Lobby Code or User ID");
        const okButton = screen.getByText("OK");
        expect(errorMessage).toBeInTheDocument();
        expect(okButton).toBeInTheDocument();
      }, 1000);
  });

  test("enters 3 digit", async () => {
    render(
      <BrowserRouter>
        <PinPage />
      </BrowserRouter>
    );
    const pinInput = screen.getByPlaceholderText("Lobby PIN");
    const joinButton = screen.getByText("Join Game");
    const playerInput = screen.getByPlaceholderText("Player Name");
    fireEvent.change(pinInput, { target: { value: "123" } });
    fireEvent.change(playerInput, { target: { value: "Player 1" } });
    fireEvent.click(joinButton);
    setTimeout(() => {
        const errorMessage = screen.getByText("Error: Invalid Lobby Code or User ID");
        const okButton = screen.getByText("OK");
        expect(errorMessage).toBeInTheDocument();
        expect(okButton).toBeInTheDocument();
      }, 1000);
  });
  

  test("Check if join game sends to scavenge screen", async () => {
    render(
      <BrowserRouter>
        <PinPage />
      </BrowserRouter>
    );
    const pinInput = screen.getByPlaceholderText("Lobby PIN");
    const playerInput = screen.getByPlaceholderText("Player Name");
    const joinButton = screen.getByText("Join Game");
    fireEvent.change(pinInput, { target: { value: "5678" } });
    fireEvent.change(playerInput, { target: { value: "Player 1" } });
    fireEvent.click(joinButton);
    const proceedButton = screen.getByText("Proceed to Scavenge");
    fireEvent.click(proceedButton);
    setTimeout(() => {
      expect(window.location.pathname).toBe("/scavenge/");
    }, 1000);
  });
  

});
