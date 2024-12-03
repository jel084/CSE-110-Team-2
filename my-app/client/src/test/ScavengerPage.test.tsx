import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/react";
import ScavengeScreen from '../pages/ScavengerPage/scavengeScreen';
import TimeUpPage from '../pages/TimeUpPage/TimeUpPage';
import { BrowserRouter, Routes, Route, MemoryRouter } from "react-router-dom";
import axios from 'axios';

describe("Test Scavenge Page Screen", () => {
  test("renders page", async () => {
    // Create a lobby
    try {
        const response = await axios.post('http://localhost:8080/api/create', {
            lobbyName: `Lobby-1234`,
            scavengerItems: [{ id: 1, name: "Triton Statue", points: 10, found: false }],
            userId: 'HostUser1',
            pin: `1234`,
            gameTime: 60
        });

        if (response.status === 201) {
            console.log('Lobby created successfully!');
        }
    } catch (error) {
        console.error('Error creating lobby:', error);
    }

    // Add player to the lobby
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
        <MemoryRouter initialEntries={['/scavenge/1/Player 1']}>
          <Routes>
            <Route path="/scavenge/1/Player 1" element={<ScavengeScreen />} />
          </Routes>
        </MemoryRouter>
    );

    jest.useFakeTimers();
    // check if page renders
    const scavengeTitle = screen.getByText("Capture Your Find");
    const itemListTitle = screen.getByText("Item List:");
    const timerTitle = screen.getByText("Time Remaining:");
    // const timer = screen.getByText('00:00:59');
    expect(scavengeTitle).toBeInTheDocument();
    expect(itemListTitle).toBeInTheDocument();
    expect(timerTitle).toBeInTheDocument();
    // expect(timer).toBeInTheDocument();

    // check if timer goes down
    setTimeout(() => {
        const timer = screen.getByText('00:00:59');
        expect(timer).toBeInTheDocument();
    }, 1000);
    jest.useRealTimers();
  });

//   test("redirects to scavenger when timer reaches 0", async () => {
//     // Create a lobby for players to join
//     try {
//         const response = await axios.post('http://localhost:8080/api/create', {
//             lobbyName: `Lobby-1234`,
//             scavengerItems: [{ id: 1, name: "Triton Statue", points: 10, found: false }],
//             userId: 'HostUser1',
//             pin: `1234`
//         });

//         if (response.status === 201) {
//             console.log('Lobby created successfully!');
//         }
//     } catch (error) {
//         console.error('Error creating lobby:', error);
//     }

//     // Add players to the lobby
//     try {
//         const response = await fetch('http://localhost:8080/api/join', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//               lobbyId: 1,
//               userId: 'Player 1',
//               pin: 1234,
//             }),
//         });

//         if (response.status === 201) {
//             console.log('Lobby created successfully!');
//         }
//     } catch (error) {
//         console.error('Error creating lobby:', error);
//     }

//     render(
//         <BrowserRouter>
//           <Routes>
//             <Route path="/lobby/1/Player 1" element={<TimeUpPage />} />
//             <Route path="/scavenge/1/Player 1" element={<ScavengeScreen />} />
//           </Routes>
//         </BrowserRouter>
//     );

//     setTimeout(() => {
//         const scavengeTitle = screen.getByText("Capture Your Find");
//         expect(scavengeTitle).toBeInTheDocument();
//     }, 15000);
//   });
});