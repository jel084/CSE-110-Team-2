import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PinPage from "../pages/PinPage/PinPage";
import { BrowserRouter } from "react-router-dom";

describe("Test Pin Page Screen", () => {
  test("renders page", () => {
    render(
      <BrowserRouter>
        <PinPage />
      </BrowserRouter>
    );

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

  test("joins game", async () => {
    const fetchMock = jest.spyOn(global, 'fetch');
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ lobbyId: 1 })
    } as Response);

    render(
      <BrowserRouter>
        <PinPage />
      </BrowserRouter>
    );

    // input lobby code
    const pinInput = screen.getByPlaceholderText("Lobby PIN");
    const playerInput = screen.getByPlaceholderText("Player Name");
    const joinButton = screen.getByText("Join Game");
    fireEvent.change(pinInput, { target: { value: "1234" } });
    fireEvent.change(playerInput, { target: { value: "Player 1" } });
    fireEvent.click(joinButton);
    await waitFor(() => {
        const successMessage = screen.getByText("Successfully joined the lobby!");
        expect(successMessage).toBeInTheDocument();
      });
  });

  test("enters invalid PIN", async () => {
    render(
      <BrowserRouter>
        <PinPage />
      </BrowserRouter>
    );

    // input lobby code
    const pinInput = screen.getByPlaceholderText("Lobby PIN");
    const playerInput = screen.getByPlaceholderText("Player Name");
    const joinButton = screen.getByText("Join Game");
    fireEvent.change(pinInput, { target: { value: "5678" } });
    fireEvent.change(playerInput, { target: { value: "Player 1" } });
    fireEvent.click(joinButton);
    await waitFor(() => {
        const errorMessage = screen.getByText("Error: Invalid Lobby Code or Name");
        const exitButton = screen.getByText("×");
        expect(errorMessage).toBeInTheDocument();
        expect(exitButton).toBeInTheDocument();
      });
  });
});