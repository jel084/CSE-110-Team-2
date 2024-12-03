import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import HomePage from "../pages/HomePage/HomePage";
import HostView from '../pages/CreateGamePage/HostView';
import PinPage from '../pages/PinPage/PinPage';
import { BrowserRouter, Routes, Route } from "react-router-dom";

describe("Test Home Page Screen", () => {
  test("renders page", () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // check if page renders
    const homeTitle = screen.getByText("Scavenger Hunt");
    const createButton = screen.getByText("Create Game");
    const joinButton = screen.getByText("Join Game");
    const rulesButton = screen.getByAltText("rule_icon");
    expect(homeTitle).toBeInTheDocument();
    expect(createButton).toBeInTheDocument();
    expect(joinButton).toBeInTheDocument();
    expect(rulesButton).toBeInTheDocument();
  });

  test("redirects to create page when create button is clicked", () => {
    render(
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/creategame" element={<HostView />} />
          </Routes>
        </BrowserRouter>
    );

    setTimeout(() => {
      const createButton = screen.getByText("Create Game");
      expect(createButton).toBeInTheDocument();
      fireEvent.click(createButton);

      const lobbyTitle = screen.getByText("Lobby Code");
      const lobbyInput = screen.getByPlaceholderText("XXXX");
      expect(lobbyTitle).toBeInTheDocument();
      expect(lobbyInput).toBeInTheDocument();
    }, 1000);
  });

  test("redirects to pin page when join button is clicked", () => {
    render(
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pin" element={<PinPage />} />
          </Routes>
        </BrowserRouter>
    );

    setTimeout(() => {
      const joinButton = screen.getByText("Join Game");
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

  test('displays rules popup when question button is clicked', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    let rulesTitle = screen.queryByText("Game Rules");
    expect(rulesTitle).not.toBeInTheDocument();
  
    const rulesButton = screen.getByAltText("rule_icon");
    fireEvent.click(rulesButton);
  
    rulesTitle = screen.getByText("Game Rules");
    expect(rulesTitle).toBeInTheDocument();
  });
});