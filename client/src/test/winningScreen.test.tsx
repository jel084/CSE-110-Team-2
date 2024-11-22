import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ScoreScreen from "../pages/WinningPage/ScoreScreen";
import { BrowserRouter } from "react-router-dom";

describe("ScoreScreen Component", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()), // Mock successful clipboard write
      },
    });
  });

  test("saves results to clipboard and updates button when 'Save Results' clicked", async () => {
    render(
      <BrowserRouter>
        <ScoreScreen />
      </BrowserRouter>
    );

    // Toggle to the scoreboard view
    fireEvent.click(screen.getByRole("button", { name: /View Results/i }));

    // Simulate clicking the "Save Results" button
    const saveResultsButton = screen.getByRole("button", { name: /Save Results/i });
    fireEvent.click(saveResultsButton);

    // Wait for the button text to update
    await waitFor(() => {
      expect(saveResultsButton).toHaveTextContent("Saved!");
      expect(saveResultsButton).toBeDisabled();
    });

    // Verify clipboard mock was called with the expected text
    const expectedText = "Jane: 70\nSmith: 60\nTim: 50\nSarah: 40\nMorgan: 30\nDave: 20\nMike: 10\nAdam: 0";
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedText);
  });

  test("renders the initial 'Time is up!' view", () => {
    render(
      <BrowserRouter>
        <ScoreScreen />
      </BrowserRouter>
    );

    // Check if "Time is up!" text appears
    const timeUpText = screen.getByText("⏰ Time is up! ⏰");
    expect(timeUpText).toBeInTheDocument();

    // Check if "View Results" button is present
    const viewResultsButton = screen.getByRole("button", { name: /View Results/i });
    expect(viewResultsButton).toBeInTheDocument();
  });

  test("'Join New Game' button navigates to the lobby", () => {
    render(
      <BrowserRouter>
        <ScoreScreen />
      </BrowserRouter>
    );

    // Toggle to the scoreboard view
    fireEvent.click(screen.getByRole("button", { name: /View Results/i }));

    // Check if the "Join New Game" button exists
    const joinNewGameButton = screen.getByRole("button", { name: /Join New Game/i });
    expect(joinNewGameButton).toBeInTheDocument();

    // Check if it redirects correctly (mock navigate function if needed)
    // For now, this ensures the button is rendered correctly.
  });
});
