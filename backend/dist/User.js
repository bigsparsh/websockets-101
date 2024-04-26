"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(id, ws) {
        this.posx = rand(0, 800);
        this.posy = rand(0, 600);
        this.id = id;
        this.ws = ws;
    }
    move(x, y) {
        this.posx = x;
        this.posy = y;
    }
}
exports.default = User;
const rand = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
