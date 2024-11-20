import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HostView from './pages/CreateGamePage/HostView';
import PinPage from './pages/PinPage/PinPage';
import ScavengeScreen from './pages/ScavengerPage/scavengeScreen';  // Import ScavengeScreen

function App() {
  return (
  
      <Routes>
        <Route path="/pin" element={<PinPage />} />
        <Route path="/creategame" element={<HostView />} />
        <Route path="/scavenge/:lobbyId/:userId" element={<ScavengeScreen />} />  {/* New ScavengeScreen route */}
      </Routes>
  
  );
}

export default App;
