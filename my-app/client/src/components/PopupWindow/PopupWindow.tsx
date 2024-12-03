import React from "react";
import "./PopupWindow.css";

interface PopupWindowProps {
  title: string; // Title of the popup
  message: string | string[]; // Message to display in the popup
  onClose: () => void; // Callback to close the popup
  onConfirm?: () => void; // Optional confirm callback
  showConfirmButtons?: boolean; // Controls whether Yes/No buttons are shown
}

const PopupWindow: React.FC<PopupWindowProps> = ({
  title,
  message,
  onClose,
  onConfirm,
  showConfirmButtons = false, // Default to false
}) => {
  const formattedMessage =
    typeof message === "string" ? message.split("\n") : message;
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="popup-title">{title}</h2>
        <p className="popup-message">
          {formattedMessage.map((line, index) => (
            <span key={index}>
              {line}
              <br />
            </span>
          ))}
        </p>
        {showConfirmButtons && (
          <div className="popup-actions">
            <button className="confirm-button" onClick={onConfirm}>
              Yes
            </button>
            <button className="cancel-button" onClick={onClose}>
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupWindow;
