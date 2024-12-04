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
  const [showScoreboard, setShowScoreboard] = useState(false); // Toggle view for "Time is up!"
  const [isSaved, setIsSaved] = useState(false); // Manage Save button state
  const navigate = useNavigate();

  const lobbyId = '1'; // Replace with dynamic lobbyId if available

  useEffect(() => {
    if (!showScoreboard) return; // Fetch data only when transitioning to the scoreboard
    const fetchPlayers = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/lobbies/${lobbyId}/score`);
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
  }, [showScoreboard, lobbyId]);

  const handleSaveResults = async () => {
    const resultsText = players
      .map((player) => `${player.id}: ${player.points}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(resultsText);
      setIsSaved(true);
    } catch (error) {
      console.error('Failed to copy results to clipboard', error);
    }
  };

  const handleJoinNewGame = () => {
    navigate(`/pin`);
  };

  if (!showScoreboard) {
    return (
      <div className="time-up-screen">
        <h1>⏰ Time is up! ⏰</h1>
        <button
          className="action-button"
          onClick={() => setShowScoreboard(true)}
        >
          View Results
        </button>
      </div>
    );
  }

  if (loading) {
    return <div>Loading scores...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Sort players by points in descending order
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

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
        <button className="action-button" onClick={handleJoinNewGame}>
          Join New Game
        </button>
        <button
          className={`action-button ${isSaved ? 'saved' : ''}`}
          onClick={handleSaveResults}
          disabled={isSaved}
        >
          {isSaved ? 'Saved!' : 'Save Results'}
        </button>
      </div>
    </div>
  );
};

export default ScoreScreen;
