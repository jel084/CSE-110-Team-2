export type Item = {
    id: number;
    name: string;
    points: number;
    found: boolean;
}

export type Player = {
    name: string;
    points: number;
    items: Item[];

}