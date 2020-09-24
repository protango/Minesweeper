import Minesweeper from "./minesweeper.js";
import { createElement, clearChildren } from "./domManipulation.js";

/** @readonly @enum {number} */
export const CellState = {
    revealed: 0,
    unrevealed: 1,
    flagged: 2,
    questionMark: 3,
    incorrectFlag: 4
}

export class Cell {
    /** Private properties and methods */
    _ = {
        /** @type {Cell[]} */
        neighbours: null,
        /** @type {HTMLSpanElement} */
        innerSpan: null,
        /** @type {CellState} */
        state: CellState.unrevealed,
        /** @type {number} */
        number: null
    }

    /** @readonly @type {HTMLDivElement} */
    elem;
    /** @readonly @type {number} */
    x;
    /** @readonly @type {number} */
    y;
    /** @type {boolean} */
    isMine = false;
    /** @type {number} */
    get number() {
        if (this._.number != null && this.game.initialised) return this._.number;
        return this._.number = this.neighbours.reduce((a, x) => a + (x.isMine ? 1 : 0), 0);
    }
    /** @type {Minesweeper} */
    game;
    /** @type {CellState} */
    get state() { return this._.state; }
    set state(value) {
        let data = "";
        switch (value) {
            case CellState.unrevealed: data = ""; break;
            case CellState.revealed: data = this.isMine ? "*" : this.number.toString(); break;
            case CellState.flagged: data = "F"; break;
            case CellState.questionMark: data = "?"; break;
            case CellState.incorrectFlag: data = "*X"; break;
        }
        this.elem.setAttribute("data-minesweeper-value", data);
        this._.innerSpan.className = value === CellState.revealed || value === CellState.incorrectFlag ? "revealed" : "unrevealed";
        this._.state = value;
    }
    /** @type {Cell[]} */
    get neighbours() {
        if (this._.neighbours) return this._.neighbours;
        return this._.neighbours = this.game.getSquareAround(this.x, this.y);
    }
    get isRevealed() { return this.state === CellState.revealed }
    get isFlag() { return this.state === CellState.flagged }
    get isQuestionMark() { return this.state === CellState.questionMark }


    /**
     * @param {HTMLDivElement} elem 
     * @param {number} x 
     * @param {number} y 
     * @param {Minesweeper} game
     */
    constructor(elem, x, y, game) {
        // Initialise parameters
        this.elem = elem;
        this.game = game;
        this.x = x;
        this.y = y;

        // Set up DOM
        clearChildren(elem);
        elem.className = "cell";
        this._.innerSpan = createElement(elem, "span", "unrevealed");

        // Register event handlers
        this.elem.onmouseup = (e) => {
            if (this.game.isGameOver) return;

            if (e.button === 0) { // left click
                this.reveal();
            } else if (e.button === 1) { // middle click
                this.revealNeighbours();
            } else if (e.button === 2 && !this.isRevealed) { // right click
                switch (this._.state) {
                    case CellState.flagged: this.state = CellState.questionMark; break;
                    case CellState.questionMark: this.state = CellState.unrevealed; break;
                    default: this.state = CellState.flagged;
                }
            } 
        }
        this.elem.ondblclick = (e) => {
            if (e.button === 0) this.revealNeighbours(); // left click
        }
    }

    reveal(preventGameOver = false) {
        if (this.state === CellState.unrevealed) {
            if (!this.game.initialised) {
                this.game.initialise(this.x, this.y);
            }
            this.state = CellState.revealed;
            this.game.score += this.isMine ? 0 : this.number;
            if (!this.isMine && this.number === 0) {
                for (let c of this.neighbours)
                    if (c.state === CellState.unrevealed) c.simulateClick();
            } else if (this.isMine && !preventGameOver) {
                this._.innerSpan.classList.add("triggered");
                this.game.gameOver();
            }
        }
    }

    /**
     * Reveals all (non-flagged) neighbours if there enough flags surrounding this cell
     */
    revealNeighbours() {
        if (this.isRevealed) {
            let aroundCs = this.neighbours;
            if (aroundCs.reduce((a, x) => a + (x.isFlag ? 1 : 0), 0) === this.number)
                for (let c of aroundCs)
                    if (c.state === CellState.unrevealed) c.simulateClick(100);
        }
    }

    /**
     * Simulates clicking this cell (plays click animation and triggers the reveal method if applicable)
     * @param {number} delay Delay between mouse down and mouse up
     */
    simulateClick(delay = 50) {
        this._.innerSpan.classList.add("active");
        setTimeout(() => {
            this._.innerSpan.classList.remove("active");
            this.reveal();
        }, delay);
    }
    
    /**
     * Determines whether setting this cell to be a mine will cause a "cluster" of mines.
     * A cluster is a group of mines where at least one mine does not have a non-mine neighbour.
     */
    willCauseCluster() {
        let squareAround = this.neighbours;
        let minesAround = squareAround.filter(x => x.isMine);
        // at least one neighbour must not be a mine
        if (squareAround.length === minesAround.length) return true;
        // all mine neighbours must have at least 2 free neighbours
        if (minesAround.some(x => x.neighbours.filter(x => !x.isMine).length < 2)) return true;
        return false;
    }

    reset() {
        this._.number = null;
        this.isMine = false;
        this.state = CellState.unrevealed;
    }
}