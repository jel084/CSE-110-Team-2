import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import path from "path";
import fs from "fs";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ScavengeScreen from '../pages/ScavengerPage/scavengeScreen';
import { Routes, Route, MemoryRouter } from "react-router-dom";
import axios from 'axios';

jest.mock('axios');
describe("Test Scavenge Page Screen", () => {
  test("renders page", async () => {
    (axios.get as jest.Mock)
      .mockResolvedValueOnce({
        data: { gameTime: 60 },
      })
      .mockResolvedValueOnce({
        data: [
          { id: 1, name: "Triton Statue", points: 10, found: false },
          { id: 2, name: "Sun God", points: 10, found: false },
        ]
      });

    render(
      <MemoryRouter initialEntries={['/scavenge/1/Player 1']}>
        <Routes>
          <Route path="/scavenge/:lobbyId/:userId" element={<ScavengeScreen />} />
        </Routes>
      </MemoryRouter>
    );

    // check if page renders
    await waitFor(() => {
      const scavengeTitle = screen.getByText("Capture Your Find");
      const itemListTitle = screen.getByText("Item List:");
      const timerTitle = screen.getByText("Time Remaining:");
      const timer = screen.getByPlaceholderText("hr:mm:ss");
      const firstItem = screen.getByText("Item #1: Triton Statue");
      const leftArrowButton = screen.getByText('←');
      const rightArrowButton = screen.getByText('→');
      const deleteButton = screen.getByText("🗑️");
      const imageTitle = screen.getByText("Upload Image");
      const imageField = screen.getByText("No image selected");
      const submitButton = screen.getByText("Submit");

      expect(scavengeTitle).toBeInTheDocument();
      expect(itemListTitle).toBeInTheDocument();
      expect(timerTitle).toBeInTheDocument();
      expect(timer).toBeInTheDocument();
      expect(firstItem).toBeInTheDocument();
      expect(leftArrowButton).toBeInTheDocument();
      expect(rightArrowButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
      expect(imageTitle).toBeInTheDocument();
      expect(imageField).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });
  });

  test("uploads an image", async () => {
    (axios.get as jest.Mock)
      .mockResolvedValueOnce({
        data: { gameTime: 60 },
      })
      .mockResolvedValueOnce({
        data: [
          { id: 1, name: "Triton Statue", points: 10, found: false },
          { id: 2, name: "Sun God", points: 10, found: false },
        ]
      });

    (axios.put as jest.Mock).mockResolvedValueOnce({ status: 200, 
      data: { 
        item: {id: 1, name: "Triton Statue", points: 10, found: true, image: '/uploads/test.jpg'} 
      } 
    });

    render(
      <MemoryRouter initialEntries={['/scavenge/1/Player 1']}>
        <Routes>
          <Route path="/scavenge/:lobbyId/:userId" element={<ScavengeScreen />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      const fileContent = fs.readFileSync(path.resolve(__dirname, "../../public/bg_img.jpg"));
      const file = new File([fileContent], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(fileInput.files?.[0]).toBe(file);
      expect(fileInput.files?.[0].name).toBe("test.jpg");
      expect(fileInput.files).toHaveLength(1);
    });
  });

  test("deletes an image", async () => {
    (axios.get as jest.Mock)
      .mockResolvedValueOnce({
        data: { gameTime: 60 },
      })
      .mockResolvedValueOnce({
        data: [
          { id: 1, name: "Triton Statue", points: 10, found: false },
          { id: 2, name: "Sun God", points: 10, found: false },
        ]
      });

    (axios.put as jest.Mock).mockResolvedValueOnce({ status: 200, 
      data: { 
        item: {id: 1, name: "Triton Statue", points: 10, found: true, image: '/uploads/test.jpg'} 
      } 
    });

    (axios.delete as jest.Mock).mockResolvedValueOnce({ status: 200, 
      data: { 
        message: "Image deleted successfully"
      } 
    });

    render(
      <MemoryRouter initialEntries={['/scavenge/1/Player 1']}>
        <Routes>
          <Route path="/scavenge/:lobbyId/:userId" element={<ScavengeScreen />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      const fileContent = fs.readFileSync(path.resolve(__dirname, "../../public/bg_img.jpg"));
      const file = new File([fileContent], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(fileInput.files?.[0]).toBe(file);
      expect(fileInput.files?.[0].name).toBe("test.jpg");
      expect(fileInput.files).toHaveLength(1);

      const deleteButton = screen.getByText("🗑️");
      fireEvent.click(deleteButton);
      const imageField = screen.getByText("No image selected");
      expect(imageField).toBeInTheDocument();
    });
  });
});