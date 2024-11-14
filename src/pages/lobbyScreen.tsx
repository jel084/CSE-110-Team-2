import "./lobbyScreen.css";
import { Link } from "react-router-dom";

function LobbyScreen() {
    const players = ["Player 1", "Player 2", "Player 3", "Player 4", "You", "Player 6", "Player 7"];

    return (
        <div className="background">
            <div className="spacer"></div>
            <div className="header">
                <h1>Players: {players.length}</h1>
                <h1>Game starts in:</h1>
            </div>
            <div className="players-grid">
                {players.map((player, index) => (
                    <div key={index} className="player-box" data-testid="player-box">
                        {player}
                    </div>
                ))}
            </div>
            <Link to="/scavenge" className="start-link">Start</Link>
        </div>
    );
}

export default LobbyScreen;
