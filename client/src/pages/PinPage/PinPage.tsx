import { Link } from "react-router-dom";

export default function PinPage() {
  return (
    <>
      <h1>This is the PinPage</h1>
      <Link to="/lobby">Start Game</Link>
    </>
  );
}
