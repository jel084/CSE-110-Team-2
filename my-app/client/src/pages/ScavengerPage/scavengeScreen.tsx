import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getItemsForPlayer } from '../../player-utils';
import { Item } from '../../types/types';
import './scavengeScreen.css';
import axios from 'axios';
import GoBackButton from '../../components/GoBackButton/GoBackButton';

interface ExtendedItem extends Item {
  approvalStatus?: 'waiting' | 'approved' | 'denied' | null;
}

const ScavengeScreen: React.FC = () => {
  const { lobbyId, userId } = useParams<{ lobbyId: string; userId: string }>();
  const [items, setItems] = useState<ExtendedItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(11110);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTime = async () => {
      if (lobbyId) {
        try {
          const response = await axios.get(`http://localhost:8080/api/lobbies/${lobbyId}/gameTime`);
          if (response.data && response.data.gameTime !== undefined) {
            console.log('Fetched time:', response.data);
            setTimeRemaining(response.data.gameTime);
          } else {
            console.error('Error: Invalid game time data received from server.');
          }
        } catch (error) {
          console.error('Error fetching game time:', error);
        }
      }
    };
    fetchTime();
  }, [lobbyId]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      endGame();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          endGame();
          return 0;
        }
        return prev - 1;
      });
      setTime();
    }, 1000);

    const setTime = async () => {
      try {
        console.log(timeRemaining);
        const response = await axios.post(
          `http://localhost:8080/api/lobbies/${lobbyId}/${timeRemaining}/setTime`
        );
        console.log('Time set:', response.data);
      } catch (error) {
        console.error('Error setting time:', error);
      }
    };

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const endGame = async () => {
    if (lobbyId) {
      try {
        const response = await axios.post(`http://localhost:8080/api/lobbies/${lobbyId}/end`);
        console.log('Game ended:', response.data);
      } catch (error) {
        console.error('Error ending the game:', error);
      }
      navigate(`/winners`);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((val) => String(val).padStart(2, '0')).join(':');
  };

  useEffect(() => {
    if (lobbyId && userId) {
      const fetchItems = async () => {
        try {
          const fetchedItems = await getItemsForPlayer(parseInt(lobbyId), userId);
          console.log('Fetched items:', fetchedItems);
          if (Array.isArray(fetchedItems)) {
            const itemsWithApproval: ExtendedItem[] = fetchedItems.map(item => ({
              ...item,
              approvalStatus: item.found ? 'approved' : null
            }));
            setItems(itemsWithApproval);
          } else {
            setErrorMessage('Failed to load items. Please try again.');
          }
        } catch (error) {
          console.error('Error fetching items:', error);
          setErrorMessage('Error loading items. Please try again.');
        }
      };
      fetchItems();
    }
  }, [lobbyId, userId]);

  const prevItem = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
  };

  const nextItem = () => {
    setCurrentIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && lobbyId && userId && items[currentIndex]) {
      const validImageTypes = ['image/jpeg', 'image/png'];
      if (!validImageTypes.includes(file.type)) {
        setErrorMessage('Invalid file type. Please select jpg or png.');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('lobbyId', lobbyId);
        formData.append('userId', userId);
        formData.append('itemId', items[currentIndex].id.toString());

        const response = await axios.put(
          `http://localhost:8080/api/lobbies/${lobbyId}/players/${userId}/items/${items[currentIndex].id}/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.status === 200 && response.data && response.data.item) {
          const updatedItem = response.data.item;
          const updatedItems = [...items];
          updatedItems[currentIndex] = {
            ...updatedItems[currentIndex],
            found: updatedItem.found,
            image: updatedItem.image,
            approvalStatus: 'waiting' // Set status to 'waiting' after image upload
          };
          setItems(updatedItems);
          setErrorMessage(null);
          console.log('Item image uploaded successfully');
        } else {
          setErrorMessage('Failed to upload image. Unexpected response format.');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setErrorMessage('Failed to upload image. Please try again.');
      }
    }
  };

  // Poll for host approval after successful upload
  useEffect(() => {
    let approvalInterval: NodeJS.Timeout;
    if (items[currentIndex]?.approvalStatus === 'waiting') {
      approvalInterval = setInterval(async () => {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/lobbies/${lobbyId}/players/${userId}/items/${items[currentIndex].id}/status`
          );
          if (response.data) {
            const { approved } = response.data;
            const updatedItems = [...items];
            if (approved === 1) {
              updatedItems[currentIndex].approvalStatus = 'approved';
            } else if (approved === -1) {
              updatedItems[currentIndex].approvalStatus = 'denied';
            }
            setItems(updatedItems);
            if (approved !== null) {
              clearInterval(approvalInterval);
            }
          }
        } catch (error) {
          console.error('Error checking approval status:', error);
        }
      }, 3000); 
    }
  
    return () => clearInterval(approvalInterval);
  }, [items, currentIndex, lobbyId, userId]);

  const handleDeleteImage = async () => {
    if (lobbyId && userId && items[currentIndex]?.image) {
      try {
        const response = await axios.delete(
          `http://localhost:8080/api/lobbies/${lobbyId}/players/${userId}/items/${items[currentIndex].id}/deleteImage`
        );

        if (response.status === 200) {
          console.log('Image deleted successfully');
          const updatedItems = [...items];
          updatedItems[currentIndex] = {
            ...updatedItems[currentIndex],
            image: undefined,
            found: false,
            approvalStatus: null
          };
          setItems(updatedItems);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        setErrorMessage('Failed to delete image. Please try again.');
      }
    }
  };

  const allItemsFound = items.every((item) => item.image);
  
  const returnToHome = async () => {
    if (lobbyId && userId) {
      try {
        for(const item of items) {
          if (item.image !== '') {
            try {
              await axios.delete(
                `http://localhost:8080/api/lobbies/${lobbyId}/players/${userId}/items/${item.id}/deleteImage`
              );
              console.log('Deleted image:', item.id);
            }
            catch (error) {
              console.error('Error deleting image:', error);
            }
          }
        }
        const response = await axios.post(
          `http://localhost:8080/api/lobbies/${lobbyId}/${userId}/leave`
        );
        console.log("Left lobby:", response.data);
        navigate("/");
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    }
  };

  const handleClick = () => {
    navigate(`/winners`);
  };

  return (
    <>
      <GoBackButton
        popupConfig={{
          title: "Quit Game",
          message:
            "Are you sure you want to quit the game?  You will be removed from the game.",
          showConfirmButtons: true,
          onConfirm: returnToHome,
        }}
      />
      <div className="scavenge-spacer">
        <h1>Capture Your Find</h1>
      </div>
      <div className="scavenger-view">
        <header className="scavenge-header">
          <section className={`scavenge-item-list`}>
            <p>Item List:</p>
            <div className="scavenge-item-container">
              {items.length > 0 && (
                <div className={`scavenge-item-carousel ${items[currentIndex].found ? "found" : "" }`}>
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
            <input type="file" name="image" id="image" data-testid='file-input' accept="image/*" onChange={handleImageChange} />
          </div>
          <button className="scavenge-delete-button" onClick={handleDeleteImage}>
            🗑️
          </button>
          <div className="scavenge-set-time">
            <label>Time Remaining:</label>
            <input type="text" value={formatTime(timeRemaining)} placeholder="hr:mm:ss" readOnly />
          </div>
        </header>
        
        <div className="scavenge-image-preview">
          {items[currentIndex]?.image ? (
            <img src={`http://localhost:8080${items[currentIndex].image}`} alt="Selected" />
          ) : (
            <p>{errorMessage || 'No image selected'}</p>
          )}
        </div>
        {items.length > 0 && items[currentIndex].approvalStatus === 'approved' && (
          <div className="scavenge-foundText">
            <p className="scavenge-found-text">Item found!</p>
          </div>
        )}
        {items.length > 0 && items[currentIndex].approvalStatus === 'waiting' && (
          <div className="scavenge-waitingText">
            <p className="scavenge-waiting-text">Upload successful, waiting for host approval.</p>
          </div>
        )}
        {items.length > 0 && items[currentIndex].approvalStatus === 'denied' && (
          <div className="scavenge-deniedText">
            <p className="scavenge-denied-text">Upload denied by host, please try again.</p>
          </div>
        )}
      </div>

      <div className="scavenge-spacer2">
        <button className="scavenge-submit-items-button" disabled={!allItemsFound} onClick={handleClick}>
          Submit
        </button>
      </div>
    </>
  );
};

export default ScavengeScreen;
