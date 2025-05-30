class Grid {
    constructor(containerId, size) {
        this.container = document.getElementById(containerId);
        this.size = size;
        this.grid = [];
        this.startNode = null;
        this.endNode = null;
        this.isMouseDown = false;
        this.placementMode = 'start'; // Default mode
        this.draggedNode = null;

        this.initializeGrid();
        this.setupEventListeners();
        
        // Set default start and end nodes
        this.setStartNode(this.grid[0][0]);
        this.setEndNode(this.grid[this.size - 1][this.size - 1]);
    }

    initializeGrid() {
        const containerSize = 500; // px, must match CSS
        const cellSize = Math.floor(containerSize / this.size);
        this.container.style.gridTemplateColumns = `repeat(${this.size}, ${cellSize}px)`;
        this.container.style.gridTemplateRows = `repeat(${this.size}, ${cellSize}px)`;
        this.grid = [];

        for (let row = 0; row < this.size; row++) {
            const rowArray = [];
            for (let col = 0; col < this.size; col++) {
                const node = new Node(row, col);
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                this.container.appendChild(cell);
                rowArray.push(node);
            }
            this.grid.push(rowArray);
        }
    }

    setupEventListeners() {
        this.container.addEventListener('mousedown', (e) => {
            if (!e.target.classList.contains('grid-cell')) return;
            this.isMouseDown = true;
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            const node = this.grid[row][col];
            
            if (this.placementMode === 'start' && node.isStart) {
                this.draggedNode = { type: 'start', node };
            } else if (this.placementMode === 'end' && node.isEnd) {
                this.draggedNode = { type: 'end', node };
            } else {
                // this.handleCellClick(e.target);
            }
        });

        // Responsive dragging: update node position on every mousemove
        this.container.addEventListener('mousemove', (e) => {
            if (!this.draggedNode) return;
            const target = document.elementFromPoint(e.clientX, e.clientY);
            if (!target || !target.classList.contains('grid-cell')) return;
            const row = parseInt(target.dataset.row);
            const col = parseInt(target.dataset.col);
            const targetNode = this.grid[row][col];
            // Only allow moving to non-wall cells
            if (!targetNode.isWall) {
                if (this.draggedNode.type === 'start') {
                    this.setStartNode(targetNode);
                } else if (this.draggedNode.type === 'end') {
                    this.setEndNode(targetNode);
                }
            }
        });

        // Keep mouseover as fallback for keyboard navigation or edge cases
        this.container.addEventListener('mouseover', (e) => {
            if (!e.target.classList.contains('grid-cell')) return;
            if (this.draggedNode) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                const targetNode = this.grid[row][col];
                // Only allow moving to non-wall cells
                if (!targetNode.isWall) {
                    if (this.draggedNode.type === 'start') {
                        this.setStartNode(targetNode);
                    } else if (this.draggedNode.type === 'end') {
                        this.setEndNode(targetNode);
                    }
                }
            } else if (this.isMouseDown) {
                // this.handleCellClick(e.target);
            }
        });

        document.addEventListener('mouseup', () => {
            this.isMouseDown = false;
            this.draggedNode = null;
        });
    }

    setPlacementMode(mode) {
        this.placementMode = mode;
    }

    // handleCellClick(e) {
    //     if (!e || !e.target || !e.target.classList || !e.target.classList.contains('grid-cell')) return;
    //     const row = parseInt(e.target.dataset.row);
    //     const col = parseInt(e.target.dataset.col);
    //     const node = this.grid[row][col];
    //     if (!node) return; // Check if node exists
    //     switch (this.placementMode) {
    //         case 'start':
    //             this.setStartNode(node);
    //             break;
    //         case 'end':
    //             this.setEndNode(node);
    //             break;
    //         case 'wall':
    //             if (!node.isWall) { // Only toggle if not already a wall
    //                 this.toggleWall(node);
    //             }
    //             break;
    //         case 'erase':
    //             this.eraseNode(node);
    //             break;
    //     }
    // }

    setStartNode(node) {
        // Don't allow setting start node on top of end node
        if (node.isEnd) return;
        
        if (this.startNode) {
            const oldStartCell = this.getCellElement(this.startNode);
            oldStartCell.classList.remove('start');
            this.startNode.isStart = false;
        }

        this.startNode = node;
        node.isStart = true;
        const cell = this.getCellElement(node);
        cell.className = 'grid-cell';
        cell.classList.add('start');
    }

    setEndNode(node) {
        // Don't allow setting end node on top of start node
        if (node.isStart) return;
        
        if (this.endNode) {
            const oldEndCell = this.getCellElement(this.endNode);
            oldEndCell.classList.remove('end');
            this.endNode.isEnd = false;
        }

        this.endNode = node;
        node.isEnd = true;
        const cell = this.getCellElement(node);
        cell.className = 'grid-cell';
        cell.classList.add('end');
    }

    toggleWall(node) {
        if (node.isStart || node.isEnd) return;
        console.log("Placing a wall at ", node.row, node.col);
        
        node.isWall = !node.isWall;
        const cell = this.getCellElement(node);
        
        const existingClasses = Array.from(cell.classList).filter(cls => 
            cls !== 'wall' && cls !== 'grid-cell'
        );
        
        cell.className = 'grid-cell';
        existingClasses.forEach(cls => cell.classList.add(cls));
        
        if (node.isWall) {
            cell.classList.add('wall');
        }
    }

    eraseNode(node) {
        // Do not erase start or end nodes
        if (node.isStart || node.isEnd) {
            return;
        }
        node.isWall = false;

        const cell = this.getCellElement(node);
        cell.className = 'grid-cell';
    }

    getCellElement(node) {
        return this.container.querySelector(`[data-row="${node.row}"][data-col="${node.col}"]`);
    }

    reset() {
        // this.startNode = null;
        // this.endNode = null;
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const node = this.grid[row][col];
                node.reset();
                const cell = this.getCellElement(node);
                cell.className = 'grid-cell';
            }
        }
    }

    clearWalls() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const node = this.grid[row][col];
                if (node.isWall) {
                    node.isWall = false;
                    const cell = this.getCellElement(node);
                    cell.classList.remove('wall');
                }
            }
        }
    }

    clearWallsOnly() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const node = this.grid[row][col];
                if (node.isWall) {
                    node.isWall = false;
                    const cell = this.getCellElement(node);
                    cell.classList.remove('wall');
                }
            }
        }
    }

    clearPath() {
        const ANIMATION_DURATION = 300; // ms, must match CSS
        const cellsToClear = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const node = this.grid[row][col];
                if (node.isVisited || node.isPath) {
                    node.isVisited = false;
                    node.isPath = false;
                    const cell = this.getCellElement(node);
                    cell.classList.add('disappear');
                    cellsToClear.push(cell);
                }
            }
        }
        setTimeout(() => {
            for (const cell of cellsToClear) {
                cell.classList.remove('visited', 'path', 'disappear');
                cell.style.opacity = '';
                cell.style.transform = '';
            }
        }, ANIMATION_DURATION);
    }

    syncNodeState(row, col, nodeState) {
        const node = this.grid[row][col];
        const cell = this.getCellElement(node);

        node.isWall = false;
        node.isStart = false;
        node.isEnd = false;
        cell.className = 'grid-cell';

        if (nodeState.isStart) {
            this.setStartNode(node);
        } else if (nodeState.isEnd) {
            this.setEndNode(node);
        } else if (nodeState.isWall) {
            node.isWall = true;
            cell.classList.add('wall');
        }
    }

    setRandomWalls(density = 0.25, seed = null) {
        // Seeded random generator for reproducibility
        let random = Math.random;
        if (seed !== null) {
            let s = seed;
            random = function() {
                // Simple LCG for reproducible randomness
                s = Math.imul(48271, s) | 0 % 2147483647;
                return ((s & 2147483647) / 2147483647);
            };
        }
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const node = this.grid[row][col];
                if (!node.isStart && !node.isEnd) {
                    node.isWall = random() < density;
                    const cell = this.getCellElement(node);
                    if (node.isWall) {
                        cell.classList.add('wall');
                    } else {
                        cell.classList.remove('wall');
                    }
                }
            }
        }
    }
}

