class Node {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.isWall = false;
        this.isStart = false;
        this.isEnd = false;
        this.isVisited = false;
        this.isPath = false;
        this.distance = Infinity;
        this.previousNode = null;
        this.f = Infinity; // For A* algorithm
        this.g = Infinity; // For A* algorithm
        this.h = 0;       // For A* algorithm
    }

    reset() {
        this.isVisited = false;
        this.isPath = false;
        this.distance = Infinity;
        this.previousNode = null;
        this.f = Infinity;
        this.g = Infinity;
        this.h = 0;
    }

    getNeighbors(grid) {
        const neighbors = [];
        const { row, col } = this;
        const rows = grid.length;
        const cols = grid[0].length;

        // Check all four directions
        if (row > 0) neighbors.push(grid[row - 1][col]);           // Up
        if (row < rows - 1) neighbors.push(grid[row + 1][col]);    // Down
        if (col > 0) neighbors.push(grid[row][col - 1]);           // Left
        if (col < cols - 1) neighbors.push(grid[row][col + 1]);    // Right

        return neighbors.filter(neighbor => !neighbor.isWall);
    }

    getManhattanDistance(endNode) {
        return Math.abs(this.row - endNode.row) + Math.abs(this.col - endNode.col);
    }
} 