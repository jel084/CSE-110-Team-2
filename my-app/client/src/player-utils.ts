
import { Player, Item } from "./types";
import axios from 'axios';
export const API_BASE_URL = "http://localhost:5000";

// Function to get all players from the backend. Method: GET
export const getPlayers = async (): Promise<Player[]> => {
	const response = await fetch(`${API_BASE_URL}/players`);
	if (!response.ok) {
    	throw new Error("Failed to fetch players");
	}
	let playerList = await response.json();
	return playerList.data;
};

// Function to get items for a player in a specific lobby. Method: GET
export const getItemsForPlayer = async (lobbyId: number, userId: string): Promise<Item[]> => {
	try {
	  const response = await axios.get(`http://localhost:5000/api/lobbies/${lobbyId}/players/${userId}/items`);
	  console.log("Fetched items from response:", response.data);
	  
	  if (Array.isArray(response.data)) {
		return response.data as Item[];
	  } else {
		throw new Error('Unexpected response format');
	  }
	} catch (error) {
	  console.error("Error fetching items:", error);
	  throw new Error('Could not fetch items');
	}
  };

// Function to mark an item as found/unfound for a player in a lobby. Method: PUT
export const markItem = async (lobbyId: number, playerName: string, item: Item): Promise<void> => {
	try {
		await axios.put(`${API_BASE_URL}/lobbies/${lobbyId}/players/${playerName}/items/${item.id}`, {
			found: item.found,
			image: item.image
		});
	} catch (error) {
		console.error('Error marking item:', error);
		throw new Error('Could not update item');
	}
};
