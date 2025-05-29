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
            
            if (!node) return;

            if (this.placementMode === 'start') {
                if (node.isStart) {
                    this.draggedNode = { type: 'start', node };
                } else if (!node.isEnd) {
                    this.setStartNode(node);
                }
            } else if (this.placementMode === 'end') {
                if (node.isEnd) {
                    this.draggedNode = { type: 'end', node };
                } else if (!node.isStart) {
                    this.setEndNode(node);
                }
            } else if (this.placementMode === 'wall') {
                this.toggleWall(node);
            }
        });

        this.container.addEventListener('mouseover', (e) => {
            if (!e.target.classList.contains('grid-cell')) return;
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            const targetNode = this.grid[row][col];
            if (!targetNode) return;

            if (this.draggedNode) {
                if (this.draggedNode.type === 'start' && !targetNode.isEnd) {
                    this.setStartNode(targetNode);
                } else if (this.draggedNode.type === 'end' && !targetNode.isStart) {
                    this.setEndNode(targetNode);
                }
            } else if (this.isMouseDown) {
                if (this.placementMode === 'wall') {
                    this.toggleWall(targetNode);
                } else if (this.placementMode === 'start' && !targetNode.isEnd) {
                    this.setStartNode(targetNode);
                } else if (this.placementMode === 'end' && !targetNode.isStart) {
                    this.setEndNode(targetNode);
                }
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

    setStartNode(node) {
        if (!node || node.isEnd) return;
        
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
        if (!node || node.isStart) return;
        
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

    getCellElement(node) {
        if (!node) return null;
        return this.container.querySelector(`[data-row="${node.row}"][data-col="${node.col}"]`);
    }

    reset() {
        this.startNode = null;
        this.endNode = null;
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const node = this.grid[row][col];
                node.reset();
                const cell = this.getCellElement(node);
                cell.className = 'grid-cell';
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

    toggleWall(node) {
        // Don't allow walls on start or end nodes
        if (!node || node.isStart || node.isEnd) return;
        
        node.isWall = !node.isWall;
        const cell = this.getCellElement(node);
        if (!cell) return;
        
        if (node.isWall) {
            cell.classList.add('wall');
        } else {
            cell.classList.remove('wall');
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

    syncNodeState(row, col, nodeState) {
        const node = this.grid[row][col];
        const cell = this.getCellElement(node);

        if (nodeState.isStart) {
            this.setStartNode(node);
        } else if (nodeState.isEnd) {
            this.setEndNode(node);
        } else if (nodeState.isWall) {
            node.isWall = true;
            cell.classList.add('wall');
        } else {
            node.isWall = false;
            cell.classList.remove('wall');
        }
    }
}
