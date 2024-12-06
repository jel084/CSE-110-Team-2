import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ImageCheckoff.css";

interface Submission {
  id: number;
  playerName: string;
  itemName: string;
  imageUrl: string;
  lobbyId: number;
  userId: string;
  itemId: number;
}

const ImageCheckoff: React.FC = () => {
  const [queue, setQueue] = useState<Submission[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/lobbies/submissions");

        // Map and construct the correct image URLs for all submissions
        const formattedSubmissions = response.data.submissions.map((submission: any, index: number) => ({
          id: index + 1,
          playerName: submission.userId,
          itemName: submission.itemName || `Item ${submission.itemId}`,
          imageUrl: submission.image ? `http://localhost:8080${submission.image}` : '',
          lobbyId: submission.lobbyId,
          userId: submission.userId,
          itemId: submission.itemId,
        }));

        setQueue(formattedSubmissions);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    fetchSubmissions();
  }, []);

  const handleAction = async (id: number, points: number, approved: boolean) => {
    const currentSubmission = queue[currentIndex];
    try {
      await axios.post('http://localhost:8080/api/lobbies/approveSubmission', {
        lobbyId: currentSubmission.lobbyId,
        userId: currentSubmission.playerName,
        itemId: currentSubmission.itemId,
        points,
        approved,
      });
  
      setQueue((prevQueue) => prevQueue.filter((submission) => submission.id !== currentSubmission.id));
    } catch (error) {
      console.error('Error processing submission:', error);
    }
  };

  const prevSubmission = () => {
    setCurrentIndex((prev) => (prev === 0 ? queue.length - 1 : prev - 1));
  };

  const nextSubmission = () => {
    setCurrentIndex((prev) => (prev === queue.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="image-checkoff-page">
      <div className="top-bar">Image Checkoff</div>
      <div className="image-checkoff">
        {queue.length > 0 ? (
          <div className="submission">
            <div className="arrow-buttons">
              <button className="arrow-button" onClick={prevSubmission}>
                &larr;
              </button>
              <button className="arrow-button" onClick={nextSubmission}>
                &rarr;
              </button>
            </div>
            <img
              src={queue[currentIndex].imageUrl}
              alt={queue[currentIndex].itemName}
              className="submission-image"
              onError={(e) => {
                e.currentTarget.src = "/path/to/default/image.png";
                e.currentTarget.alt = "Image not available";
              }}
            />
            <div className="submission-info">
              <h2>{queue[currentIndex].playerName}</h2>
              <p>Submitted: {queue[currentIndex].itemName}</p>
              <div className="action-buttons">

              <button
                className="confirm-button"
                onClick={() => handleAction(queue[currentIndex].id, 10, true)}
              >
                Confirm
              </button>
              <button
                className="deny-button"
                onClick={() => handleAction(queue[currentIndex].id, 0, false)}
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
