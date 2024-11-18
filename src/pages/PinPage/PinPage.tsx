import React, { useState } from 'react';
import './PinPageStyle.css';

function PinPage() {
  const [lobbyCode, setLobbyCode] = useState('');
  const [showError, setShowError] = useState(false);

  const handleLobbyCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const numericInput = input.replace(/\D/g, '').slice(0, 4); // Limit to 4 digits
    setLobbyCode(numericInput);
  };

  const handleJoinGame = () => {
    if (lobbyCode === '1111') {
      setShowError(true);
    } else {
      console.log('Lobby code is valid. Proceeding to join game...');
      // Add your game joining logic here
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <>
      <div className="spacer"></div>
      <div className="pin-page">
        <header className="header">
          <h1>Enter Lobby Code</h1>
          <div className="lobby-code">
            <input
              type="text"
              value={lobbyCode}
              onChange={handleLobbyCodeChange}
              placeholder="XXXX"
              maxLength={4}
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
            <p>Error: Invalid Lobby Code</p>
            <button onClick={handleCloseError}>OK</button>
          </div>
        </div>
      )}
    </>
  );
}

export default PinPage;
