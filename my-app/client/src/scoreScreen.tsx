import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './scoreScreen.css';

interface Player {
  id: string;
  name: string;
  points: number;
}

const ScoreScreen: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const lobbyId = '1'; 

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/lobbies/${lobbyId}/score`);
        setPlayers(response.data.players);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching scores:', error);
        setError('Failed to load player scores. Please try again later.');
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [lobbyId]);

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
        <button className="action-button">Join New Game</button>
        <button className="action-button">Save Results</button>
      </div>
    </div>
  );
};

export default ScoreScreen;
