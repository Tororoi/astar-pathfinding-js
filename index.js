//-----------------------------Map Generator Canvas------------------------------//
//Set onscreen canvas and its context
let onScreenCVS = document.querySelector(".map");
let onScreenCTX = onScreenCVS.getContext("2d");

//Create an offscreen canvas. This is where we will actually be drawing, 
//in order to keep the image consistent and free of distortions.
let offScreenCVS = document.createElement('canvas');
let offScreenCTX = offScreenCVS.getContext("2d");

//Set Tile Size
let tileSize = 16;
//Set the dimensions of the drawing canvas
offScreenCVS.width = 32;
offScreenCVS.height = 20;

//Create an Image with a default source of the existing onscreen canvas
let img = new Image;
let source = offScreenCVS.toDataURL();

//Add event listeners for the mouse moving, downclick, and upclick
onScreenCVS.addEventListener('mousemove', handleMouseMove);
onScreenCVS.addEventListener('mousedown', handleMouseDown);
onScreenCVS.addEventListener('mouseup', handleMouseUp);

//We only want the mouse to move if the mouse is down, so we need a 
//variable to disable drawing while the mouse is not clicked.
let clicked = false;

function handleMouseMove(e) {
    if (clicked) {
        draw(e)
        // generateMap();
    }
}

function handleMouseDown(e) {
    clicked = true;
    draw(e);
    // generateMap();
}

function handleMouseUp() {
    clicked = false;
}

//Helper functions

//Draw a single pixel on the canvas. Get the ratio of the difference in 
//size of the on and offscreen canvases to calculate where to draw on the 
//offscreen canvas based on the coordinates of clicking on the onscreen canvas.
function draw(e) {
    let ratio = onScreenCVS.width/offScreenCVS.width;
    if (offScreenCTX.fillStyle === "rgba(0, 0, 0, 0)") {
        offScreenCTX.clearRect(Math.floor(e.offsetX/ratio),Math.floor(e.offsetY/ratio),1,1);
    } else if (offScreenCTX.fillStyle === "#ffa500") {
        let imageData = offScreenCTX.getImageData(0,0,offScreenCVS.width,offScreenCVS.height);
        for (let i=0; i<imageData.data.length; i+=4) {
            let x = i/4%offScreenCVS.width, y = (i/4-x)/offScreenCVS.width;
            let color = `rgba(${imageData.data[i]}, ${imageData.data[i+1]}, ${imageData.data[i+2]}, ${imageData.data[i+3]})`
            //Clear other pixels of same color
            if (color === "rgba(255, 165, 0, 255)") {
                offScreenCTX.clearRect(x,y,1,1);
            }
        }
        //Draw pixel
        offScreenCTX.fillRect(Math.floor(e.offsetX/ratio),Math.floor(e.offsetY/ratio),1,1);
    } else if (offScreenCTX.fillStyle === "#0000ff") {
        let imageData = offScreenCTX.getImageData(0,0,offScreenCVS.width,offScreenCVS.height);
        for (let i=0; i<imageData.data.length; i+=4) {
          let x = i/4%offScreenCVS.width, y = (i/4-x)/offScreenCVS.width;
          let color = `rgba(${imageData.data[i]}, ${imageData.data[i+1]}, ${imageData.data[i+2]}, ${imageData.data[i+3]})`
          //Clear other pixels of same color
          if (color === "rgba(0, 0, 255, 255)") {
              offScreenCTX.clearRect(x,y,1,1);
          }
        }
        //Draw pixel
        offScreenCTX.fillRect(Math.floor(e.offsetX/ratio),Math.floor(e.offsetY/ratio),1,1);
    } else {
        offScreenCTX.fillRect(Math.floor(e.offsetX/ratio),Math.floor(e.offsetY/ratio),1,1);
    }
    //Set the source of the image to the offscreen canvas
    source = offScreenCVS.toDataURL();
    renderImage();
}

//Once the image is loaded, draw the image onto the onscreen canvas.
function renderImage() {
    img.onload = () => {
      //Prevent blurring
      onScreenCTX.imageSmoothingEnabled = false;
      onScreenCTX.clearRect(0,0,onScreenCVS.width,onScreenCVS.height);
      onScreenCTX.drawImage(img,0,0,onScreenCVS.width,onScreenCVS.height)
      onScreenCTX.fillStyle = "black";
      generateMap();
    }
    img.src = source;
}

//-------------------------------Palette----------------------------------//
let palette = document.querySelector('.color-select');

palette.addEventListener('click', selectColor)

function selectColor(e) {
  offScreenCTX.fillStyle = e.target.id;
  palette.childNodes.forEach(c => {
    if (c.childNodes[1]) {
      if (c.childNodes[1].id === e.target.id) {
        c.childNodes[1].className = "swatch-selected";
      } else {
        c.childNodes[1].className = "swatch";
      }
    } 
  });
}
//-------------------------------Output-----------------------------------//
let steps = document.querySelector('.steps');

//----------------------------Calc Functions------------------------------//
//********* Calculate gCost ***********//
let calcGCost = calcPath;
//Calculate path distance
function calcPath(node) {
    let curr = node;
    let cost = 0;
    while(curr.parent) {
        let step = Math.floor(euclid(curr,curr.parent)*100)/100;
        cost += step;
        curr = curr.parent;   
    }
    return cost;
}
//********* Calculate hCost ***********//
//node1 is current node, node2 is end node
let calcHCost = octile;
//Manhattan Distance (without diagonal movement)
function manhattan(node1, node2) {
    let a = Math.abs(node1.x - node2.x);
    let b = Math.abs(node1.y - node2.y);
    return a+b;
}
//Octile Distance (with diagonal movement)
function octile(node1, node2) {
    let a = Math.abs(node1.x - node2.x);
    let b = Math.abs(node1.y - node2.y);
    function leastSide() {
        if (a > b) {return b;} else {return a;}
    }
    let diagonalCost = Math.floor(leastSide()*Math.sqrt(2)*100)/100;
    let horizontalCost = Math.abs(b-a);
    return diagonalCost+horizontalCost;
}
//Euclidean Distance (with diagonal movement)
function euclid(node1, node2) {
    return Math.hypot(node1.x - node2.x,node1.y - node2.y);
}
//********* fCost Tie Breakers using hCost ***********//
let tieBreak = noBreak;
//Tiebreak with cross product to favor paths closer to a straight line to the goal
function crossBreak(node) {
    let dx1 = node.x - end.x;
    let dy1 = node.y - end.y;
    let dx2 = start.x - end.x;
    let dy2 = start.y - end.y;
    let cross = Math.abs(dx1*dy2 - dx2*dy1);
    return cross*0.001;
}
//Prioritize closest to goal
function proximBreak(node) {
    //dwarf gCost
    return calcHCost(node, end)*10;
}
//No Tie Break
function noBreak(node) {
    return 0;
}
//************* Calc fCost **************//
let calcFCost = sumCost;
//Simple sum
function sumCost(g, h) {
    return g + h;
}
//Ignore gCost
function ignoreG(g, h) {
    return h;
}
//************* Rank fCost **************//
//Rank by fCost, then hCost if equal.
function compareFCost(obj1,obj2) {
    if (obj1.fCost === obj2.fCost) {
        if (obj1.hCost > obj2.hCost) {
            return 1;
        } else {
            return -1;
        }
    } else if (obj1.fCost > obj2.fCost) {
        return 1;
    } else if (obj1.fCost < obj2.fCost) {
        return -1;
    }
    return 0;
}
//--------------------------------Grid------------------------------------//
let gameGrid = [];
//walls list for drawing during pathfinding steps
let walls = [];

function generateMap(e) {
  let imageData = offScreenCTX.getImageData(0,0,offScreenCVS.width,offScreenCVS.height);
  //Make the 2D array to hold all objects
  for (let i=0; i<offScreenCVS.height; i++) {
      gameGrid[i] = [];
      for (let j=0; j<offScreenCVS.width; j++) {
        gameGrid[i][j] = {parent: null, type: "free", x: j, y: i, gCost: 0, hCost: 0, fCost: 0}
        onScreenCTX.beginPath();
        onScreenCTX.rect(j*tileSize, i*tileSize, tileSize, tileSize);
        onScreenCTX.stroke();
      }
  }
  //Reset walls
  walls = [];
  //Iterate through pixels and make objects each time a color matches
  for (let i=0; i<imageData.data.length; i+=4) {
    let x = i/4%offScreenCVS.width, y = (i/4-x)/offScreenCVS.width;
    let color = `rgba(${imageData.data[i]}, ${imageData.data[i+1]}, ${imageData.data[i+2]}, ${imageData.data[i+3]})`
    switch(color) {
      case "rgba(0, 0, 0, 255)":
        //black pixel
        gameGrid[y][x].type = "wall";
        walls.push(gameGrid[y][x])
        break;
      case "rgba(255, 165, 0, 255)":
        //orange pixel
        gameGrid[y][x].type = "start";
        start = gameGrid[y][x];
        break;
      case "rgba(0, 0, 255, 255)":
        //blue pixel
        gameGrid[y][x].type = "end";
        end = gameGrid[y][x];
        break;
      default: 
        //transparent pixel
    }
  }
}
//------------------------------Pathfinder-------------------------------//
let start = {};
let end = {};

function findPath() {
    //Search
    //Priority queue
    let open = new Set();
    open.add(start);
    start.gCost = 0;
    start.hCost = calcHCost(start, end)+tieBreak(start);
    start.fCost = start.gCost+start.hCost;
    //empty set
    let closed = new Set();
    let current = start;

    //Draw Path
    function drawPath(path,delay) {
        let pathIndex = 0;
        function recursor() {
            let tile = path[pathIndex]
            onScreenCTX.fillStyle = "pink"
            onScreenCTX.fillRect(tile.x*tileSize+1,tile.y*tileSize+1,tileSize-2,tileSize-2)
            pathIndex+=1;
            if (pathIndex < path.length) {setTimeout(recursor, delay)}
        }
        recursor();
    }
    //Draw tempPath
    function drawTempPath(path) {
        let pathIndex = 0;
        function recursor() {
            let tile = path[pathIndex]
            onScreenCTX.fillStyle = "rgba(229, 124, 255, 255)"
            onScreenCTX.fillRect(tile.x*tileSize+1,tile.y*tileSize+1,tileSize-2,tileSize-2)
            pathIndex+=1;
            if (pathIndex < path.length) {recursor()}
        }
        recursor();
    }
    let stepCount = 0;
    steps.textContent = 0;
    // while (open.size>0&&stop<100) {
    recursiveLoop();
    function recursiveLoop() {
        stepCount += 1;
        steps.textContent = stepCount;
        //-------------------------Draw Progress------------------------//
        onScreenCTX.clearRect(0,0,512,320)
        for (let i=0; i<offScreenCVS.height; i++) {
            for (let j=0; j<offScreenCVS.width; j++) {
              onScreenCTX.beginPath();
              onScreenCTX.rect(j*tileSize, i*tileSize, tileSize, tileSize);
              onScreenCTX.stroke();
            }
        }
        walls.forEach(w => {
            onScreenCTX.fillStyle = "black";
            onScreenCTX.fillRect(w.x*tileSize+1,w.y*tileSize+1,tileSize-2,tileSize-2);
        })
        open.forEach(n => {
            onScreenCTX.fillStyle = "green";
            onScreenCTX.fillRect(n.x*tileSize+1,n.y*tileSize+1,tileSize-2,tileSize-2);
            onScreenCTX.fillStyle = "black";
            onScreenCTX.font = `${tileSize/2}px Arial`;
            onScreenCTX.fillText(Math.round(n.fCost*10)/10, n.x*tileSize,n.y*tileSize+(tileSize/2));
        });
        closed.forEach(n => {
            onScreenCTX.fillStyle = "red";
            onScreenCTX.fillRect(n.x*tileSize+1,n.y*tileSize+1,tileSize-2,tileSize-2);
            if (open.has(n)) {
                console.log("yellow")
                onScreenCTX.fillStyle = "yellow";
                onScreenCTX.fillRect(n.x*tileSize+1,n.y*tileSize+1,tileSize-2,tileSize-2);
            }
        })
        function progressPath() {
            let curr = current;
            let tempPath = [];
            while(curr.parent) {
                tempPath.push(curr);
                curr = curr.parent;
            }
            if (tempPath.length>1) {drawTempPath(tempPath.reverse())};
        }
        progressPath()
        onScreenCTX.fillStyle = "orange";
        onScreenCTX.fillRect(start.x*tileSize+1,start.y*tileSize+1,tileSize-2,tileSize-2);
        onScreenCTX.fillStyle = "blue";
        onScreenCTX.fillRect(end.x*tileSize+1,end.y*tileSize+1,tileSize-2,tileSize-2);
        onScreenCTX.fillStyle = "purple";
        onScreenCTX.fillRect(current.x*tileSize+1,current.y*tileSize+1,tileSize-2,tileSize-2);
        onScreenCTX.fillStyle = "black";
        onScreenCTX.fillText(Math.round(current.fCost*10)/10, current.x*tileSize,current.y*tileSize+(tileSize/2));
        //------------------------Drawing Done----------------------------//
        //Remove lowest fCost from open and add it to closed
        open.delete(current);
        closed.add(current);
        //End case
        if (current === end) {
            let curr = current;
            let tempPath = [];
            while(curr.parent) {
                tempPath.push(curr);
                curr = curr.parent;
            }
            //-------------------Draw Path-----------------------//
            let truePath = tempPath.reverse();
            drawPath(truePath, 50);
            return truePath;
        }
        //Eight neighbors
        let neighbors = [];
        let east,west,south,north,northeast,northwest,southeast,southwest;
        if (gameGrid[current.y][current.x+1]) {
            //east
            east = gameGrid[current.y][current.x+1];
            neighbors.push(east);
        }
        if (gameGrid[current.y][current.x-1]) {
            //west
            west = gameGrid[current.y][current.x-1];
            neighbors.push(west);
        }
        if (gameGrid[current.y+1]) {
            //south
            south = gameGrid[current.y+1][current.x];
            neighbors.push(south);
            if (gameGrid[current.y+1][current.x-1]) {
                //southwest
                southwest = gameGrid[current.y+1][current.x-1];
                neighbors.push(southwest);
            }
            if (gameGrid[current.y+1][current.x+1]) {
                //southeast
                southeast = gameGrid[current.y+1][current.x+1];
                neighbors.push(southeast);
            }
        }
        if (gameGrid[current.y-1]) {
            //north
            north = gameGrid[current.y-1][current.x];
            neighbors.push(north);
            if (gameGrid[current.y-1][current.x-1]) {
                //northwest
                northwest = gameGrid[current.y-1][current.x-1];
                neighbors.push(northwest);
            }
            if (gameGrid[current.y-1][current.x+1]) {
                //northeast
                northeast = gameGrid[current.y-1][current.x+1];
                neighbors.push(northeast);
            }
        }

        for (let i=0; i<neighbors.length; i++) {
            let neighbor = neighbors[i];
            if (neighbor.type === "wall" || closed.has(neighbor)) {
                continue;
            }
            //Check corners
            if (neighbor === northeast) {
                if ((north.type === "wall")&&(east.type === "wall")) {
                    continue;
                }
            }
            if (neighbor === northwest) {
                if ((north.type === "wall")&&(west.type === "wall")) {
                    continue;
                }
            }
            if (neighbor === southeast) {
                if ((south.type === "wall")&&(east.type === "wall")) {
                    continue;
                }
            }
            if (neighbor === southwest) {
                if ((south.type === "wall")&&(west.type === "wall")) {
                    continue;
                }
            }
            let tCost = Math.floor(euclid(neighbor,current)*100)/100;
            //For new tiles
            if (!(open.has(neighbor)||closed.has(neighbor))) {
                if (neighbor!=start) {neighbor.parent = current;}
                open.add(neighbor);
                //Round the costs to take care of floating point errors.
                neighbor.gCost = calcGCost(neighbor);
                neighbor.hCost = calcHCost(neighbor, end) + tieBreak(neighbor);
                neighbor.fCost = calcFCost(neighbor.gCost, neighbor.hCost);
            } else if (open.has(neighbor)&&neighbor.gCost > current.gCost+tCost) {
                if (neighbor!=start) {neighbor.parent = current;}
                neighbor.gCost = calcGCost(neighbor);
                neighbor.fCost = calcFCost(neighbor.gCost, neighbor.hCost);
            }
        }
        //make current lowest fCost
        let arr = [...open]
        arr.sort(compareFCost)
        current = arr[0]
        if (open.size>0) {setTimeout(recursiveLoop, 50)};
    }
    // }
}
//---------------------------Find Path-----------------------------//
let generateBtn = document.querySelector(".generate-btn")

generateBtn.addEventListener("click", drawPath);

generateMap();

function drawPath() {
    findPath();
}