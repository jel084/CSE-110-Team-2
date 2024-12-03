import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './scoreScreen.css';
import { useNavigate } from 'react-router-dom';

interface Player {
  id: string;
  points: number;
}

const ScoreScreen: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get the lobbyId dynamically or use a hardcoded one for now
  const lobbyId = '1';

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/lobbies/${lobbyId}/score`);
        
        // Make sure the response contains the expected structure
        if (response.data && Array.isArray(response.data.players)) {
          setPlayers(response.data.players);
        } else {
          throw new Error('Unexpected response format');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching scores:', error);
        setError('Failed to load player scores. Please try again later.');
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [lobbyId]);

  const handleSaveResults = async () => {
    try {
      await axios.post(`http://localhost:8080/api/lobbies/${lobbyId}/saveScores`, {
        players
      });
      setSuccessMessage('Scores saved successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Error saving scores:', error);
      setError('Failed to save scores. Please try again later.');
    }
  };

  if (loading) {
    return <div>Loading scores...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Sort players by points in descending order
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  const handleJoinNewGame = () => {
    navigate(`/pin`); // Navigate to the lobby page
};

  return (
    <div className="scoreboard">
      <div className="scoreboard-header">
        {sortedPlayers.length > 0 ? (
          <h1>🎉 {sortedPlayers[0].id} got 1st place! 🎉</h1>
        ) : (
          <h1>No players found</h1>
        )}
      </div>
      <div className="score-list">
        {sortedPlayers.map((player, index) => (
          <div key={player.id} className={`score-item position-${index + 1}`}>
            <span className="position">{index + 1}</span>
            <span className="name">{player.id}</span>
            <span className="points">{player.points}</span>
          </div>
        ))}
      </div>
      <div className="scoreboard-footer">
        <button className="action-button" onClick={handleJoinNewGame}>Join New Game</button>
        <button className="action-button" onClick={handleSaveResults}>
          Save Results
        </button>
        {successMessage && <div className="success-message">{successMessage}</div>}
      </div>
    </div>
  );
};

export default ScoreScreen;
