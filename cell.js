import Minesweeper from "./minesweeper.js";
import { createElement, clearChildren } from "./domManipulation.js";
export class Cell {
    /** @type {HTMLDivElement} */
    elem;
    /** @type {number} */
    x;
    /** @type {number} */
    y;
    /** @type {boolean} */
    revealed = false;
    /** @type {boolean} */
    isMine;
    /** @type {number} */
    number;
    /** @type {Minesweeper} */
    game;
    /** @type {HTMLSpanElement} */
    innerSpan;
    /** @type {boolean} */
    flagged = false;
    /** @type {boolean} */
    questionMark = false;
    /** @type {boolean} */
    disallowMine = false;


    /**
     * @param {HTMLDivElement} elem 
     * @param {number} x 
     * @param {number} y 
     * @param {Minesweeper} game
     */
    constructor(elem, x, y, isMine, game) {
        this.elem = elem;
        this.game = game;
        this.x = x;
        this.y = y;
        this.isMine = isMine;
        clearChildren(elem);
        elem.className = "cell";
        this.innerSpan = createElement(elem, "span", "unrevealed");

        var primed = false;
        var lastLeftClickTime = new Date(0);
        this.elem.onmousedown = () => primed = true;
        this.elem.onmouseleave = () => {
            if (primed) {
                primed = false;
            }
        }
        this.elem.onmouseup = (e) => {
            if (primed) {
                primed = false;
                if (e.button === 0) { // left click
                    if (!this.revealed) 
                        this.reveal();
                    else if (new Date() - lastLeftClickTime < 300) this.revealAround();
                    lastLeftClickTime = new Date();
                } else if (e.button === 1) { // middle click
                    this.revealAround();
                } else if (e.button === 2 && !this.revealed) { // right click
                    if (this.flagged) {
                        this.flagged = false;
                        this.questionMark = true;
                        this.elem.setAttribute("data-minesweeper-value", "?");
                    } else if (this.questionMark) {
                        this.questionMark = false;
                        this.elem.removeAttribute("data-minesweeper-value");
                    } else {
                        this.flagged = true;
                        this.elem.setAttribute("data-minesweeper-value", "F");
                    }
                }  
            }
        }
    }

    reveal() {
        if (!this.revealed && !this.flagged && !this.questionMark) {
            this.revealed = true;
            if (!this.game.hasMines) {
                this.game.positionMines(this.x, this.y);
            }
            this.innerSpan.className = "revealed";
            if (!this.isMine) {
                this.number = this.computeNumber();
                this.elem.setAttribute("data-minesweeper-value", this.number);
                if (this.number === 0) {
                    for (let c of this.game.getSquareAround(this.x, this.y))
                        if (!c.revealed && !c.flagged && !c.questionMark) c.simulateClick();
                }
            } else {
                this.elem.setAttribute("data-minesweeper-value", "*");
            }
        }
    }

    revealAround() {
        if (this.revealed) {
            let aroundCs = this.game.getSquareAround(this.x, this.y);
            if (aroundCs.reduce((a, x) => a + x.flagged, 0) === this.number)
                for (let c of aroundCs)
                    if (!c.flagged) c.simulateClick(100);
        }
    }

    /**
     * Simulates clicking this cell (plays click animation and triggers the reveal method if applicable)
     * @param {number} delay Delay between mouse down and mouse up
     */
    simulateClick(delay) {
        this.innerSpan.classList.add("active");
        setTimeout(() => {
            this.innerSpan.classList.remove("active");
            this.reveal();
        }, delay || 50);
    }

    computeNumber() {
        return this.game.getSquareAround(this.x, this.y).reduce((a, x) => a + x.isMine, 0);
    }

    isClustered() {

    }

    willCauseCluster() {
        let squareAround = this.game.getSquareAround(this.x, this.y);
        let minesAround = squareAround.filter(x => x.isMine);
        if (squareAround.length === minesAround.length) return true; // if all neighbours are mines then cluster will form
        // all mine neighbours must have at least 2 free neighbours
        if (minesAround.some(x => this.game.getSquareAround(x.x, x.y).filter(x => !x.isMine).length < 2)) return true;
        return false;
    }

    reset() {
        this.number = undefined;
        this.disallowMine = this.flagged = this.questionMark = this.isMine = this.revealed = false;
        this.elem.removeAttribute("data-minesweeper-value");
        this.innerSpan.className = "unrevealed";
    }
}