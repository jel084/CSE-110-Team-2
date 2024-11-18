import { Link } from "react-router-dom";
import "./LobbyPage.css";


export default function LobbyPage() {
    const players = ["Player 1", "Player 2", "Player 3", "Player 4", "You", "Player 6", "Player 7"];

    return (
        <div className="lobby-background">
            <div className="lobby-spacer"></div>
            <div className="lobby-header">
                <h1>Players: {players.length}</h1>
                <h1>Starts in: __</h1>
            </div>
            <div className="lobby-players-grid">
                {players.map((player, index) => (
                    <div key={index} className="lobby-player-box" data-testid="player-box">
                        {player}
                    </div>
                ))}
            </div>
            <Link to="/scavenge" className="lobby-start-link">Start</Link>
        </div>
    );
}