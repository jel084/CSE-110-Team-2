import React from 'react';
import { testPlayers } from '../../constants/constants'; // Adjust the path as needed
import './scoreScreen.css';

const ScoreScreen: React.FC = () => {
    const sortedPlayers = [...testPlayers].sort((a, b) => b.points - a.points);

    return (
        <div className="scoreboard">
            <div className="scoreboard-header">
                <h1>🎉 {sortedPlayers[0]['name']} got 1st place! 🎉</h1>
            </div>
            <div className="score-list">
                {sortedPlayers.map((player, index) => (
                    <div key={player.name} className={`score-item position-${index + 1}`}>
                        <span className="position">{index + 1}</span>
                        <span className="name">{player.name}</span>
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
