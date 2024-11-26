import { Link } from "react-router-dom";
import React, { useState } from "react";
import "./HomePage.css";

// import questionIcon from "./icons_question.png";

export default function HomePage() {
  const [showRules, setShowRules] = useState(false);

  const toggleRulesPopup = () => {
    setShowRules((prev) => !prev);
  };

  return (
    <div className="background-image">
      {/* Game Title */}
      <div className="game-title">
        <h1 className="game-title-text">Scavenger Hunt</h1>
      </div>

      {/* Home Button */}
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
        {/* <img src={questionIcon} alt="rule_icon" className="question-icon" /> */}
        <img
          src="./icons_question.png"
          alt="rule_icon"
          className="question-icon"
        />
      </button>

      {/* Rules Popup */}
      {showRules && (
        <div className="rules-popup">
          <div className="popup-content">
            <button className="close-button" onClick={toggleRulesPopup}>
              &times;
            </button>
            <h2 className="rules-title">Game Rules</h2>
            <p className="rules-text">
              1. Players must complete tasks in a given time.
              <br />
              2. Teams must collect all required items to win.
              <br />
              3. Each task has a hint for the next step.
              <br />
              4. The first team to finish wins!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
