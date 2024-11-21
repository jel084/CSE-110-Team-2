import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { getItemsForPlayer } from "../../player-utils";
import { Item } from "../../types/types";
import "./scavengeScreen.css";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const ScavengeScreen: React.FC = () => {
  const { lobbyId, userId } = useParams<{ lobbyId: string; userId: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { timer } = useContext(AppContext);

  useEffect(() => {
    if (lobbyId && userId) {
      const fetchItems = async () => {
        try {
          const fetchedItems = await getItemsForPlayer(
            parseInt(lobbyId),
            userId
          );
          console.log("Fetched items:", fetchedItems);
          if (Array.isArray(fetchedItems)) {
            setItems(fetchedItems);
          } else {
            setErrorMessage("Failed to load items. Please try again.");
          }
        } catch (error) {
          console.error("Error fetching items:", error);
          setErrorMessage("Error loading items. Please try again.");
        }
      };
      fetchItems();
    }
  }, [lobbyId, userId]);

  const prevItem = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  const nextItem = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
    console.log(currentIndex);
  };

  const handleImageChange = async ( event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && lobbyId && userId && items[currentIndex]) {
      const validImageTypes = ["image/jpeg", "image/png"];
      if (!validImageTypes.includes(file.type)) {
        setErrorMessage("Invalid file type. Please select jpg or png.");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("lobbyId", lobbyId);
        formData.append("userId", userId);
        formData.append("itemId", items[currentIndex].id.toString());

        const response = await axios.put(
          `http://localhost:5000/api/lobbies/${lobbyId}/players/${userId}/items/${items[currentIndex].id}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200) {
          const updatedItems = [...items];
          updatedItems[currentIndex].found = true;
          updatedItems[currentIndex].image = response.data.item.image;
          setItems(updatedItems);
          setErrorMessage(null);
          console.log("Item marked as found successfully");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        //NOT WORKING, FIX FOR NEXT COMMIT
        setErrorMessage("Failed to upload image. Please try again.");
      }
    }
  };

  const handleDeleteImage = async () => {
    if (lobbyId && userId && items[currentIndex]?.image) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/api/lobbies/${lobbyId}/players/${userId}/items/${items[currentIndex].id}/deleteImage`
        );

        if (response.status === 200) {
          console.log("Image deleted successfully");
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        //NOT WORKING, FIX FOR NEXT COMMIT
        setErrorMessage("No image selected.");
      }
    }
  };


  const deleteImage = () => {
    handleDeleteImage();
    const updatedItems = [...items];
    updatedItems[currentIndex].image = undefined;
    updatedItems[currentIndex].found = false;
    setItems(updatedItems);
}

  const allItemsFound = items.every((item) => item.image);

  return (
    <>
      <div className="scavenge-spacer">
        <h1>Capture Your Find</h1>
      </div>
      <div className="scavenger-view">
        <header className="scavenge-header">
          <section className={`scavenge-item-list`}>
            <p>Item List:</p>
            <div className="scavenge-item-container">
              {items.length > 0 && (
                <div
                  className={`scavenge-item-carousel ${
                    items[currentIndex].found ? "found" : ""
                  }`}
                >
                  <button className="scavenge-arrow-button" onClick={prevItem}>
                    &larr;
                  </button>
                  <span className="scavenge-item-display">
                    {`Item #${currentIndex + 1}: ${items[currentIndex].name}`}
                  </span>
                  <button className="scavenge-arrow-button" onClick={nextItem}>
                    &rarr;
                  </button>
                </div>
              )}
            </div>
          </section>
          <div className="scavenge-image-container">
            <label htmlFor="image">Upload Image</label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <button className="scavenge-delete-button" onClick={deleteImage}>
            🗑️
          </button>
          <div className="scavenge-set-time">
            <label>Time Remaining:</label>
            <input type="text" value={timer} placeholder="hr:mm:ss" />
          </div>
        </header>
        <div className="scavenge-image-preview">
          {items[currentIndex]?.image ? (
            <img
              src={`http://localhost:5000${items[currentIndex].image}`}
              alt="Selected"
            />
          ) : (
            <p>{errorMessage || "No image selected"}</p>
          )}
        </div>
        <div className="scavenge-foundText">
          {items.length > 0 && items[currentIndex].found && (
            <p className="scavenge-found-text">Item found!</p>
          )}
        </div>
      </div>

      <div className="scavenge-spacer2">
        <button
          className="scavenge-submit-items-button"
          disabled={!allItemsFound}
        >
          Submit
        </button>
      </div>
    </>
  );
};

export default ScavengeScreen;
