import React from "react";
import { useNavigate } from "react-router-dom";
import "./GoBackButton.css";

interface GoBackButtonProps {
  to?: string; // Optional prop to specify the target route (defaults to '/')
  onClick?: () => void; // Optional custom click handler
}

const GoBackButton: React.FC<GoBackButtonProps> = ({ to = "/", onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(); // Trigger the custom click handler if provided
    } else {
      navigate(to); // Otherwise, navigate to the specified route
    }
  };

  return (
    <button className="goBackButton" onClick={handleClick}>
      <box-icon name="home" color="white" size="md"></box-icon>
    </button>
  );
};

export default GoBackButton;
