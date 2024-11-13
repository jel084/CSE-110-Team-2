import ScavengeScreen from './pages/scavengeScreen';
import { testItems } from './constants/constants';


export const ScavengerApp = () => {
    return (
        <div className = "Placeholder Page">
            <ScavengeScreen name={'player1'} points={0} items={testItems} />
        </div>
    );
};