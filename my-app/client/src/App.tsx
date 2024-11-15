import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HostView from './HostView';
import PinPage from './PinPage'; 

function App() {
  return (
  
      <Routes>
        <Route path="/join" element={<PinPage />} />
        <Route path="/host" element={<HostView />} />
      </Routes>
  
  );
}

export default App;
