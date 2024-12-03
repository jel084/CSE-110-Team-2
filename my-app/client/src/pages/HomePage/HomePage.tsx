import { Link } from "react-router-dom";
import React, { useState } from "react";
import "./HomePage.css";
import questionIcon from "./icons_question.png";
import PopupWindow from "../../components/PopupWindow/PopupWindow";

export default function HomePage() {
  const [showRules, setShowRules] = useState(false);

  const toggleRulesPopup = () => {
    setShowRules((prev) => !prev);
  };

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
      {/* Question Button */}
      <button className="question-button" onClick={toggleRulesPopup}>
        <img src={questionIcon} alt="rule_icon" className="question-icon" />
      </button>

      {/* Rules Popup */}
      {showRules && (
        <PopupWindow
          title="Game Rules"
          message={
            "1. Players must find items host assigned.\n" +
            "2. Players must upload image of item once found.\n" +
            "3. Each item found is worth 10 points.\n" +
            "4. The player with the most points wins!"
          }
          onClose={toggleRulesPopup}
        />
      )}
    </div>
  );
}
