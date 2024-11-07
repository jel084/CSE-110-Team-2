import './App.css';
import { Route, Routes } from 'react-router-dom';
import { StartingScreen } from './pages/startingScreen';
import { PinScreen } from './pages/pinScreen';
import { CreateGameScreen } from './pages/createGameScreen';
import { LobbyScreen } from './pages/lobbyScreen';
import { ScavengeScreen } from './pages/scavengeScreen';
import { TimeUpScreen } from './pages/timeUpScreen';
import { WinningScreen } from './pages/winningScreen';

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartingScreen />} />
      <Route path="/pin" element={<PinScreen />} />
      <Route path="/creategame" element={<CreateGameScreen />} />
      <Route path="/lobby" element={<LobbyScreen />} />
      <Route path="/scavenge" element={<ScavengeScreen />} />
      <Route path="/timeup" element={<TimeUpScreen />} />
      <Route path="/winners" element={<WinningScreen />} />
    </Routes>
  );
}

export default App;