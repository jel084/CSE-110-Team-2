import React from "react";
import "./PopupWindow.css";

interface PopupWindowProps {
  title: string; // Title of the popup
  message: string; // Message to display in the popup
  onClose: () => void; // Callback to close the popup
}

const PopupWindow: React.FC<PopupWindowProps> = ({
  title,
  message,
  onClose,
}) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="popup-title">{title}</h2>
        <p className="popup-message">{message}</p>
      </div>
    </div>
  );
};

export default PopupWindow;
