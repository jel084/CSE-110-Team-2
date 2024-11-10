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
        const itemTable: string = await db.all(`SELECT items FROM players WHERE name = ?;`, [name]);
        const items = await db.all(`SELECT * FROM ?;`, [itemTable]);
        res.status(200).send({"data": items});
    } catch (error) {
        return res.status(400).send({ error: `Could not get items` });
    }
}

export async function markItem(req: Request, res: Response, db: Database) {
    try {
        const name = req.params.name;
        const foundItem = req.params.item;
        const itemTable: string = await db.all(`SELECT items FROM players WHERE name = ?;`, [name]);
        await db.run(`UPDATE ? SET found = 1 WHERE name = ?;`, [itemTable, foundItem]);
        const points = await db.all(`SELECT points FROM ? WHERE name = ?;`, [itemTable, foundItem]);
        await db.run(`UPDATE players SET points = points + ? WHERE name = ?;`, [points, name]);
        res.status(200).send({ message: 'Item marked successfully' });
    } catch (error) {
        return res.status(400).send({ error: `Could not mark item` });
    }
}