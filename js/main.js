class PathfindingVisualizer {
    constructor() {
        this.gridSize = 10;
        this.speed = 50; // Default speed (medium)
        this.isRunning = false;

        // Initialize grids
        this.dijkstraGrid = new Grid('dijkstraGrid', this.gridSize);
        this.astarGrid = new Grid('astarGrid', this.gridSize);

        // Initialize algorithms
        this.dijkstra = new Dijkstra(this.dijkstraGrid);
        this.astar = new AStar(this.astarGrid);

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Grid size control
        document.getElementById('gridSize').addEventListener('change', (e) => {
            this.gridSize = parseInt(e.target.value);
            this.resetGrids();
        });

        // Speed control
        document.getElementById('speed').addEventListener('change', (e) => {
            const speedMap = {
                'slow': 100,
                'medium': 50,
                'fast': 20
            };
            this.speed = speedMap[e.target.value];
        });

        // Placement mode buttons
        document.getElementById('placeStart').addEventListener('click', () => {
            this.setPlacementMode('start');
        });

        document.getElementById('placeEnd').addEventListener('click', () => {
            this.setPlacementMode('end');
        });

        document.getElementById('placeWall').addEventListener('click', () => {
            this.setPlacementMode('wall');
        });

        document.getElementById('erase').addEventListener('click', () => {
            this.setPlacementMode('erase');
        });

        // Find path button
        document.getElementById('findPath').addEventListener('click', () => {
            if (this.isRunning) return;
            this.findPath();
        });

        // Clear grid button
        document.getElementById('clearGrid').addEventListener('click', () => {
            this.dijkstraGrid.clearWallsOnly();
            this.astarGrid.clearWallsOnly();
        });

        // Random Walls button
        document.getElementById('randomWalls').addEventListener('click', () => {
            // Use a random integer seed for both grids
            const seed = Math.floor(Math.random() * 2147483647);
            this.dijkstraGrid.setRandomWalls(0.25, seed);
            this.astarGrid.setRandomWalls(0.25, seed);
        });

        // Synchronize interactions between grids
        this.dijkstraGrid.container.addEventListener('mousedown', (e) => {
            if (!e.target.classList.contains('grid-cell')) return;
            if (this.isRunning) {
                this.dijkstra.cancelRequested = true;
                this.astar.cancelRequested = true;
                this.dijkstraGrid.clearPath();
                this.astarGrid.clearPath();
                this.isRunning = false;
                return;
            }
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            this.handleGridInteraction(this.dijkstraGrid, row, col);
        });

        this.astarGrid.container.addEventListener('mousedown', (e) => {
            if (!e.target.classList.contains('grid-cell')) return;
            if (this.isRunning) {
                this.dijkstra.cancelRequested = true;
                this.astar.cancelRequested = true;
                this.dijkstraGrid.clearPath();
                this.astarGrid.clearPath();
                this.isRunning = false;
                return;
            }
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            this.handleGridInteraction(this.astarGrid, row, col);
        });

        // Synchronize mouseover events
        this.dijkstraGrid.container.addEventListener('mouseover', (e) => {
            if (!this.dijkstraGrid.isMouseDown || !e.target.classList.contains('grid-cell')) return;
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            this.handleGridInteraction(this.dijkstraGrid, row, col);
        });

        this.astarGrid.container.addEventListener('mouseover', (e) => {
            if (!this.astarGrid.isMouseDown || !e.target.classList.contains('grid-cell')) return;
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            this.handleGridInteraction(this.astarGrid, row, col);
        });

        // Add logic to clear path on grid click after animation
        this.enableAutoClearPathOnClick();
    }

    setPlacementMode(mode) {
        this.dijkstraGrid.setPlacementMode(mode);
        this.astarGrid.setPlacementMode(mode);
        // Visually mark the selected button
        const buttons = [
            document.getElementById('placeStart'),
            document.getElementById('placeEnd'),
            document.getElementById('placeWall'),
            document.getElementById('erase')
        ];
        buttons.forEach(btn => btn.classList.remove('selected'));
        switch (mode) {
            case 'start':
                document.getElementById('placeStart').classList.add('selected');
                break;
            case 'end':
                document.getElementById('placeEnd').classList.add('selected');
                break;
            case 'wall':
                document.getElementById('placeWall').classList.add('selected');
                break;
            case 'erase':
                document.getElementById('erase').classList.add('selected');
                break;
        }
    }

    handleGridInteraction(grid, row, col) {
        const mode = grid.placementMode;
        const node = grid.grid[row][col];
        const otherGrid = grid === this.dijkstraGrid ? this.astarGrid : this.dijkstraGrid;

        // Handle the interaction in the current grid
        switch (mode) {
            case 'start':
                grid.setStartNode(node);
                break;
            case 'end':
                grid.setEndNode(node);
                break;
            case 'wall':
                grid.toggleWall(node);
                break;
            case 'erase':
                grid.eraseNode(node);
                break;
        }

        // Sync the state to the other grid
        const nodeState = {
            isStart: node.isStart,
            isEnd: node.isEnd,
            isWall: node.isWall
        };
        otherGrid.syncNodeState(row, col, nodeState);
    }

    enableAutoClearPathOnClick() {
        const clearPathIfNeeded = (grid) => {
            let shouldClear = false;
            for (let row = 0; row < grid.size; row++) {
                for (let col = 0; col < grid.size; col++) {
                    const node = grid.grid[row][col];
                    if (node.isPath || node.isVisited) {
                        shouldClear = true;
                        break;
                    }
                }
                if (shouldClear) break;
            }
            if (shouldClear) {
                this.dijkstraGrid.clearPath();
                this.astarGrid.clearPath();
            }
        };
        this.dijkstraGrid.container.addEventListener('mousedown', () => clearPathIfNeeded(this.dijkstraGrid));
        this.astarGrid.container.addEventListener('mousedown', () => clearPathIfNeeded(this.astarGrid));
    }

    async findPath() {
        this.isRunning = true;
        
        // Run both algorithms simultaneously
        const dijkstraPromise = this.dijkstra.findPath(this.speed);
        const astarPromise = this.astar.findPath(this.speed);
        
        await Promise.all([dijkstraPromise, astarPromise]);
        
        this.isRunning = false;
        // After animation, enable auto-clear on click
        this.enableAutoClearPathOnClick();
    }

    resetGrids() {
        // Clear existing grids
        this.dijkstraGrid.container.innerHTML = '';
        this.astarGrid.container.innerHTML = '';

        // Reinitialize grids
        this.dijkstraGrid = new Grid('dijkstraGrid', this.gridSize);
        this.astarGrid = new Grid('astarGrid', this.gridSize);

        // Reinitialize algorithms
        this.dijkstra = new Dijkstra(this.dijkstraGrid);
        this.astar = new AStar(this.astarGrid);

        // Reattach event listeners
        this.setupEventListeners();
    }
}

// Initialize the visualizer when the page loads
window.addEventListener('load', () => {
    new PathfindingVisualizer();
}); 