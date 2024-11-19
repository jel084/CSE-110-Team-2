import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PinPageStyles.module.css';  

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
      <div className={styles.spacer}>
      {showSuccess && (
        <div className={styles.successPopup}>
          <div className={styles.successPopupContent}>
            <p>Successfully joined the lobby!</p>
            <button onClick={handleNavigateToScavenge}>Proceed to Scavenge</button>
          </div>
        </div>
      )}
      </div>
      <div className={styles.pinPage}>
        <header className={styles.header}>
          <h1>Enter Lobby Code</h1>
          <div className={styles.inputContainer}>
            <input
              type="text"
              className= {styles.inputBox}
              value={lobbyCode}
              onChange={handleLobbyCodeChange}
              placeholder="Lobby PIN"
              maxLength={4}
            />
            <input
              type="text"
              className= {styles.inputBox}
              value={userId}
              onChange={handleUserIdChange}
              placeholder="Player Name"
            />
          </div>
        </header>
        <button className= {styles.startGameButton} onClick={handleJoinGame}>
          Join Game
        </button>
      </div>
      <div className= {styles.spacer2}></div>

      {showError && (
        <div className= {styles.errorPopup}>
          <div className={styles.errorPopupContent}>
            <p>Error: Invalid Lobby Code or User ID</p>
            <button onClick={handleCloseError}>OK</button>
          </div>
        </div>
      )}

      
    </>
  );
}

export default PinPage;