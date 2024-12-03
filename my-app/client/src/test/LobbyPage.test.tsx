import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from "@testing-library/react";
import LobbyPage from "../pages/LobbyPage/LobbyPage";
import ScavengeScreen from '../pages/ScavengerPage/scavengeScreen';
import { Routes, Route, MemoryRouter } from "react-router-dom";
import axios from 'axios';

jest.mock('axios');
describe("Test Lobby Page Screen", () => {
  test("renders page", async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
          players: ['Player 1', 'Player 2', 'Player 3']
      }
    });

    render(
        <MemoryRouter initialEntries={['/lobby/1/Player 1']}>
          <Routes>
            <Route path="/lobby/:lobbyId/:userId" element={<LobbyPage />} />
          </Routes>
        </MemoryRouter>
    );

    // check if page renders
    await waitFor(() => {
        const playersTitle = screen.getByText('Players: 3');
        const timer = screen.getByText('Starts in: 15');
        const player1 = screen.getByText('Player 1');
        const player2 = screen.getByText('Player 2');
        const player3 = screen.getByText('Player 3');
        expect(playersTitle).toBeInTheDocument();
        expect(timer).toBeInTheDocument();
        expect(player1).toBeInTheDocument();
        expect(player2).toBeInTheDocument();
        expect(player3).toBeInTheDocument();
    });
  });

  test("redirects to scavenger when timer reaches 0", async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
          players: ['Player 1']
      }
    });
    axios.post = jest.fn().mockResolvedValue({
      status: 200,
      data: { message: 'Lobby 1 started' },
    });

    render(
      <MemoryRouter initialEntries={['/lobby/1/Player 1']}>
          <Routes>
            <Route path="/lobby/:lobbyId/:userId" element={<LobbyPage />} />
            <Route path="/scavenge/:lobbyId/:userId" element={<ScavengeScreen />} />
          </Routes>
      </MemoryRouter>
    );

  setTimeout(() => {
    const scavengeTitle = screen.getByText("Capture Your Find");
    expect(scavengeTitle).toBeInTheDocument();
  }, 15000);
  });
});