import React from "react";
import {useState, useContext} from "react";
import {AppContext} from "../context/AppContext";
import {Item} from "../types/types";
import './scavengeScreen.css';

function ScavengeScreen(){
    const {timer, items, players} = useContext(AppContext);
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevItem = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
    };

    const nextItem = () => {
        setCurrentIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
    };

    //TODO: Add functionality for marking off when an item is found and turning the button green


    //TODO: Add functionality for image preview


    return(
        <>
        <div className = 'spacer'>
            <h1>Capture Your Find</h1>
        </div>
        <div className = 'host-view'>
            <header className = 'header'>
            <section className = 'item-list'>
                <p>Item List:</p>
                <div className = 'item-container'>
                    {items.length > 0 && (
                        <div className = 'item-carousel'>
                        <button className="arrow-button" onClick={prevItem}>&larr;</button>
                        <span className="item-display">
                            {`Item #${currentIndex + 1}: ${items[currentIndex].name}`}
                        </span>
                        <button className="arrow-button" onClick={nextItem}>&rarr;</button>
                    </div>
                    )}
                </div>
            </section>
            <div className = 'image-container'>
                <label htmlFor="image">Upload Image</label>
                <input type="file" name="image" id = "image"/>
                </div>
                <button className="delete-button" >🗑️</button>
                <div className = 'set-time'>
                    <label>Time Remaining:</label>
                    <input 
                    type = 'text' 
                    value = {timer}
                    placeholder = 'hr:mm:ss'
                    />
                </div>
            </header>
        
            
        </div>
        <div className = 'spacer2'>
        <button className = 'submit-items-button'>Submit</button>
        </div>
    </>

    );
};


export default ScavengeScreen;