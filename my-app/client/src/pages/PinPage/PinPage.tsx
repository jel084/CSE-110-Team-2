import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PinPageStyle.css';

function PinPage() {
  const [lobbyCode, setLobbyCode] = useState('');
  const [userId, setUserId] = useState('');
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lobbyId, setLobbyId] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleLobbyCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const numericInput = input.replace(/\D/g, '').slice(0, 4);
    setLobbyCode(numericInput);
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };

  const handleJoinGame = async () => {
    if (!userId || !lobbyCode) {
      setShowError(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lobbyId: 1, 
          userId: userId,
          pin: lobbyCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowError(false);
        setLobbyId(1);  
        setShowSuccess(true);
      } else {
        setShowError(true);
        console.error(data.error);
      }
    } catch (error) {
      setShowError(true);
      console.error('Error joining the game:', error);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleNavigateToScavenge = () => {
    if (lobbyId !== null && userId) {
      navigate(`/scavenge/${lobbyId}/${userId}`);
    }
  };

  return (
    <>
      <div className="spacer">
      {showSuccess && (
        <div className="success-popup">
          <div className="success-popup-content">
            <p>Successfully joined the lobby!</p>
            <button onClick={handleNavigateToScavenge}>Proceed to Scavenge</button>
          </div>
        </div>
      )}
      </div>
      <div className="pin-page">
        <header className="header">
          <h1>Enter Lobby Code</h1>
          <div className="input-container">
            <input
              type="text"
              className="input-box"
              value={lobbyCode}
              onChange={handleLobbyCodeChange}
              placeholder="Lobby PIN"
              maxLength={4}
            />
            <input
              type="text"
              className="input-box"
              value={userId}
              onChange={handleUserIdChange}
              placeholder="Player Name"
            />
          </div>
        </header>
        <button className="start-game-button" onClick={handleJoinGame}>
          Join Game
        </button>
      </div>
      <div className="spacer2"></div>

      {showError && (
        <div className="error-popup">
          <div className="error-popup-content">
            <p>Error: Invalid Lobby Code or User ID</p>
            <button onClick={handleCloseError}>OK</button>
          </div>
        </div>
      )}

      
    </>
  );
}

export default PinPage;
