export type Item = {
    id: number;
    name: string;
    points: number;
    found: boolean;
<<<<<<< HEAD
=======
    image?: string;
>>>>>>> f3699daabdea8791454e528255c6ff178cf4f9d5
}

export type Player = {
    name: string;
    points: number;
    items: Item[];

}