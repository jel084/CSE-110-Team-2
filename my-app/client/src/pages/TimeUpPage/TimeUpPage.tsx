import { Link } from "react-router-dom";
import "./TimeUpPage.css";

export default function TimeUpPage() {
    return (
      <div className="timeup-container">
        <h1 className="timeup-title">⏳ Time's Up!</h1>
        <Link className="view-results-link" to="/winners">
          View Results
        </Link>
      </div>
    );
  }