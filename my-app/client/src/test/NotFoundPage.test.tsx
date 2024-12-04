import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import NotFoundPage from "../pages/ErrorPage/NotFoundPage";
import HomePage from '../pages/HomePage/HomePage';
import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router-dom";

describe("Test Error Page Screen", () => {
  test("renders page", () => {
    render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );

    // check if page renders
    const errorTitle = screen.getByText("404 Not Found");
    const goBackButton = screen.getByText("Go back to home page");
    expect(errorTitle).toBeInTheDocument();
    expect(goBackButton).toBeInTheDocument();
  });

  test("redirects to home page when go back button is clicked", () => {
    render(
        <MemoryRouter initialEntries={['/invalid-path']}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/invalid-path" element={<NotFoundPage />} />
          </Routes>
        </MemoryRouter>
    );

    const errorTitle = screen.getByText("404 Not Found");
    const goBackButton = screen.getByText("Go back to home page");
    expect(errorTitle).toBeInTheDocument();
    expect(goBackButton).toBeInTheDocument();
    fireEvent.click(goBackButton);

    const homeTitle = screen.getByText("Scavenger Hunt");
    const createButton = screen.getByText("Create Game");
    const joinButton = screen.getByText("Join Game");
    const rulesButton = screen.getByAltText("rule_icon");
    expect(homeTitle).toBeInTheDocument();
    expect(createButton).toBeInTheDocument();
    expect(joinButton).toBeInTheDocument();
    expect(rulesButton).toBeInTheDocument();
  });
});