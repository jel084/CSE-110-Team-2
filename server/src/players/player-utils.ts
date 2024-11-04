import { Player } from "../types";
import { Request, Response } from "express";

export function getPlayers(req: Request, res: Response, players: Player[]) {
    res.status(200).send({ "players": players });
}

export function getItems(req: Request, res: Response, players: Player[]) {
    const name = req.params.name;
    const index = players.findIndex((player) => player.name === name);
    const items = players[index].items;
    res.status(200).send({ "items": items });
}

export function markItem(req: Request, res: Response, players: Player[]) {
    const name = req.params.name;
    const foundItem = req.params.item;
    const player_index = players.findIndex((player) => player.name === name);
    const item_index = players[player_index].items.findIndex((item) => item === foundItem);

    players[player_index].items.splice(item_index, 1);
    res.status(200).send({ message: 'Item deleted successfully' });
}