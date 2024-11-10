import React from 'react';
import { AppProvider } from './context/AppContext';
import { ScavengerApp } from './ScavengerApp';
import './App.css';

const App = () => {
  return (
    <AppProvider>
      <ScavengerApp />
    </AppProvider>
  );
};

export default App;
