import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import PinPage from "../pages/PinPage/PinPage";
import { BrowserRouter } from "react-router-dom";
import axios from 'axios';

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
    render(
      <BrowserRouter>
        <PinPage />
      </BrowserRouter>
    );

    // create game in backend
    try {
        const response = await axios.post('http://localhost:8080/api/create', {
            lobbyName: `Lobby-1234`,
            scavengerItems: [{ id: 1, name: "Triton Statue", points: 10, found: false }],
            userId: 'HostUser1',
            pin: `1234`
        });

        if (response.status === 201) {
            console.log('Lobby created successfully!');
        }
    } catch (error) {
        console.error('Error creating lobby:', error);
    }

    // input lobby code
    const pinInput = screen.getByPlaceholderText("Lobby PIN");
    const playerInput = screen.getByPlaceholderText("Player Name");
    const joinButton = screen.getByText("Join Game");
    fireEvent.change(pinInput, { target: { value: "1234" } });
    fireEvent.change(playerInput, { target: { value: "Player 1" } });
    fireEvent.click(joinButton);
    setTimeout(() => {
        const successMessage = screen.getByText("Successfully joined the lobby!");
        const toScavengeButton = screen.getByText("Proceed to Scavenge");
        expect(successMessage).toBeInTheDocument();
        expect(toScavengeButton).toBeInTheDocument();
      }, 1000);
  });

  test("enters invalid PIN", async () => {
    render(
      <BrowserRouter>
        <PinPage />
      </BrowserRouter>
    );

    // create game in backend
    try {
        const response = await axios.post('http://localhost:8080/api/create', {
            lobbyName: `Lobby-1234`,
            scavengerItems: [{ id: 1, name: "Triton Statue", points: 10, found: false }],
            userId: 'HostUser1',
            pin: `1234`
        });

        if (response.status === 201) {
            console.log('Lobby created successfully!');
        }
    } catch (error) {
        console.error('Error creating lobby:', error);
    }

    // input lobby code
    const pinInput = screen.getByPlaceholderText("Lobby PIN");
    const playerInput = screen.getByPlaceholderText("Player Name");
    const joinButton = screen.getByText("Join Game");
    fireEvent.change(pinInput, { target: { value: "5678" } });
    fireEvent.change(playerInput, { target: { value: "Player 1" } });
    fireEvent.click(joinButton);
    setTimeout(() => {
        const errorMessage = screen.getByText("Error: Invalid Lobby Code or User ID");
        const okButton = screen.getByText("OK");
        expect(errorMessage).toBeInTheDocument();
        expect(okButton).toBeInTheDocument();
      }, 1000);
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
});