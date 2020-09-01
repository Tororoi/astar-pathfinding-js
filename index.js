//-----------------------------Map Generator Canvas------------------------------//
//Set onscreen canvas and its context
let onScreenCVS = document.querySelector(".map");
let onScreenCTX = onScreenCVS.getContext("2d");

//Create an offscreen canvas. This is where we will actually be drawing, 
//in order to keep the image consistent and free of distortions.
let offScreenCVS = document.createElement('canvas');
let offScreenCTX = offScreenCVS.getContext("2d");

//Set the dimensions of the drawing canvas
offScreenCVS.width = 16;
offScreenCVS.height = 10;

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

//-------------------------------ToolBox----------------------------------//
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
//--------------------------------Grid------------------------------------//
let gameGrid = [];
let walls = [];

function generateMap(e) {
  let imageData = offScreenCTX.getImageData(0,0,offScreenCVS.width,offScreenCVS.height);
  //Make the 2D array to hold all objects
  for (let i=0; i<offScreenCVS.height; i++) {
      gameGrid[i] = [];
      for (let j=0; j<offScreenCVS.width; j++) {
        gameGrid[i][j] = {parent: null, type: "free", x: j, y: i, gCost: 0, hCost: 0, fCost: 0}
        onScreenCTX.beginPath();
        onScreenCTX.rect(j*32, i*32, 32, 32);
        onScreenCTX.stroke();
      }
  }
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
    //Set current Tile
    if (this.currentTile != start) {
        this.previousTile = this.currentTile;
        this.currentTile = start;
    }
    //Search
    //calculate cost
    function getDistance(x1,y1,x2,y2) {
        return Math.hypot(x1-x2,y1-y2);
    }
    //Priority queue
    let open = new Set();
    open.add(start);
    start.gCost = 0;
    start.hCost = getDistance(start.x,start.y,end.x,end.y);
    start.fCost = start.gCost+start.hCost;
    //empty set
    let closed = new Set();
    let stop = 0
    let current = start;
    // while (open.size>0&&stop<100) {
    recursiveLoop();
    function recursiveLoop() {
        stop+=1;
        //Make a list from open set
        // console.log("step",stop)
        // console.log("open set", open)
        //Get lowest fCost for processing
        //Grab open Node with lowest fCost to process next
        function compareFCost(obj1,obj2) {
            if (obj1.fCost > obj2.fCost) {
                return 1;
            } else {
                return -1;
            }
        }
        onScreenCTX.clearRect(0,0,512,320)
        for (let i=0; i<offScreenCVS.height; i++) {
            for (let j=0; j<offScreenCVS.width; j++) {
              onScreenCTX.beginPath();
              onScreenCTX.rect(j*32, i*32, 32, 32);
              onScreenCTX.stroke();
            }
        }
        walls.forEach(w => {
            onScreenCTX.fillStyle = "black";
            onScreenCTX.fillRect(w.x*32+1,w.y*32+1,30,30);
        })
        open.forEach(n => {
            onScreenCTX.fillStyle = "green";
            onScreenCTX.fillRect(n.x*32+1,n.y*32+1,30,30);
            onScreenCTX.fillStyle = "black";
            onScreenCTX.font = "12px Arial";
            onScreenCTX.fillText(Math.round(n.fCost*10)/10, n.x*32,n.y*32+16);
        });
        closed.forEach(n => {
            onScreenCTX.fillStyle = "red";
            onScreenCTX.fillRect(n.x*32+1,n.y*32+1,30,30);
        })
        onScreenCTX.fillStyle = "orange";
        onScreenCTX.fillRect(start.x*32+1,start.y*32+1,30,30);
        onScreenCTX.fillStyle = "blue";
        onScreenCTX.fillRect(end.x*32+1,end.y*32+1,30,30);
        onScreenCTX.fillStyle = "purple";
        onScreenCTX.fillRect(current.x*32+1,current.y*32+1,30,30);
        // console.log("current",current)
        //Remove lowest fCost from open and add it to closed
        open.delete(current);
        closed.add(current);
        //End case
        // console.log("end",end)
        if (current === end) {
            let curr = current;
            let path = [];
            let n = 0;
            while(curr.parent&&n<30) {
                path.push(curr);
                curr = curr.parent;
                n+=1;
            }
            path.reverse().forEach(t => {
                onScreenCTX.fillStyle = "pink"
                onScreenCTX.fillRect(t.x*32+1,t.y*32+1,30,30)
            })
            return path.reverse();
        }
        //Eight neighbors
        let neighbors = [];
        if (gameGrid[current.y][current.x+1]) {
            //east
            neighbors.push(gameGrid[current.y][current.x+1]);
        }
        if (gameGrid[current.y][current.x-1]) {
            //west
            neighbors.push(gameGrid[current.y][current.x-1]);
        }
        if (gameGrid[current.y+1]) {
            //south
            neighbors.push(gameGrid[current.y+1][current.x]);
            if (gameGrid[current.y+1][current.x-1]) {
                //southwest
                neighbors.push(gameGrid[current.y+1][current.x-1]);
            }
            if (gameGrid[current.y+1][current.x+1]) {
                //southeast
                neighbors.push(gameGrid[current.y+1][current.x+1]);
            }
        }
        if (gameGrid[current.y-1]) {
            //north
            neighbors.push(gameGrid[current.y-1][current.x]);
            if (gameGrid[current.y-1][current.x-1]) {
                //northwest
                neighbors.push(gameGrid[current.y-1][current.x-1]);
            }
            if (gameGrid[current.y-1][current.x+1]) {
                //northeast
                neighbors.push(gameGrid[current.y-1][current.x+1]);
            }
        }

        let cost = current.hCost;

        for (let i=0; i<neighbors.length; i++) {
            let neighbor = neighbors[i];
            if (neighbor.type === "wall"||closed.has(neighbor)) {
                continue;
            }
            neighbor.gCost = getDistance(neighbor.x,neighbor.y,start.x,start.y);
            neighbor.hCost = getDistance(neighbor.x,neighbor.y,end.x,end.y);
            neighbor.fCost = neighbor.gCost+neighbor.hCost;
            if (open.has(neighbor)&&neighbor.hCost > cost) {
                open.delete(neighbor);
                closed.add(neighbor);
            }
            if (open.has(neighbor)&&neighbor.hCost < cost) {
                open.delete(neighbor);
            }
            if (closed.has(neighbor)&&neighbor.hCost < cost) {
                closed.delete(neighbor);
            }
            //For new tiles
            if (!(open.has(neighbor)||closed.has(neighbor))) {
                if (!neighbor.parent&&neighbor!=start) {neighbor.parent = current;}
                cost = neighbor.hCost;
                open.add(neighbor);
            }
        }
        //make current lowest fCost
        let arr = [...open]
        arr.sort(compareFCost)
        current = arr[0]
        if (stop<100&&open.size>0) {setTimeout(recursiveLoop, 1000)};
    }
    // }
}

//---------------------------Find Path-----------------------------//
let generateBtn = document.querySelector(".generate-btn")

generateBtn.addEventListener("click", drawPath);

function drawPath() {
    let path = findPath();
    // if (path) {
    //     path.forEach(t => {
    //         onScreenCTX.fillStyle = "pink"
    //         onScreenCTX.fillRect(t.x*32+1,t.y*32+1,30,30)
    //     })
    // }
}