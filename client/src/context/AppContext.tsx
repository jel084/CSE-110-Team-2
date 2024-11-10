import {createContext, useState} from "react";


interface AppContextType {
    items: string[];
    setItems: React.Dispatch<React.SetStateAction<string[]>>;
    timer: string;
    setTime: React.Dispatch<React.SetStateAction<string>>;
}


const initialState: AppContextType = {
    items: [],
    setItems: () => {},
    timer: '00:00:00',
    setTime: () => {}
}

export const AppContext = createContext<AppContextType>(initialState);

export const AppProvider = (props: any) => {
    const [items, setItems] = useState<string[]>(initialState.items);
    const [timer, setTime] = useState<string>(initialState.timer);

    return (
        <AppContext.Provider
            value={{
                items: items,
                timer: timer,
                setItems: setItems,
                setTime: setTime
            }}
        >
            {props.children}
        </AppContext.Provider>
    );
};