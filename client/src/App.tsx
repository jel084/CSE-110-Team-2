import React from 'react';
import { AppProvider } from './context/AppContext';
import { ScavengerApp } from './ScavengerApp';
import './App.css';
import ScoreScreen from './pages/scoreScreen';

const App = () => {
  return (
    <AppProvider>
      <ScoreScreen />
    </AppProvider>
  );
};

export default App;
