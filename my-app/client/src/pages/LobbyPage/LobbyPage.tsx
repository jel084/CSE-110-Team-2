import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./LobbyPage.module.css";

export default function LobbyPage() {
    const players = ["Player 1", "Player 2", "Player 3", "Player 4", "You", "Player 6", "Player 7"];
    const [timer, setTimer] = useState(15);
    const { lobbyId, userId } = useParams<{ lobbyId: string; userId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(interval);
                    handleNavigateToScavenge();
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [navigate]);

    const handleNavigateToScavenge = () => {
        if (lobbyId !== null && userId) {
          navigate(`/scavenge/${lobbyId}/${userId}`);
        }
      };
      return (
        <div className={styles.lobbyBackground}>
            <div className={styles.lobbySpacer}></div>
            <div className={styles.lobbyHeader}>
                <h1>Players: {players.length}</h1>
                <h1>Starts in: {timer}</h1>
            </div>
            <div className={styles.lobbyPlayersGrid}>
                {players.map((player, index) => (
                    <div key={index} className={styles.lobbyPlayerBox} data-testid="player-box">
                        {player}
                    </div>
                ))}
            </div>
        </div>
    );
}
