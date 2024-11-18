import React from 'react';
import { AppProvider } from './context/AppContext';
import { ScavengerApp } from './ScavengerApp';
import './App.css';
import ScoreScreen from './pages/WinningPage/scoreScreen';
import HomePage from './pages/HomePage/HomePage';

const App = () => {
  return (
    <AppProvider>
      <HomePage />
    </AppProvider>
  );
};

export default App;
