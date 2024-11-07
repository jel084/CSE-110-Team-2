import { Link } from "react-router-dom";

export function CreateGameScreen(){
    return (
        <>
            <h1>This is the CreateGameScreen</h1>
            <Link to="/lobby">Start Game</Link>

        </>
    )
}