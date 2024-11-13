export type Item = {
    id: number;
    name: string;
    points: number;
    found: boolean;
    image?: string;
}

export type Player = {
    name: string;
    points: number;
    items: Item[];

}