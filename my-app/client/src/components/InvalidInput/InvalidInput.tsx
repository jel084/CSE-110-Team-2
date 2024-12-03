import React from "react";
import "../PopupWindow/PopupWindow.css";

interface InvalidInputPopupProps {
  message: string; // Message to display in the popup
  onClose: () => void; // Callback to close the popup
}

const InvalidInputPopup: React.FC<InvalidInputPopupProps> = ({
  message,
  onClose,
}) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="popup-title">Invalid Input</h2>
        <p className="popup-message">{message}</p>
      </div>
    </div>
  );
};

export default InvalidInputPopup;
