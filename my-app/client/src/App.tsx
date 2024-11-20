import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HostView from './HostView';
import PinPage from './PinPage';
import ScavengeScreen from './scavengeScreen';  // Import ScavengeScreen

function App() {
  return (
  
      <Routes>
        <Route path="/join" element={<PinPage />} />
        <Route path="/host" element={<HostView />} />
        <Route path="/scavenge/:lobbyId/:userId" element={<ScavengeScreen />} />  {/* New ScavengeScreen route */}
      </Routes>
  
  );
}

export default App;
