class AStar {
    constructor(grid) {
        this.grid = grid;
    }

    async findPath(speed) {
        this.cancelRequested = false;
        const { startNode, endNode } = this.grid;
        if (!startNode || !endNode) return false;

        const openSet = [startNode];
        const closedSet = new Set();

        // Initialize nodes
        for (let row = 0; row < this.grid.size; row++) {
            for (let col = 0; col < this.grid.size; col++) {
                const node = this.grid.grid[row][col];
                node.g = Infinity;
                node.f = Infinity;
                node.h = node.getManhattanDistance(endNode);
            }
        }

        startNode.g = 0;
        startNode.f = startNode.h;

        while (openSet.length > 0) {
            if (this.cancelRequested) return false;
            // Find node with lowest f score
            openSet.sort((a, b) => a.f - b.f);
            const currentNode = openSet.shift();

            // If we found the end
            if (currentNode === endNode) {
                await this.reconstructPath(endNode);
                return true;
            }

            // Mark as visited, but never mark the start node as visited
            if (!currentNode.isStart) {
                currentNode.isVisited = true;
                const cell = this.grid.getCellElement(currentNode);
                cell.classList.add('visited');
            }
            closedSet.add(currentNode);

            // Check neighbors
            const neighbors = currentNode.getNeighbors(this.grid.grid);
            for (const neighbor of neighbors) {
                if (closedSet.has(neighbor)) continue;

                const tentativeG = currentNode.g + 1;

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tentativeG >= neighbor.g) {
                    continue;
                }

                neighbor.previousNode = currentNode;
                neighbor.g = tentativeG;
                neighbor.f = neighbor.g + neighbor.h;
            }

            // Visualization delay
            await new Promise(resolve => setTimeout(resolve, speed));
        }

        return false;
    }

    async reconstructPath(endNode) {
        let currentNode = endNode;
        while (currentNode.previousNode) {
            // Check if next node is start node before moving to it
            if (currentNode.previousNode === this.grid.startNode) {
                break;
            }
            
            currentNode = currentNode.previousNode;
            
            // Skip if it's already marked as start or end
            if (currentNode.isStart || currentNode.isEnd) continue;
            
            currentNode.isPath = true;
            const cell = this.grid.getCellElement(currentNode);
            cell.classList.add('path');
            
            // Visualization delay - make it faster than visiting
            await new Promise(resolve => setTimeout(resolve, 2));
        }
    }
} 