import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getItemsForPlayer } from "../../player-utils";
import { Item } from "../../types/types";
import "./scavengeScreen.css";
import axios from "axios";

const ScavengeScreen: React.FC = () => {
  const { lobbyId, userId } = useParams<{ lobbyId: string; userId: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
          const updatedItems = [...items];
          updatedItems[currentIndex].image = "";
          updatedItems[currentIndex].found = false;
          setItems(updatedItems);
          console.log("Image deleted successfully");
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        setErrorMessage("Failed to delete image. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="spacer">
        <h1>Capture Your Find</h1>
      </div>
      <div className="scavenger-view">
        <header className="header">
          <section className={`item-list`}>
            <p>Item List:</p>
            <div className="item-container">
              {items.length > 0 ? (
                <div
                  className={`item-carousel ${
                    items[currentIndex]?.found ? "found" : ""
                  }`}
                >
                  <button className="arrow-button" onClick={prevItem}>
                    &larr;
                  </button>
                  <span className="item-display">
                    {`Item #${currentIndex + 1}: ${items[currentIndex].name}`}
                  </span>
                  <button className="arrow-button" onClick={nextItem}>
                    &rarr;
                  </button>
                </div>
              ) : (
                <p>{errorMessage || "Loading items..."}</p>
              )}
            </div>
          </section>
          <div className="image-container">
            <label htmlFor="image">Upload Image</label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          {items[currentIndex]?.found && (
            <p className="found-text">Item found!</p>
          )}
        </header>
        <div className="image-preview">
          {items[currentIndex]?.image ? (
            <img
              src={`http://localhost:5000${items[currentIndex].image}`}
              alt="Selected"
            />
          ) : (
            <p>{errorMessage || "No image selected"}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ScavengeScreen;
