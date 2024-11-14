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
import PinScreen from "./pages/PinPage/PinPage";
import CreateGamePage from "./pages/CreateGamePage/CreateGamePage";
import LobbyPage from "./pages/LobbyPage/LobbyPage";
import ScavengeScreen from "./pages/ScavengerPage.tsx/ScavengerPage";
import TimeUpScreen from "./pages/TimeUpPage/TimeUpPage";
import WinningScreen from "./pages/WinningPage/WinningPage";

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
    element: <CreateGamePage />,
  },
  {
    path: "/lobby",
    element: <LobbyPage />,
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
