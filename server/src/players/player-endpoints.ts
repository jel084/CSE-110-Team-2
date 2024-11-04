import { getPlayers, getItems, markItem } from "./player-utils";
import { Request, Response } from 'express';

export function createPlayerEndpoints(app: any, players: any) {

    // Get list of players
    app.get("/players", (req: Request, res: Response) => {

        getPlayers(req, res, players);

    })

    // Get item list for player
    app.get("/players/:name", (req: Request, res: Response) => {

        getItems(req, res, players);

    });

    // Mark an item as found
    app.delete("/players/:name/:item", (req: Request, res: Response) => {

        markItem(req, res, players);

    });

}