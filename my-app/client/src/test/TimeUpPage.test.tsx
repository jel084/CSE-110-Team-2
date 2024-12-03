import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TimeUpPage from '../pages/TimeUpPage/TimeUpPage';
import ScoreScreen from '../pages/WinningPage/scoreScreen';
import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router-dom";
import axios from 'axios';

jest.mock('axios');
describe("Test Time Up Page Screen", () => {
  test("renders page", () => {
    render(
      <BrowserRouter>
        <TimeUpPage />
      </BrowserRouter>
    );

    // check if page renders
    const timeTitle = screen.getByText("⏳ Time's Up!");
    const scoreButton = screen.getByText("View Results");
    expect(timeTitle).toBeInTheDocument();
    expect(scoreButton).toBeInTheDocument();
  });

  test("redirects to scoreboard page when view results button is clicked", async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
          players: [
              { id: 'Player 1', points: 10 },
              { id: 'Player 2', points: 20 }
          ]
      }
    });

    render(
        <MemoryRouter initialEntries={['/timeup']}>
          <Routes>
            <Route path="/timeup" element={<TimeUpPage />} />
            <Route path="/winners" element={<ScoreScreen />} />
          </Routes>
        </MemoryRouter>
    );

    const timeTitle = screen.getByText("⏳ Time's Up!");
    const scoreButton = screen.getByText("View Results");
    expect(timeTitle).toBeInTheDocument();
    expect(scoreButton).toBeInTheDocument();
    fireEvent.click(scoreButton);

    await waitFor(() => {
      const saveButton = screen.getByText("Save Results");
      const joinButton = screen.getByText("Join New Game");
      expect(saveButton).toBeInTheDocument();
      expect(joinButton).toBeInTheDocument();
    });
    
  });
});