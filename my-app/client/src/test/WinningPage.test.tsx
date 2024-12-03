import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from "@testing-library/react";
import ScoreScreen from '../pages/WinningPage/scoreScreen';
import PinPage from '../pages/PinPage/PinPage';
import { BrowserRouter, Routes, Route, MemoryRouter } from "react-router-dom";
import axios from 'axios';

describe("Test Winning Page Screen", () => {
  test("renders page", async () => {
    // Create a lobby
    try {
        const response = await axios.post('http://localhost:8080/api/create', {
            lobbyName: `Lobby-1234`,
            scavengerItems: [
                { id: 1, name: "Triton Statue", points: 10, found: false },
                { id: 1, name: "Sun God", points: 20, found: false }
            ],
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

    // Give players some points
    try {
        const response = await axios.post('http://localhost:8080/api/update-points', {
            lobbyId: 1,
            userId: 'Player 2',
            points: 20
        });

        if (response.status === 201) {
            console.log('Lobby created successfully!');
        }
    } catch (error) {
        console.error('Error creating lobby:', error);
    }
    try {
        const response = await axios.post('http://localhost:8080/api/update-points', {
            lobbyId: 1,
            userId: 'Player 3',
            points: 10
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
            <Route path="/winners" element={<ScoreScreen />} />
          </Routes>
        </BrowserRouter>
    );

    // check if page renders
    setTimeout(() => {
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
    }, 1000);
  });

  test("shows success message when save results button is clicked", async () => {
    // Create a lobby
    try {
        const response = await axios.post('http://localhost:8080/api/create', {
            lobbyName: `Lobby-1234`,
            scavengerItems: [
                { id: 1, name: "Triton Statue", points: 10, found: false },
                { id: 1, name: "Sun God", points: 20, found: false }
            ],
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
            <Route path="/winners" element={<ScoreScreen />} />
          </Routes>
        </BrowserRouter>
    );

    // check if page renders
    setTimeout(() => {
        const saveButton = screen.getByText("Save Results");
        expect(saveButton).toBeInTheDocument();
        fireEvent.click(saveButton);
        const successMessage = screen.getByText("Scores saved successfully!");
        expect(successMessage).toBeInTheDocument();
    }, 1000);
  });

  test("redirects to pin page when join button is clicked", async () => {
    render(
        <MemoryRouter initialEntries={['/winners']}>
          <Routes>
            <Route path="/winners" element={<ScoreScreen />} />
            <Route path="/pin" element={<PinPage />} />
          </Routes>
        </MemoryRouter>
    );

    setTimeout(() => {
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
    }, 1000);
  });
});