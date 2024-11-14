import { Link } from "react-router-dom";

export default function CreateGamePage() {
  return (
    <>
      <h1>This is the CreateGamePage</h1>
      <Link to="/lobby">Start Game</Link>
    </>
  );
}
