import "./App.css";
import { createBrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import NotFoundPage from "./pages/ErrorPage/NotFoundPage";
import { PinScreen } from "./pages/PinPage/PinPage";
import { CreateGameScreen } from "./pages/CreateGamePage/CreateGamePage";
import { LobbyScreen } from "./pages/LobbyPage/LobbyPage";
import { ScavengeScreen } from "./pages/ScavengerPage.tsx/ScavengerPage";
import { TimeUpScreen } from "./pages/TimeUpPage/TimeUpPage";
import { WinningScreen } from "./pages/WinningPage/WinningPage";

function App() {
  return (
    <Routes>
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
