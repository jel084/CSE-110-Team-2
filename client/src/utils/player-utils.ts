import { API_BASE_URL } from "../constants/constants";
import { Player } from "../types/types";

// Function to get all players from the backend. Method: GET
export const getPlayers = async (): Promise<Player[]> => {
	const response = await fetch(`${API_BASE_URL}/players`);
	if (!response.ok) {
    	throw new Error("Failed to fetch players");
	}
	// Parsing the response to get the data
	let playerList = response.json().then((jsonResponse) => {
    	console.log("data in getPlayers", jsonResponse);
    	return jsonResponse.data;
	});

	console.log("response in getPlayers", playerList);
	return playerList;
};

// Function to get the player's item list from the backend. Method: GET
export const getItems = async (name: string): Promise<string[]> => {
	const response = await fetch(`${API_BASE_URL}/players/${name}`);
	if (!response.ok) {
    	throw new Error('Failed to fetch player item list');
	}

	// Parsing the response to get the data
	let itemList = response.json().then((jsonResponse) => {
    	console.log("data in getItems", jsonResponse);
    	return jsonResponse.data;
	});

	console.log("response in getItems", itemList);
	return itemList;
};	

// Function to mark an item as found in the backend. Method: DELETE
export const markItem = async (player: string, item: string): Promise<void> => {
	const response = await fetch(`${API_BASE_URL}/expenses/${player}/${item}`, {
    	method: "DELETE"
	});
	if (!response.ok) {
    	throw new Error("Failed to mark item");
	}
};