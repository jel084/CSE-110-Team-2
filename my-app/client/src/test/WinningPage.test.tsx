import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ScoreScreen from '../pages/WinningPage/scoreScreen';
import PinPage from '../pages/PinPage/PinPage';
import { BrowserRouter, Routes, Route, MemoryRouter } from "react-router-dom";
import axios from 'axios';

jest.mock('axios');
describe("Test Winning Page Screen", () => {
  test("renders page", async () => {
    axios.get = jest.fn().mockResolvedValue({
        data: {
            players: [
                { id: 'Player 1', points: 0 },
                { id: 'Player 2', points: 20 },
                { id: 'Player 3', points: 10 }
            ]
        }
    });

    render(
        <BrowserRouter>
          <ScoreScreen />
        </BrowserRouter>
    );

    // check if page renders
    const timeUp = screen.getByText("⏰ Time is up! ⏰");
    const viewResults = screen.getByText("View Results");
    expect(timeUp).toBeInTheDocument();
    expect(viewResults).toBeInTheDocument();
    fireEvent.click(viewResults);
    await waitFor(() => {
        const winnerTitle = screen.getByText('🎉 Player 2 got 1st place! 🎉');
        const firstPlace = screen.getByText('1');
        const firstPlaceName = screen.getByText('Player 2');
        const firstPlaceScore = screen.getByText('20');
        const saveButton = screen.getByText("Save Results");
        const joinButton = screen.getByText("Join New Game");
        expect(winnerTitle).toBeInTheDocument();
        expect(saveButton).toBeInTheDocument();
        expect(joinButton).toBeInTheDocument();
        expect(firstPlace).toBeInTheDocument();
        expect(firstPlaceName).toBeInTheDocument();
        expect(firstPlaceScore).toBeInTheDocument();
    });
  });

  test("shows success message when save results button is clicked", async () => {
    axios.get = jest.fn().mockResolvedValue({
        data: {
            players: [
                { id: 'Player 1', points: 0 }
            ]
        }
    });
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });

    render(
        <BrowserRouter>
          <ScoreScreen />
        </BrowserRouter>
    );

    // check if page renders
    const timeUp = screen.getByText("⏰ Time is up! ⏰");
    const viewResults = screen.getByText("View Results");
    expect(timeUp).toBeInTheDocument();
    expect(viewResults).toBeInTheDocument();
    fireEvent.click(viewResults);
    await waitFor(() => {
      const saveButton = screen.getByText("Save Results");
      expect(saveButton).toBeInTheDocument();
    });

    const saveButton = screen.getByText("Save Results");
    fireEvent.click(saveButton);
  
    await waitFor(() => {
      const successMessage = screen.getByText("Saved!");
      expect(successMessage).toBeInTheDocument();
    });
  });

  test("redirects to pin page when join button is clicked", async () => {
    axios.get = jest.fn().mockResolvedValue({
        data: {
            players: []
        }
    });

    render(
        <MemoryRouter initialEntries={['/winners']}>
          <Routes>
            <Route path="/winners" element={<ScoreScreen />} />
            <Route path="/pin" element={<PinPage />} />
          </Routes>
        </MemoryRouter>
    );

    const timeUp = screen.getByText("⏰ Time is up! ⏰");
    const viewResults = screen.getByText("View Results");
    expect(timeUp).toBeInTheDocument();
    expect(viewResults).toBeInTheDocument();
    fireEvent.click(viewResults);
    await waitFor(() => {
        const scoreTitle = screen.getByText("No players found");
        const joinButton = screen.getByText("Join New Game");
        expect(scoreTitle).toBeInTheDocument();
        expect(joinButton).toBeInTheDocument();
        fireEvent.click(joinButton);

        const pinTitle = screen.getByText("Enter Lobby Code");
        const pinInput = screen.getByPlaceholderText("Lobby PIN");
        const playerInput = screen.getByPlaceholderText("Player Name");
        expect(pinTitle).toBeInTheDocument();
        expect(pinInput).toBeInTheDocument();
        expect(playerInput).toBeInTheDocument();
    });
  });
});