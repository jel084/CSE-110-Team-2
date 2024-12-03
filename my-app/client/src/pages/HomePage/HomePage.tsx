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
            "1. Players must complete tasks in a given time.\n" +
            "2. Teams must collect all required items to win.\n" +
            "3. Each task has a hint for the next step.\n" +
            "4. The first team to finish wins!"
          }
          onClose={toggleRulesPopup}
        />
      )}
    </div>
  );
}
