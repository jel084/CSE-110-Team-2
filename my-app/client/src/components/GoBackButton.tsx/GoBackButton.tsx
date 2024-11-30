import React from "react";
import { useNavigate } from "react-router-dom";
import "./GoBackButton.css"; // Create a CSS file for styling

interface GoBackButtonProps {
  to?: string; // Optional prop to specify the target route (defaults to '/')
}

const GoBackButton: React.FC<GoBackButtonProps> = ({ to = "/" }) => {
  const navigate = useNavigate();

  return (
    <button className="goBackButton" onClick={() => navigate(to)}>
      <box-icon name="home" color="white" size="md"></box-icon>
    </button>
  );
};

export default GoBackButton;
