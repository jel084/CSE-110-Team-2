import { Link } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="background-image">
      <div className="game-title">
        <h1 className="game-title-text">Scavenger Hunt</h1>
      </div>
      <div className="mainPage-button-container">
        <Link to="/creategame">
          <button className="homepage-button">Create Game</button>
        </Link>
        <Link to="/pin">
          <button className="homepage-button">Join Game</button>
        </Link>
      </div>
    </div>
  );
}