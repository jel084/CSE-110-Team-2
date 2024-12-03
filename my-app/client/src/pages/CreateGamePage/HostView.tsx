import React, { useState, useEffect } from "react";
import "./HostViewStyle.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Item } from "../../types/types";
import GoBackButton from "../../components/GoBackButton/GoBackButton";
import PopupWindow from "../../components/PopupWindow/PopupWindow";

function HostView() {
  const [lobbyCode, setLobbyCode] = useState("");
  const [timeInput, setTimeInput] = useState("00:00:00");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [newItem, setNewItem] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hostName, setHostName] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [showInvalidPopup, setShowInvalidPopup] = useState(false); // State to toggle invalid popup
  const [invalidMessage, setInvalidMessage] = useState(""); // State for invalid input message
  const navigate = useNavigate();

  const convertTimeToSeconds = (time: string) => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + (seconds || 0);
  };

  const handleLobbyCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,4}$/.test(value)) {
      setLobbyCode(value);
    }
  };

  const addItem = () => {
    if (newItem.trim() !== "") {
      const newId = items.length > 0 ? items[items.length - 1].id + 1 : 1;
      const newItemObject = {
        id: newId,
        name: newItem,
        points: 10,
        found: false,
      };
      setItems((prevItems) => [...prevItems, newItemObject]);
      setNewItem("");
      setCurrentIndex(items.length);
    }
  };

  const deleteItem = () => {
    if (items.length > 0) {
      const updatedItems = items.filter((_, index) => index !== currentIndex);
      setItems(updatedItems);
      setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    }
  };

  const prevItem = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  const nextItem = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleCreateLobby = async () => {
    if (!lobbyCode || items.length === 0 || !timeInput || convertTimeToSeconds(timeInput) === 0) {
      setInvalidMessage("Please enter a valid lobby code, add at least one item, and set a valid time.");
      setShowInvalidPopup(true);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/create", {
        lobbyName: `Lobby-${lobbyCode}`,
        scavengerItems: items,
        userId: hostName || "HostUser1",
        pin: lobbyCode,
        gameTime: convertTimeToSeconds(timeInput),
      });

      if (response.status === 201) {
        const { lobbyId } = response.data;
        setSuccessMessage("Lobby created successfully!");
        setTimeout(() => setSuccessMessage(""), 8080);
      }
    } catch (error) {
      console.error("Error creating lobby:", error);
      setInvalidMessage("Failed to create lobby. Please try again.");
      setShowInvalidPopup(true);
    }
  };

  const startTimer = () => {
    setTimeRemaining(convertTimeToSeconds(timeInput));
  };

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          alert("Time's up!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map((val) => String(val).padStart(2, "0"))
      .join(":");
  };
  const toggleRulesPopup = () => {
    setShowInvalidPopup((prev) => !prev);
  };

  return (
    <>
      <div className="spacer">
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
      </div>
      <div className="host-view">
        <GoBackButton />
        <header className="header">
          <h1>Lobby Code</h1>
          <div className="lobby-code">
            <input
              type="text"
              aria-label="Lobby Code"
              value={lobbyCode}
              onChange={handleLobbyCode}
              placeholder="XXXX"
              maxLength={4}
            />
          </div>
          <div className="set-time">
            <label>Set Time:</label>
            <input
              type="text"
              value={timeInput}
              placeholder="hr:mm:ss"
              onChange={(e) => setTimeInput(e.target.value)}
            />
          </div>
          <div className="timer-display">
            <p>Time Remaining: {formatTime(timeRemaining)}</p>
          </div>
        </header>

        <section className="add-item-section">
          <h2>Add Item:</h2>
          <input
            value={newItem}
            type="text"
            placeholder="Item Name"
            onChange={(e) => setNewItem(e.target.value)}
            aria-label="add new item"
          />
          <button onClick={addItem} aria-label="add item">
            Add Item
          </button>
        </section>
        <section className="item-list">
          <p>Item List:</p>
          {items.length > 0 && (
            <div className="item-carousel">
              <button className="arrow-button" onClick={prevItem}>
                &larr;
              </button>
              <span className="item-display">
                {`Item #${currentIndex + 1}: ${items[currentIndex].name}`}
              </span>
              <button
                className="delete-button"
                data-testid={`delete-button-${currentIndex}`}
                onClick={deleteItem}
              >
                🗑️
              </button>
              <button className="arrow-button" onClick={nextItem}>
                &rarr;
              </button>
            </div>
          )}
        </section>
        <button
          className="start-game-button"
          onClick={() => {
            handleCreateLobby();
            startTimer();
          }}
        >
          Start Game
        </button>
      </div>
      {showInvalidPopup && (
        <PopupWindow
          title="Invalid Input"
          message={
            "Please enter a valid lobby code, add at least one item, and set a valid time!"
          }
          onClose={toggleRulesPopup}
        />
      )}
      <div className="spacer2"></div>
    </>
  );
}

export default HostView;
