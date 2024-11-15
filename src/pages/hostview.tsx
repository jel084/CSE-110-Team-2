// import './HostViewStyle.css';
import React from 'react';
import { useState } from 'react';
// import './HostViewStyle.css';


function HostView() {
    const [lobbyCode, setLobbyCode] = useState('XXXXXXXX');
    const [timer, setTime] = useState('00:00:00');
    const [newItem, setNewItem] = useState('');
    const [items, setItems] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);


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
                            value = {lobbyCode}
                            onChange={(e) => setLobbyCode(e.target.value)}
                            placeholder = 'XXXXXXXX'
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
                    />
                    <button onClick = {addItem}>Submit</button>
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
                                <button className="delete-button" onClick={deleteItem}>🗑️</button>
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
