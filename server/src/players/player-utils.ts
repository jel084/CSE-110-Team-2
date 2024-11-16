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
        const playerName = req.params.name;
        let { name, points, found, image } = req.body as { name: string, points: number, found: boolean, image: string };

        if (!name || !points) {
            return res.status(400).send({ error: "Missing required fields" });
        }
        if (image == undefined) {
            image = '';
        }

        let itemTable = await db.all(`SELECT items FROM players WHERE name = ?;`, [playerName]);
        itemTable = itemTable[0].items; // pulls single item from table
        const currFound = await db.all(`SELECT found FROM ${itemTable} WHERE name = ?;`, [name]);
        await db.run(`UPDATE ${itemTable} SET found = ? WHERE name = ?;`, [found, name]);
        await db.run(`UPDATE ${itemTable} SET image = ? WHERE name = ?;`, [image, name]);
        if (found && !currFound[0].found)
            await db.run(`UPDATE players SET points = points + ? WHERE name = ?;`, [points, playerName]);
        else if (!found && currFound[0].found)
            await db.run(`UPDATE players SET points = points - ? WHERE name = ?;`, [points, playerName]);
        res.status(200).send({ message: 'Item marked successfully' });
    } catch (error) {
        return res.status(400).send({ error: `Could not mark item` });
    }
}