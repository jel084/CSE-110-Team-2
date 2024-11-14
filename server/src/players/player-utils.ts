import { Database } from "sqlite";
import { Player, Item } from "../types";
import { Request, Response } from "express";

export async function getPlayers(req: Request, res: Response, db: Database) {
    try {
        const p: Player[] = await db.all('SELECT * FROM players;');
        res.status(200).send({"data": p});
    } catch (error) {
        return res.status(400).send({ error: `Could not get players` });
    }
}

export async function getItems(req: Request, res: Response, db: Database) {
    try {
        const name = req.params.name;
        let itemTable = await db.all(`SELECT items FROM players WHERE name = ?;`, [name]);
        itemTable = itemTable[0].items; // pulls single item from table
        const items: Item[] = await db.all(`SELECT * FROM ${itemTable};`);
        res.status(200).send({"data": items});
    } catch (error) {
        return res.status(400).send({ error: `Could not get items` });
    }
}

export async function markItem(req: Request, res: Response, db: Database) {
    try {
        const name = req.params.name;
        const foundItem = req.params.item;
        let itemTable = await db.all(`SELECT items FROM players WHERE name = ?;`, [name]);
        itemTable = itemTable[0].items; // pulls single item from table (same for found and points)
        await db.run(`UPDATE ${itemTable} SET found = NOT found WHERE name = ?;`, [foundItem]);
        let found = await db.all(`SELECT found FROM ${itemTable} WHERE name = ?;`, [foundItem]);
        let points = await db.all(`SELECT points FROM ${itemTable} WHERE name = ?;`, [foundItem]);
        found = found[0].found;
        points = points[0].points;
        if (found)
            await db.run(`UPDATE players SET points = points + ? WHERE name = ?;`, [points, name]);
        else
            await db.run(`UPDATE players SET points = points - ? WHERE name = ?;`, [points, name]);
        res.status(200).send({ message: 'Item marked successfully' });
    } catch (error) {
        return res.status(400).send({ error: `Could not mark item` });
    }
}