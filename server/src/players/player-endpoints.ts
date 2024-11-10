import { Database } from "sqlite";
import { getPlayers, getItems, markItem } from "./player-utils";
import { Request, Response } from 'express';

export function createPlayerEndpoints(app: any, db: Database) {

    // Get list of players
    app.get("/players", (req: Request, res: Response) => {

        getPlayers(req, res, db);

    })

    // Get item list for player
    app.get("/players/:name", (req: Request, res: Response) => {

        getItems(req, res, db);

    });

    // Mark an item as found
    app.put("/players/:name/:item", (req: Request, res: Response) => {

        markItem(req, res, db);

    });

}