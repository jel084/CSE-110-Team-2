import { createContext, useState } from "react";
import { Item, Player } from "./types";
import { testItems } from "./constants";

interface AppContextType {
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
    timer: string;
    setTime: React.Dispatch<React.SetStateAction<string>>;
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    lobbyId: number | null; // Added lobbyId to track current lobby
    setLobbyId: React.Dispatch<React.SetStateAction<number | null>>;
}

// Properly define initialState here before it is used
const initialState: AppContextType = {
    items: testItems,
    setItems: () => {},
    timer: '00:00:00',
    setTime: () => {},
    players: [],
    setPlayers: () => {},
    lobbyId: null,
    setLobbyId: () => {}
};

// Ensure AppContext is created with initialState correctly
export const AppContext = createContext<AppContextType>(initialState);

export const AppProvider = (props: any) => {
    const [items, setItems] = useState<Item[]>(initialState.items);
    const [timer, setTime] = useState<string>(initialState.timer);
    const [players, setPlayers] = useState<Player[]>(initialState.players);
    const [lobbyId, setLobbyId] = useState<number | null>(initialState.lobbyId);

    return (
        <AppContext.Provider
            value={{
                items,
                setItems,
                timer,
                setTime,
                players,
                setPlayers,
                lobbyId,
                setLobbyId
            }}
        >
            {props.children}
        </AppContext.Provider>
    );
};
