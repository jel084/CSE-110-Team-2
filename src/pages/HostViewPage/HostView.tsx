import React from 'react';
import { useState } from 'react';
import './HostViewStyle.css';
// import axios from 'axios';

function HostView() {
    const [lobbyCode, setLobbyCode] = useState('XXXX');
    const [timer, setTime] = useState('00:00:00');
    const [newItem, setNewItem] = useState('');
    const [items, setItems] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // const fetchItems = async () => {
    //     const response = await axios.get('/api/items');
    //     console.log(response.data);
    // };

    const handleLobbyCode = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d{0,4}$/.test(value)) {
            setLobbyCode(value);
        }
        console.log(lobbyCode);
    }
    
    const addItem = () => {
        if (newItem.trim() !== '') {
            setItems((prevItems) => [...prevItems, newItem]);
            setNewItem('');
            setCurrentIndex(items.length);
        }
    };

    const deleteItem = () =>{
        if(items.length > 0){
            const updatedItems = items.filter((_, index) => index !== currentIndex);
            setItems(updatedItems);
            setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
        }
    };

    const prevItem = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
    };

    const nextItem = () => {
        setCurrentIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
    };

    return (
        <>
            <div className = 'spacer'></div>
            <div className = 'host-view'>
                <header className = 'header'>
                    <h1>Lobby Code</h1>
                    <div className = "lobby-code">
                        <input 
                            type = "text" 
                            aria-label = 'Lobby Code'
                            value = {lobbyCode}
                            onChange={handleLobbyCode}
                            placeholder = 'XXXX'
                            maxLength = {4}
                        />
                    </div>
                    <div className = 'set-time'>
                        <label>Set Time:</label>
                        <input 
                        type = 'text' 
                        value = {timer}
                        placeholder = 'hr:mm:ss'
                        onChange={(e) => setTime(e.target.value)}
                        />
                    </div>
                </header>
                <section className = 'add-item-section'>
                    <h2>Add Item:</h2>
                    <input 
                    value = {newItem}
                    type = 'text' 
                    placeholder = 'Item Name'
                    onChange={(e) => setNewItem(e.target.value)}
                    aria-label = 'add new item' 
                    />
                    <button onClick = {addItem} aria-label = 'add item'>
                    Add Item
                    </button>
                </section>
                <section className = 'item-list'>
                    <p>Item List:</p>
                    <div className = 'item-container'>
                        {items.length > 0 && (
                            <div className = 'item-carousel'>
                                <button className="arrow-button" onClick={prevItem}>&larr;</button>
                                <span className="item-display">
                                    {`Item #${currentIndex + 1}: ${items[currentIndex]}`}
                                </span>
                                <button className="delete-button" data-testid={`delete-button-${currentIndex}`} onClick={deleteItem}>🗑️</button>
                                <button className="arrow-button" onClick={nextItem}>&rarr;</button>
                            </div>
                        )}
                    </div>
                </section>
                <button className = 'start-game-button'>Start Game</button>
                
            </div>
            <div className = 'spacer2'></div>
        </>
    );
}

export default HostView;