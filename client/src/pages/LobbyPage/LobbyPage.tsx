import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LobbyPage.css";

export default function LobbyPage() {
    const players = ["Player 1", "Player 2", "Player 3", "Player 4", "You", "Player 6", "Player 7"];
    const [timer, setTimer] = useState(15);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(interval);
                    navigate("/scavenge");
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <div className="lobby-background">
            <div className="lobby-spacer"></div>
            <div className="lobby-header">
                <h1>Players: {players.length}</h1>
                <h1>Starts in: {timer}</h1>
            </div>
            <div className="lobby-players-grid">
                {players.map((player, index) => (
                    <div key={index} className="lobby-player-box" data-testid="player-box">
                        {player}
                    </div>
                ))}
            </div>
        </div>
    );
}
