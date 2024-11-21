import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HostView from './pages/CreateGamePage/HostView';
import PinPage from './pages/PinPage/PinPage';
import ScavengeScreen from './pages/ScavengerPage/scavengeScreen';
import LobbyPage from './pages/LobbyPage/LobbyPage';  // Import the LobbyPage
import HomePage from './pages/HomePage/HomePage';
import ScoreScreen from './pages/WinningPage/scoreScreen';

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} /> 
        <Route path="/pin" element={<PinPage />} />
        <Route path="/creategame" element={<HostView />} />
        <Route path="/lobby/:lobbyId" element={<LobbyPage />} /> 
        <Route path="/scavenge/:lobbyId/:userId" element={<ScavengeScreen />} />
        <Route path="/winners" element={<ScoreScreen />} />
      </Routes>
  );
}

export default App;
