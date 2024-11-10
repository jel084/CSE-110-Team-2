import React from "react";
import {useState, useContext} from "react";
import {AppContext} from "../context/AppContext";
import {Item} from "../types/types";

function ScavengeScreen(){
    const {timer, items} = useContext(AppContext);

    const[playerItems, setPlayerItems] = useState<Item[]>(items);




    return(
        <div>

        </div>

    );
};


export default ScavengeScreen;