import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HostView from './HostView';
import PinPage from './PinPage';
import ScavengeScreen from './scavengeScreen';
import LobbyPage from './LobbyPage';  
import ScoreScreen from './scoreScreen';
import HomePage from './HomePage';

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pin" element={<PinPage />} />
        <Route path="/creategame" element={<HostView />} />
        <Route path="/lobby/:lobbyId" element={<LobbyPage />} /> 
        <Route path="/scavenge/:lobbyId/:userId" element={<ScavengeScreen />} />
        <Route path="/score/:lobbyId" element={<ScoreScreen />} />
      </Routes>

  );
}

export default App;
