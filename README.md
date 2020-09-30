# A* Pathfinding Visualizer

Try it out [here](https://dreamy-cori-d15ae3.netlify.app/)!

This is a visualizer for A* (pronounced a-star) pathfinding algorithms. There are various settings that can be adjusted to change how the algorithm calculates the path.

## Draw a map

To make a map for the path to traverse, select a box in the palette to the right of the grid, then draw that color on the grid. You can draw as many walls as you want, but you may only draw one start point and one end point. Use the eraser to clear tiles.

### Generate Naive Maze

Generates a maze automatically, just for walls. Not guaranteed to be solvable and will likely have multiple paths from start to end. Can still be drawn on for custom changes.

### Generate Eller Maze

Generates a maze row by row, using Eller's Algorithm. Any two points in the maze can reach each other by a single path solution. Using a Manhattan heuristic or corner buffer, there's no reason to use A* pathfinding, as a greedy approach will find the same path (Ignore g(n)).

## Settings

### Corner Buffer
- If checked, this prevents diagonal movement around corners. Has no effect when used with Manhattan distance, since no diagonals are used with the Manhattan heuristic selected.

### Map Nodes
- If checked, not all free tiles will be marked as nodes. This means that any tile for which the path can only go in one direction will be automatically progressed in the algorithm.

### Sliders 
- Step Delay Slider: Adjusts the amount of time between steps of the algorithm. Given in milliseconds.
- Tile Size Slider: Adjusts the tile size in increments of powers of 2, from 8 to 64.
- Precision: Adjusts to what decimal place numbers are rounded when performing calculations. Due to floating point inconsistencies, less precision may produce better results. A precision lower than the path length will produce extreme results when used with tie breakers.

### Heuristic Options
These selections alter the way the estimated distance between any given tile and the end tile are calculated.
- Manhattan: The only choice for if you don't want diagonal movement. This is the sum of the horizontal plus vertical distance to the end.
- Octile: Calculates distance based on tile movement. This is the sum of straight lines and 45 degree lines to the end.
- Euclidean: Calculates the distance naively. Measures the exact distance from the tile to the end in one line.

### fCost Methods
These alter the way the total estimated path cost for any given tile is calculated.
- g(n) + h(n): Takes the time to find the shortest route.
- Ignore g(n): Also known as "Greedy Best First Search". Will find a path as fast as possible, but usually it's not the best path.

### Tie Breakers
This is for resorting otherwise equal estimated paths. The right tie breaker can reduce time complexity and/or make a nicer looking path.
- Cross Product: Favors tiles that are close to the direct line from start to end. 
- Proximity: Favors tiles that have a closer euclidean distance to the end.
- h(n): Favors the lowest heuristic distance.
- None: No tie breaker.