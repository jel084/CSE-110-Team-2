import { Link } from "react-router-dom";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h1 className="not-found-page__title">404 Not Found</h1>
      <Link to="/">
        <button>Go back to home page</button>
      </Link>
    </div>
  );
}