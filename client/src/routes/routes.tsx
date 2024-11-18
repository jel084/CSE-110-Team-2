import { ROUTES } from "../constants/routes";
import React from "react";
import {testItems} from "../constants/constants";
import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";
import NotFoundPage from "../pages/ErrorPage/NotFoundPage";
import PinPage from "../pages/PinPage/PinPage";
import CreateGamePage from "../pages/CreateGamePage/hostview";
import LobbyPage from "../pages/LobbyPage/LobbyPage";
import TimeUpPage from "../pages/TimeUpPage/TimeUpPage";
import WinningPage from "../pages/WinningPage/scoreScreen";
import ScavengerPage from "../pages/ScavengerPage/scavengeScreen";

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <HomePage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: ROUTES.PIN,
    element: <PinPage />,
  },
  {
    path: ROUTES.CREATE_GAME,
    element: <CreateGamePage />,
  },
  {
    path: ROUTES.LOBBY,
    element: <LobbyPage />,
  },
  {
    path: ROUTES.SCAVENGE,
    element: <ScavengerPage name={'player1'} points={0} items={testItems} />,
  },
  {
    path: ROUTES.TIMEUP,
    element: <TimeUpPage />,
  },
  {
    path: ROUTES.WINNERS,
    element: <WinningPage />,
  },
]);
