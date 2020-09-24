import Minesweeper from "./minesweeper";

export default class GameHeader {
    /** @type {Minesweeper} */
    game;
    
    /** @param {Minesweeper} game */
    constructor(game) {
        this.game = game;
    }
}