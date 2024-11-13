import {createContext, useState} from "react";
import { Item, Player } from "../types/types";
import { testItems } from "../constants/constants";


interface AppContextType {
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
    timer: string;
    setTime: React.Dispatch<React.SetStateAction<string>>;
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}


const initialState: AppContextType = {
    items: testItems,
    setItems: () => {},
    timer: '00:00:00',
    setTime: () => {},
    players: [],
    setPlayers: () => {}
}

export const AppContext = createContext<AppContextType>(initialState);

export const AppProvider = (props: any) => {
    const [items, setItems] = useState<Item[]>(initialState.items);
    const [timer, setTime] = useState<string>(initialState.timer);
    const [players, setPlayers] = useState<Player[]>(initialState.players);

    return (
        <AppContext.Provider
            value={{
                items: items,
                timer: timer,
                setItems: setItems,
                setTime: setTime,
                players: players,
                setPlayers: setPlayers
            }}
        >
            {props.children}
        </AppContext.Provider>
    );
};