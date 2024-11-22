import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LobbyPage.css";
import axios from 'axios';

export default function LobbyPage() {
    const { lobbyId } = useParams<{ lobbyId: string }>();
    const [players, setPlayers] = useState<string[]>([]);
    const [timer, setTimer] = useState(15);
    const navigate = useNavigate();

    // Fetch players from backend
    useEffect(() => {
        const fetchPlayers = async () => {
            if (lobbyId) {
                try {
                    const response = await axios.get(`http://localhost:8080/api/lobbies/${lobbyId}/players`);
                    setPlayers(response.data.players);
                } catch (error) {
                    console.error('Error fetching players:', error);
                }
            }
        };
        fetchPlayers();
    }, [lobbyId]);

    // Timer logic
    useEffect(() => {
        if (timer <= 0) {
            // Timer ended, update the backend game status
            const startGame = async () => {
                try {
                    if (lobbyId) {
                        await axios.post(`http://localhost:8080/api/lobbies/${lobbyId}/start`);
                        // Redirect each player to their respective scavenge screen
                        navigate(`/scavenge/${lobbyId}/userId`);  // Replace "userId" dynamically
                    }
                } catch (error) {
                    console.error('Error starting the game:', error);
                }
            };
            startGame();
        } else {
            // Countdown logic
            const interval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [timer, navigate, lobbyId]);

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
