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

      const lobbyResponse = await fetch(`http://localhost:8080/api/lobbies/pin/${lobbyCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!lobbyResponse.ok) {
        throw new Error('Lobby not found with the given PIN');
      }

      const lobbyData = await lobbyResponse.json();
      const lobbyId = lobbyData.lobbyId;

     const joinResponse = await fetch('http://localhost:8080/api/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lobbyId: lobbyId,
          userId: userId,
          pin: lobbyCode,
        }),
      });

      const joinData = await joinResponse.json();

      if (joinResponse.ok) {
        setShowError(false);
        setShowSuccess(true);

        if (joinData.lobbyId) {
          navigate(`/lobby/${joinData.lobbyId}/${userId}`);
        }
      } else {
        setShowError(true);
        console.error(joinData.error);
      }
    } catch (error) {
      setShowError(true);
      console.error('Error joining the game:', error);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <>
      <div className="spacer">
        {showSuccess && (
          <div className="success-popup">
            <div className="success-popup-content">
              <p>Successfully joined the lobby!</p>
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