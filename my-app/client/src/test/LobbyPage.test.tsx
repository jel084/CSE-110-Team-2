import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from "@testing-library/react";
import LobbyPage from "../pages/LobbyPage/LobbyPage";
import ScavengeScreen from '../pages/ScavengerPage/scavengeScreen';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from 'axios';

describe("Test Lobby Page Screen", () => {
  test("renders page", async () => {
    // Create a lobby for players to join
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

    // Add players to the lobby
    try {
        const response = await fetch('http://localhost:8080/api/join', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lobbyId: 1,
              userId: 'Player 1',
              pin: 1234,
            }),
        });

        if (response.status === 201) {
            console.log('Lobby created successfully!');
        }
    } catch (error) {
        console.error('Error creating lobby:', error);
    }
    try {
        const response = await fetch('http://localhost:8080/api/join', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lobbyId: 1,
              userId: 'Player 2',
              pin: 1234,
            }),
        });

        if (response.status === 201) {
            console.log('Lobby created successfully!');
        }
    } catch (error) {
        console.error('Error creating lobby:', error);
    }
    try {
        const response = await fetch('http://localhost:8080/api/join', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lobbyId: 1,
              userId: 'Player 3',
              pin: 1234,
            }),
        });

        if (response.status === 201) {
            console.log('Lobby created successfully!');
        }
    } catch (error) {
        console.error('Error creating lobby:', error);
    }

    render(
        <BrowserRouter>
          <Routes>
            <Route path="/lobby/1/Player 1" element={<LobbyPage />} />
          </Routes>
        </BrowserRouter>
    );

    // check if page renders
    setTimeout(() => {
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
    }, 1000);

    // check if timer goes down
    setTimeout(() => {
        const timer = screen.getByText('Starts in: 14');
        expect(timer).toBeInTheDocument();
    }, 1000);
  });

  test("redirects to scavenger when timer reaches 0", async () => {
    // Create a lobby for players to join
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

    // Add players to the lobby
    try {
        const response = await fetch('http://localhost:8080/api/join', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lobbyId: 1,
              userId: 'Player 1',
              pin: 1234,
            }),
        });

        if (response.status === 201) {
            console.log('Lobby created successfully!');
        }
    } catch (error) {
        console.error('Error creating lobby:', error);
    }

    render(
        <BrowserRouter>
          <Routes>
            <Route path="/lobby/1/Player 1" element={<LobbyPage />} />
            <Route path="/scavenge/1/Player 1" element={<ScavengeScreen />} />
          </Routes>
        </BrowserRouter>
    );

    setTimeout(() => {
        const scavengeTitle = screen.getByText("Capture Your Find");
        expect(scavengeTitle).toBeInTheDocument();
    }, 15000);
  });
});