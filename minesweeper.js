import {qs, qsa, createElement, clearChildren} from './domManipulation.js'
import {Cell} from './cell.js'

export default class Minesweeper {
    /** @type {number} */
    height;
    /** @type {number} */
    width;
    /** @type {HTMLDivElement} */
    elem;
    /** @type {HTMLDivElement} */
    gridElem;
    /** @type {Cell[]} */
    cells = [];
    /** @type {number} */
    mines;
    /** @type {boolean} */
    initialised = false;
    
    /**
     * Creates a new minesweeper game
     * @param {HTMLDivElement} mainElem The element to create a game in
     * @param {number} height The number of rows
     * @param {number} width The number of columns
     * @param {number} mines The number of mines
     */
    constructor(mainElem, width, height, mines) {
        this.height = height;
        this.width = width;
        this.elem = mainElem;
        this.mines = mines;
        clearChildren(mainElem);
        mainElem.className = "minesweeper";
        this.gridElem = /**@type {HTMLDivElement}*/(createElement(mainElem, "div", "grid"));
        this.gridElem.oncontextmenu = () => false;

        for (let y = 0; y < height; y++) {
            let row = createElement(this.gridElem, "div", "row");
            for (let x = 0; x < width; x++) {
                let cell = /**@type {HTMLDivElement}*/(createElement(row, "div"));
                this.cells.push(new Cell(cell, x, y, this));
            }
        }

        // set grid to autosizing mode
        this.resize();
    }

    /**
     * Resizes the grid to accomodate a specific cell width and height
     * @param {number} [cellSize] width and height of a cell in px, specify null for autosizing
     */
    resize(cellSize) {
        if (cellSize) {
            this.gridElem.style.height = (this.height * cellSize) + "px";
            this.gridElem.style.width = (this.width * cellSize) + "px";
        } else {
            this.gridElem.style.height = "100%";
            this.gridElem.style.width = "100%";
        }
    }

    /**
     * Gets a cell by row and column
     * @param {number} x 
     * @param {number} y 
     */
    getCell(x, y) {
        return this.cells[y * this.width + x];
    }

    /**
     * Gets a 3x3 square of cells centered around a point, not including the center cell
     * @param {number} x 
     * @param {number} y 
     */
    getSquareAround(x, y) {
        /** @type {Cell[]} */
        let result = [];
        for (let _y = y - 1; _y <= y + 1; _y++) {
            if (_y < 0 || _y >= this.height) continue; // skip row if it's out of the game area
            for (let _x = x - 1; _x <= x + 1; _x++) {
                if (_x < 0 || _x >= this.width) continue; // skip cell if it's out of the game area
                if (_x === x && _y === y) continue; // skip cell if it is this cell
                result.push(this.getCell(_x, _y));
            }
        }
        return result;
    }

    /**
     * Gets a "+" shaped subset of cells centered around a point, not including the center cell
     * @param {number} x 
     * @param {number} y 
     */
    getPlusAround(x, y) {
        /** @type {Cell[]} */
        let result = [];
        if (y != 0) result.push(this.getCell(x, y - 1));
        if (y != this.height-1) result.push(this.getCell(x, y + 1));
        if (x != 0) result.push(this.getCell(x - 1, y));
        if (x != this.width-1) result.push(this.getCell(x + 1, y));
        return result;
    }

    /**
     * Places the mines in the grid
     * @param {number} x The column of the initial location to be mine-free
     * @param {number} y The row of the initial location to be mine-free
     */
    initialise(x, y) {
        for (let i = 0; i < this.mines; i++) {
            let cell;
            do {
                let mineX = Math.floor(Math.random() * this.width);
                let mineY = Math.floor(Math.random() * this.height);
                cell = this.getCell(mineX, mineY);
            } while (
                cell.isMine || // Ensure cell isn't already a mine
                cell.willCauseCluster() || // Ensure that placing a mine here wont create a cluster
                (cell.x >= x-1 && cell.x <= x+1 && cell.y >= y-1 && cell.y <= y+1) // Ensure that the mine is not near the start position
            );
            cell.isMine = true;
        }
        //for (let c of this.cells) c.number = c.computeNumber();
        this.initialised = true;
    }

    reset() {
        for (let c of this.cells) c.reset();
        this.initialised = false;
    }
}
