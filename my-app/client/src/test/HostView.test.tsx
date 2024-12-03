import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HostView from "../pages/CreateGamePage/HostView";
import { BrowserRouter } from "react-router-dom";
import axios from 'axios';

jest.mock('axios');
describe("Test Host View Screen", () => {
  test("renders page", () => {
    render(
      <BrowserRouter>
        <HostView />
      </BrowserRouter>
    );

    // check if lobby code input appears
    const lobbyTitle = screen.getByText("Lobby Code");
    const lobbyInput = screen.getByPlaceholderText("XXXX");
    expect(lobbyTitle).toBeInTheDocument();
    expect(lobbyInput).toBeInTheDocument();

    // check if timer appears
    const timerTitle = screen.getByText("Set Time:");
    const timerInput = screen.getByPlaceholderText("hr:mm:ss");
    expect(timerTitle).toBeInTheDocument();
    expect(timerInput).toBeInTheDocument();

    // check if add item field appears
    const addItemTitle = screen.getByText("Add Item:");
    const addItemInput = screen.getByPlaceholderText("Item Name");
    const addItemButton = screen.getByText("Add Item");
    expect(addItemTitle).toBeInTheDocument();
    expect(addItemInput).toBeInTheDocument();
    expect(addItemButton).toBeInTheDocument();

    // check if start game button appears
    const startButton = screen.getByText("Start Game");
    expect(startButton).toBeInTheDocument();
  });

  test("creates game with one item", async () => {
    axios.post = jest.fn().mockResolvedValueOnce({
      status: 201,
      data: { message: 'Lobby created successfully!' },
    });

    render(
      <BrowserRouter>
        <HostView />
      </BrowserRouter>
    );

    // input lobby code
    const lobbyInput = screen.getByPlaceholderText("XXXX");
    expect(lobbyInput).toBeInTheDocument();
    fireEvent.change(lobbyInput, { target: { value: "1234" } });

    // input timer
    const timerInput = screen.getByPlaceholderText("hr:mm:ss");
    expect(timerInput).toBeInTheDocument();
    fireEvent.change(timerInput, { target: { value: "00:05:00" } });

    // add item
    const addItemInput = screen.getByPlaceholderText("Item Name");
    const addItemButton = screen.getByText("Add Item");
    expect(addItemInput).toBeInTheDocument();
    expect(addItemButton).toBeInTheDocument();
    fireEvent.change(addItemInput, { target: { value: "Triton Statue" } });
    fireEvent.click(addItemButton);

    // check if item list appears
    const itemList = screen.getByText("Item #1: Triton Statue");
    expect(itemList).toBeInTheDocument();

    // check if the game is started
    const startButton = screen.getByText("Start Game");
    expect(startButton).toBeInTheDocument();
    fireEvent.click(startButton);
    await waitFor(() => {
      const successMessage = screen.getByText("Lobby created successfully!");
      expect(successMessage).toBeInTheDocument();
    });
  });

  test("creates game with multiple items and one deletion", async () => {
    axios.post = jest.fn().mockResolvedValueOnce({
      status: 201,
      data: { message: 'Lobby created successfully!' },
    });
    
    render(
      <BrowserRouter>
        <HostView />
      </BrowserRouter>
    );

    // input lobby code
    const lobbyInput = screen.getByPlaceholderText("XXXX");
    expect(lobbyInput).toBeInTheDocument();
    fireEvent.change(lobbyInput, { target: { value: "1234" } });

    // input timer
    const timerInput = screen.getByPlaceholderText("hr:mm:ss");
    expect(timerInput).toBeInTheDocument();
    fireEvent.change(timerInput, { target: { value: "00:05:00" } });

    // add items
    const addItemInput = screen.getByPlaceholderText("Item Name");
    const addItemButton = screen.getByText("Add Item");
    expect(addItemInput).toBeInTheDocument();
    expect(addItemButton).toBeInTheDocument();
    fireEvent.change(addItemInput, { target: { value: "Triton Statue" } });
    fireEvent.click(addItemButton);
    fireEvent.change(addItemInput, { target: { value: "Sun God" } });
    fireEvent.click(addItemButton);
    fireEvent.change(addItemInput, { target: { value: "Koala" } });
    fireEvent.click(addItemButton);

    // check if item list appears
    let itemList = screen.getByText("Item #3: Koala");
    expect(itemList).toBeInTheDocument();

    // check if arrow buttons work
    const rightArrowButton = screen.getByText('→');
    expect(rightArrowButton).toBeInTheDocument();
    fireEvent.click(rightArrowButton);
    itemList = screen.getByText("Item #1: Triton Statue");
    expect(itemList).toBeInTheDocument();
    const leftArrowButton = screen.getByText('←');
    expect(leftArrowButton).toBeInTheDocument();
    fireEvent.click(leftArrowButton);
    itemList = screen.getByText("Item #3: Koala");
    expect(itemList).toBeInTheDocument();

    // test deletion
    const deleteButton = screen.getByText("🗑️");
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);
    itemList = screen.getByText("Item #2: Sun God");
    expect(itemList).toBeInTheDocument();

    // check if the game is started
    const startButton = screen.getByText("Start Game");
    expect(startButton).toBeInTheDocument();
    fireEvent.click(startButton);
    await waitFor(() => {
      const successMessage = screen.getByText("Lobby created successfully!");
      expect(successMessage).toBeInTheDocument();
    });
  });
});