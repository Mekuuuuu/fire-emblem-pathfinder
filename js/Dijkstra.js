class Dijkstra {
    constructor(grid) {
        this.grid = grid;
    }

    async findPath(speed) {
        this.cancelRequested = false;
        const { startNode, endNode } = this.grid;
        if (!startNode || !endNode) return false;

        const unvisitedNodes = [];
        const visitedNodes = new Set();

        // Initialize distances
        for (let row = 0; row < this.grid.size; row++) {
            for (let col = 0; col < this.grid.size; col++) {
                const node = this.grid.grid[row][col];
                node.distance = Infinity;
                unvisitedNodes.push(node);
            }
        }

        startNode.distance = 0;

        while (unvisitedNodes.length > 0) {
            if (this.cancelRequested) return false;
            // Sort unvisited nodes by distance
            unvisitedNodes.sort((a, b) => a.distance - b.distance);
            const closestNode = unvisitedNodes.shift();

            // If we're trapped
            if (closestNode.distance === Infinity) return false;

            // If we found the end
            if (closestNode === endNode) {
                await this.reconstructPath(endNode);
                return true;
            }

            // Mark as visited, but never mark the start node as visited
            if (!closestNode.isStart) {
                closestNode.isVisited = true;
                const cell = this.grid.getCellElement(closestNode);
                cell.classList.add('visited');
            }
            visitedNodes.add(closestNode);

            // Update neighbors
            const neighbors = closestNode.getNeighbors(this.grid.grid);
            for (const neighbor of neighbors) {
                if (visitedNodes.has(neighbor)) continue;

                const tentativeDistance = closestNode.distance + 1;
                if (tentativeDistance < neighbor.distance) {
                    neighbor.distance = tentativeDistance;
                    neighbor.previousNode = closestNode;
                }
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