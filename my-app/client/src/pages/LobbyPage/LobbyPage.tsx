import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./LobbyPage.module.css";
import axios from "axios";
import GoBackButton from "../../components/GoBackButton/GoBackButton";

export default function LobbyPage() {
  const { lobbyId, userId } = useParams<{ lobbyId: string; userId: string }>();
  const [players, setPlayers] = useState<string[]>([]);
  const [timer, setTimer] = useState(15);
  const navigate = useNavigate();

  // Popup window state
  const [showPopup, setShowPopup] = useState(false);

  // Fetch players from backend
  useEffect(() => {
    const fetchPlayers = async () => {
      if (lobbyId) {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/lobbies/${lobbyId}/players`
          );
          setPlayers(response.data.players);
        } catch (error) {
          console.error("Error fetching players:", error);
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
          if (lobbyId && userId) {
            await axios.post(
              `http://localhost:8080/api/lobbies/${lobbyId}/start`
            );
            // Redirect each player to their respective scavenge screen
            navigate(`/scavenge/${lobbyId}/${userId}`); // Replace "userId" dynamically
          }
        } catch (error) {
          console.error("Error starting the game:", error);
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

  const returnToHome = async () => {
    if (lobbyId && userId) {
      try {
        const response = await axios.post(
          `http://localhost:8080/api/lobbies/${lobbyId}/${userId}/leave`
        );
        console.log("Left lobby:", response.data);
        navigate("/");
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    }
  };

  return (
    <div className={styles.lobbyBackground}>
      <GoBackButton
        popupConfig={{
          title: "Leave Lobby",
          message:
            "Are you sure you want to leave the lobby? You will be removed from the lobby",
          showConfirmButtons: true,
          onConfirm: returnToHome,
        }}
      />
      <div className={styles.lobbySpacer}></div>
      <div className={styles.lobbyHeader}>
        <h1>Players: {players.length}</h1>
        <h1>Starts in: {timer}</h1>
      </div>
      <div className={styles.lobbyPlayersGrid}>
        {players.map((player, index) => (
          <div
            key={index}
            className={styles.lobbyPlayerBox}
            data-testid="player-box"
          >
            {player}
          </div>
        ))}
      </div>
    </div>
  );
}
