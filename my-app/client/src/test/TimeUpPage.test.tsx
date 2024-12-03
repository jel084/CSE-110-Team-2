import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import TimeUpPage from '../pages/TimeUpPage/TimeUpPage';
import ScoreScreen from '../pages/WinningPage/scoreScreen';
import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router-dom";

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

  test("redirects to scoreboard page when view results button is clicked", () => {
    render(
        <MemoryRouter initialEntries={['/timeup']}>
          <Routes>
            <Route path="/timeup" element={<TimeUpPage />} />
            <Route path="/winners" element={<ScoreScreen />} />
          </Routes>
        </MemoryRouter>
    );

    setTimeout(() => {
      const timeTitle = screen.getByText("⏳ Time's Up!");
      const scoreButton = screen.getByText("View Results");
      expect(timeTitle).toBeInTheDocument();
      expect(scoreButton).toBeInTheDocument();
      fireEvent.click(scoreButton);

      const saveButton = screen.getByText("Save Results");
      const joinButton = screen.getByText("Join New Game");
      expect(saveButton).toBeInTheDocument();
      expect(joinButton).toBeInTheDocument();
    }, 1000);
  });
});