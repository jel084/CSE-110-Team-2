import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Routes,
} from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import NotFoundPage from "./pages/ErrorPage/NotFoundPage";
import { PinScreen } from "./pages/pinScreen";
import { CreateGameScreen } from "./pages/createGameScreen";
import { LobbyScreen } from "./pages/lobbyScreen";
import { ScavengeScreen } from "./pages/scavengeScreen";
import { TimeUpScreen } from "./pages/timeUpScreen";
import { WinningScreen } from "./pages/winningScreen";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/pin",
    element: <PinScreen />,
  },
  {
    path: "/creategame",
    element: <CreateGameScreen />,
  },
  {
    path: "/lobby",
    element: <LobbyScreen />,
  },
  {
    path: "/scavenge",
    element: <ScavengeScreen />,
  },
  {
    path: "/timeup",
    element: <TimeUpScreen />,
  },
  {
    path: "/winners",
    element: <WinningScreen />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();
