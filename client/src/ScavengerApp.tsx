import ScavengeScreen from './pages/scavengeScreen';
import { getItems } from './utils/player-utils';
import { Player } from './types/types';
import { useContext, useEffect } from "react";
import { AppContext } from './context/AppContext';

export const ScavengerApp = () => {
    // Test player
    const name = 'playerA';
    const { players, setPlayers } = useContext(AppContext);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
          const items = await getItems(name);
          setPlayers([{name: name, points: 0, items: items}]);

        } catch (err: any) {
          console.log(err.message);
        }
    };

    return (
        <div className = "Placeholder Page">
            {players.map((player: Player) => (
                <ScavengeScreen name={player.name} points={player.points} items={player.items} />
            ))}
        </div>
    );
};