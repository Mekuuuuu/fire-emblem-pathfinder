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

        // Set initial placement mode and button state
        this.setPlacementMode('start');
        document.getElementById('placeStart').classList.add('selected');

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
                'slow': 50,
                'medium': 20,
                'fast': 5
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

        // Find path button
        document.getElementById('findPath').addEventListener('click', () => {
            if (this.isRunning) return;
            this.findPath();
        });

        // Clear walls button
        document.getElementById('clearWalls').addEventListener('click', () => {
            this.dijkstraGrid.clearWalls();
            this.astarGrid.clearWalls();
        });

        // Synchronize interactions between grids
        this.dijkstraGrid.container.addEventListener('mousedown', (e) => {
            if (!e.target.classList.contains('grid-cell')) return;
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            if (this.isRunning) {
                this.dijkstra.cancelRequested = true;
                this.astar.cancelRequested = true;
                this.dijkstraGrid.clearPath();
                this.astarGrid.clearPath();
                this.isRunning = false;
                if (this.dijkstraGrid.placementMode === 'start') {
                    this.dijkstraGrid.setStartNode(this.dijkstraGrid.grid[row][col]);
                    this.astarGrid.setStartNode(this.astarGrid.grid[row][col]);
                } else if (this.dijkstraGrid.placementMode === 'end') {
                    this.dijkstraGrid.setEndNode(this.dijkstraGrid.grid[row][col]);
                    this.astarGrid.setEndNode(this.astarGrid.grid[row][col]);
                }
            }
            this.handleGridInteraction(this.dijkstraGrid, row, col);
        });

        this.astarGrid.container.addEventListener('mousedown', (e) => {
            if (!e.target.classList.contains('grid-cell')) return;
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            if (this.isRunning) {
                this.dijkstra.cancelRequested = true;
                this.astar.cancelRequested = true;
                this.dijkstraGrid.clearPath();
                this.astarGrid.clearPath();
                this.isRunning = false;
                if (this.astarGrid.placementMode === 'start') {
                    this.dijkstraGrid.setStartNode(this.dijkstraGrid.grid[row][col]);
                    this.astarGrid.setStartNode(this.astarGrid.grid[row][col]);
                } else if (this.astarGrid.placementMode === 'end') {
                    this.dijkstraGrid.setEndNode(this.dijkstraGrid.grid[row][col]);
                    this.astarGrid.setEndNode(this.astarGrid.grid[row][col]);
                }
            }
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
            document.getElementById('placeWall')
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
        // Store current placement mode
        const currentMode = this.dijkstraGrid.placementMode;

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

        // Restore placement mode
        this.setPlacementMode(currentMode);
    }
}

// Initialize the visualizer when the page loads
window.addEventListener('load', () => {
    const visualizer = new PathfindingVisualizer();
    
    // Set initial grid size to 15x15
    document.getElementById('gridSize').value = '15';
    visualizer.gridSize = 15;
    visualizer.resetGrids();
    
    // After a short delay, change to 10x10
    setTimeout(() => {
        document.getElementById('gridSize').value = '10';
        visualizer.gridSize = 10;
        visualizer.resetGrids();
        
        // Set placement mode to start
        visualizer.setPlacementMode('start');
        document.getElementById('placeStart').classList.add('selected');
    }, 100);
}); 