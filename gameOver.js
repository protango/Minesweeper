import { createElement } from "./domManipulation.js";
import Minesweeper from "./minesweeper.js";

export default class GameOver {
    /** @type {Minesweeper} */
    game;
    /** @type {HTMLDivElement} */
    elem;
    /** @type {HTMLSpanElement} */
    scoreElem;

    /** @param {Minesweeper} game */
    constructor(game) {
        this.game = game;
        this.elem = /**@type {HTMLDivElement}*/(createElement(this.game.gridElem, "div", "gameOverOverlay"));
        this.elem.style.display = "none";
        createElement(this.elem, "span", "gameOverText").innerText = "Game Over";
        this.scoreElem = createElement(this.elem, "span", "score");
    }

    /**
     * Shows the game over panel with a score
     * @param {number} score 
     */
    show(score) {
        this.scoreElem.innerText = "Score: " + score;
        this.elem.style.display = null;
    }

    /**
     * Hides the game over panel
     */
    hide() {
        this.elem.style.display = "none";
    }
}