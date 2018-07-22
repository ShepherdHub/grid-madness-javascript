/*************************************************************************
*   Definitions
* ---------------
* Grid: 
* The grid represents the possible spaces that an agent or an obstacle can occupy.
* These spaces are called points and the position of the points is called a coordinate.
* The grid is the abstracted field upon which the agent will explore. A 10x10 grid has
* 10 rows and 10 columns of points. The grid state will be sent to the back end to compute
* the path.
*
* Board:
* The board represents the space on the html5 canvas upon which the grid is laid. The units
* of the board are called pixels. The location of a pixel is called it's position. The board
* represents the elements that are drawn onto the canvas. It is only a front end concept
* used to draw on the canvas.
*************************************************************************/

const boardLength = 500;
const gridSize = 10;
const spaceLength = boardLength / gridSize;
const boardOffset = 5.5; // The board is 5 pixels off from the actual 0,0 point of the canvas
let canvas = document.getElementById("canvas-grid");
let ctx = canvas.getContext("2d");
let obstacles = [];
const startPoint = { x: 0, y: 0 };
const endPoint = { x: 9, y: 9 };
let pathPoints = [];

function init() {
  window.requestAnimationFrame(draw);
};

function draw() {
  clearBoard();
  drawGridLines();
  drawStart();
  drawEnd();
  drawObstacles();
};

function clearBoard() {
  ctx.clearRect(0, 0, 510, 510);
};

function drawGridLines() {
  const start = boardOffset;
  const end = boardLength + boardOffset;
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;

  // Draw Horizontal lines
  for(let y = start; y <=end; y += spaceLength) {
    ctx.beginPath();
    ctx.moveTo(start,y);
    ctx.lineTo(end,y);
    ctx.stroke();
  }

  // Draw Vertical lines
  for(let x = start; x <=end; x += spaceLength) {
    ctx.beginPath();
    ctx.moveTo(x,start);
    ctx.lineTo(x,end);
    ctx.stroke();
  }
};

function drawStart() {
  ctx.fillStyle = 'rgba(0, 97, 255, .5)';
  ctx.fillRect(boardOffset + 0.5, boardOffset + 0.5, spaceLength - 1, spaceLength - 1);
};

function drawEnd() {
  ctx.fillStyle = 'rgba(255, 0, 0, .5)';
  ctx.fillRect(
    boardLength + boardOffset + 0.5 - spaceLength, 
    boardLength + boardOffset + 0.5 - spaceLength,
    spaceLength - 1, 
    spaceLength - 1
  );
};

function drawObstacles() {
  ctx.fillStyle = 'darkgray';
  obstacles.forEach(obstacle => {
    const startCornerX = obstacle.x * spaceLength + boardOffset + 0.5;
    const startCornerY = obstacle.y * spaceLength + boardOffset + 0.5;
    ctx.fillRect(startCornerX, startCornerY, spaceLength - 1, spaceLength - 1); 
  });
};

function drawPathLine() {
  ctx.strokeStyle = 'red';
  ctx.lineCap = 'round';
  ctx.lineWidth = 3;

  if(pathPoints.length > 1) {
    ctx.beginPath();

    for(let i = 1; i < pathPoints.length; i++) {
      pathTimeout(i);
    }
  }
};

function pathTimeout(i) {
  setTimeout(function() {
    const start = convertGridPointToCanvasPosition(pathPoints[i-1]);
    const end = convertGridPointToCanvasPosition(pathPoints[i]);
    ctx.moveTo(start.x + (spaceLength / 2), start.y + (spaceLength / 2));
    ctx.lineTo(end.x + (spaceLength / 2), end.y + (spaceLength / 2));
    ctx.stroke();
  }, i * 300);
};

function convertPixelPositionToGridPoint(pos) {
  const x = Math.floor(pos.x / spaceLength);
  const y = Math.floor(pos.y / spaceLength);
  return { x: x, y: y };
};

// Converts a point to a position located at the top left corner of that point's space
function convertGridPointToCanvasPosition(point) {
  const x = boardOffset + spaceLength * point.x;
  const y = boardOffset + spaceLength * point.y;
  return { x: x, y: y }
}

function togglePoint(point) {
  if(areEqualPoints(startPoint, point) || areEqualPoints(endPoint, point)) {
    return;
  }
  const index = obstacles.findIndex(obstacle => {
    return areEqualPoints(obstacle, point);
  });

  if(index === -1) {
    obstacles.push(point);
  } else {
    obstacles.splice(index, 1);
  }
};

function areEqualPoints(pointA, pointB) {
  return pointA.x === pointB.x && pointA.y === pointB.y;
};

function constructPostObject() {
  return JSON.stringify({
    size: gridSize,
    start: `(${startPoint.x},${startPoint.y})`,
    end: `(${endPoint.x},${endPoint.y})`,
    algorithm: document.getElementById('algorithm-select').value,
    obstacles: obstacles.map(p => `(${p.x},${p.y})`)
  }) 
}

function getPathPoints() {
  const data = constructPostObject()

  $.ajax({
    type: 'POST',
    url: 'http://localhost:5000/api/find_path',
    data: data,
    success: function(response){
      pathPoints = response.path.map(p => {
        return { x: p[0], y: p[1] }
      });
      window.requestAnimationFrame(drawPathLine);
    },
    dataType: 'json',
    contentType: 'application/json'
  })
};

function updatePathPoints(response) {
  pathPoints
}

// Event Listeners
canvas.addEventListener('click', function(e) {
  const point = convertPixelPositionToGridPoint(
    { x: e.offsetX - boardOffset, y: e.offsetY - boardOffset }
  );
  togglePoint(point);
  window.requestAnimationFrame(draw);
});

document.getElementById('draw-button').addEventListener('click', function() {
  window.requestAnimationFrame(draw);
  getPathPoints();
  // window.requestAnimationFrame(drawPathLine);
});

document.getElementById('clear-button').addEventListener('click', function() {
  window.requestAnimationFrame(draw);
});

// Materialize code to initialize select elements
document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems);
});

// Draw grid on start
init();