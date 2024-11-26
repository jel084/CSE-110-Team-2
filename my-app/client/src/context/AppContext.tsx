import { createContext, useState } from "react";
import { Item, Player } from "../types/types";
import { testItems } from "../constants/constants";

interface AppContextType {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  lobbyId: number | null; // Added lobbyId to track current lobby
  setLobbyId: React.Dispatch<React.SetStateAction<number | null>>;
}

// Properly define initialState here before it is used
const initialState: AppContextType = {
  items: testItems,
  setItems: () => {},
  players: [],
  setPlayers: () => {},
  lobbyId: null,
  setLobbyId: () => {},
};

// Ensure AppContext is created with initialState correctly
export const AppContext = createContext<AppContextType>(initialState);

export const AppProvider = (props: any) => {
  const [items, setItems] = useState<Item[]>(initialState.items);
  const [players, setPlayers] = useState<Player[]>(initialState.players);
  const [lobbyId, setLobbyId] = useState<number | null>(initialState.lobbyId);

  return (
    <AppContext.Provider
      value={{
        items,
        setItems,
        players,
        setPlayers,
        lobbyId,
        setLobbyId,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
