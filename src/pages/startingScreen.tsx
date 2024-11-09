import { Link } from "react-router-dom";

export function StartingScreen(){
    return (
        <>
            <h1>This is the startingScreen</h1>
            <Link to="/creategame">Create Game</Link>
            <Link to="/pin">Join Game</Link>
        </>
    );
}