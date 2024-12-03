import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PopupWindow from "../PopupWindow/PopupWindow";
import "./GoBackButton.css";

interface GoBackButtonProps {
  to?: string; // Optional prop to specify the target route (defaults to '/')
  popupConfig?: {
    title: string;
    message: string;
    showConfirmButtons: boolean;
    onConfirm?: () => void;
  };
}

const GoBackButton: React.FC<GoBackButtonProps> = ({
  to = "/",
  popupConfig,
}) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const handleTogglePopup = () => setShowPopup((prev) => !prev);

  const handleConfirm = () => {
    setShowPopup(false);
    if (popupConfig?.onConfirm) {
      popupConfig.onConfirm();
    } else {
      navigate(to);
    }
  };

  return (
    <>
      <button
        className="goBackButton"
        onClick={popupConfig ? handleTogglePopup : () => navigate(to)}
      >
        <box-icon name="home" color="white" size="md"></box-icon>
      </button>

      {showPopup && popupConfig && (
        <PopupWindow
          title={popupConfig.title}
          message={popupConfig.message}
          onClose={handleTogglePopup}
          onConfirm={handleConfirm}
          showConfirmButtons={popupConfig.showConfirmButtons}
        />
      )}
    </>
  );
};

export default GoBackButton;
