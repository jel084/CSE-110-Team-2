import React from "react";
import {useState, useContext} from "react";
import {AppContext} from "../context/AppContext";
import {Item} from "../types/types";
import './scavengeScreen.css';

const ScavengeScreen = () => {
    const {timer, items, players, setItems} = useContext(AppContext);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const prevItem = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
    };

    const nextItem = () => {
        setCurrentIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
    };

    //TODO: Add functionality for marking off when an item is found and turning the button green


    //TODO: Add functionality for image preview

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const validImageTypes = ['image/jpeg', 'image/png'];
            if (!validImageTypes.includes(file.type)) {
                setErrorMessage('Invalid file type. Please select jpg or png.');
                return;
            }
            setErrorMessage(null);
            const reader = new FileReader();
            reader.onload = (e) => {
                const updatedItems = [...items];
                updatedItems[currentIndex].image = e.target?.result as string;
                setItems(updatedItems);
            };
            reader.readAsDataURL(file);
        }
    };

    const deleteImage = () => {
        const updatedItems = [...items];
        updatedItems[currentIndex].image = undefined;
        setItems(updatedItems);
    }

    const allItemsFound = items.every(item => item.image);

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
                <input type="file" name="image" id = "image" accept = "image/*" onChange={handleImageChange}/>
                </div>
                <button className="delete-button" onClick = {deleteImage}>🗑️</button>
                <div className = 'set-time'>
                    <label>Time Remaining:</label>
                    <input 
                    type = 'text' 
                    value = {timer}
                    placeholder = 'hr:mm:ss'
                    />
                </div>
            </header>
        
            <div className='image-preview'>
                    {items[currentIndex].image ? (<img src={items[currentIndex].image} alt="Selected" />) : 
                    (<p>{errorMessage || 'No image selected'}</p>)
                    }
                </div>
        </div>
        <div className = 'spacer2'>
        <button className = 'submit-items-button' disabled = {!allItemsFound}>Submit</button>
        </div>
    </>

    );
};


export default ScavengeScreen;