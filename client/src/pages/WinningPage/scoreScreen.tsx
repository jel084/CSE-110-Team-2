import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom is used
import { testPlayers } from '../../constants/constants'; // Adjust the path as needed
import { ROUTES } from '../../constants/routes'; // Import the route constants
import './ScoreScreen.css';

const ScoreScreen: React.FC = () => {
    const [showScoreboard, setShowScoreboard] = useState(false); // State to toggle the view
    const [isSaved, setIsSaved] = useState(false); // State to manage Save button
    const navigate = useNavigate(); // React Router's navigation hook

    const sortedPlayers = [...testPlayers].sort((a, b) => b.points - a.points);

    const handleSave = () => {
        setIsSaved(true); // Mark results as saved
    };

    const handleJoinNewGame = () => {
        navigate(ROUTES.PIN); // Navigate to the lobby page
    };

    return (
        <div className="scoreboard">
            {showScoreboard ? (
                // Scoreboard view
                <>
                    <div className="scoreboard-header">
                        <h1>🎉 {sortedPlayers[0].name} got 1st place! 🎉</h1>
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
                        <button className="action-button" onClick={handleJoinNewGame}>
                            Join New Game
                        </button>
                        <button
                            className={`action-button ${isSaved ? 'saved' : ''}`}
                            onClick={handleSave}
                            disabled={isSaved}
                        >
                            {isSaved ? 'Saved!' : 'Save Results'}
                        </button>
                    </div>
                </>
            ) : (
                // Initial "Time is up!" view
                <div className="time-up-screen">
                    <h1>⏰ Time is up! ⏰</h1>
                    <button
                        className="action-button"
                        onClick={() => setShowScoreboard(true)}
                    >
                        View Results
                    </button>
                </div>
            )}
        </div>
    );
};

export default ScoreScreen;
