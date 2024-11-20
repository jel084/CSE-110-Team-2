import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HostView from './HostView';
import PinPage from './PinPage';
import ScavengeScreen from './scavengeScreen';
import LobbyPage from './LobbyPage';  // Import the LobbyPage

function App() {
  return (

      <Routes>
        <Route path="/" element={<PinPage />} /> 
        <Route path="/join" element={<PinPage />} />
        <Route path="/host" element={<HostView />} />
        <Route path="/lobby/:lobbyId" element={<LobbyPage />} /> 
        <Route path="/scavenge/:lobbyId/:userId" element={<ScavengeScreen />} />
      </Routes>
  );
}

export default App;
