import React, { useState } from "react";
import "./ImageCheckoff.css";

interface Submission {
  id: number;
  playerName: string;
  itemName: string;
  imageUrl: string;
}

const ImageCheckoff: React.FC = () => {
  const [queue, setQueue] = useState<Submission[]>([
    { id: 1, playerName: "Jane", itemName: "Apple", imageUrl: "/images/apple.jpg" },
    { id: 2, playerName: "John", itemName: "Banana", imageUrl: "/images/banana.jpg" },
    { id: 3, playerName: "Alice", itemName: "Carrot", imageUrl: "/images/carrot.jpg" },
  ]);

  const handleAction = (id: number, points: number) => {
    // Handle awarding points (update state/backend as needed)
    console.log(`Player with submission ID ${id} awarded ${points} points`);
    setQueue((prevQueue) => prevQueue.filter((submission) => submission.id !== id));
  };

  return (
    <div className="image-checkoff-page">
      <div className="top-bar">Image Checkoff</div>
      <div className="image-checkoff">
        {queue.length > 0 ? (
          <div className="submission">
            <img src={queue[0].imageUrl} alt={queue[0].itemName} className="submission-image" />
            <div className="submission-info">
              <h2>{queue[0].playerName}</h2>
              <p>Submitted: {queue[0].itemName}</p>
              <div className="action-buttons">
                <button
                  className="confirm-button"
                  onClick={() => handleAction(queue[0].id, 10)}
                >
                  Confirm
                </button>
                <button
                  className="deny-button"
                  onClick={() => handleAction(queue[0].id, 0)}
                >
                  Deny
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="empty-queue">No submissions in the queue.</p>
        )}
      </div>
      <div className="bottom-bar">Manage Submissions</div>
    </div>
  );
};

export default ImageCheckoff;