// ==UserScript==
// @name        Github's Game of Life
// @namespace   https://github.com/ryanml
// @description Plays Conways' Game of Life with user's Github activity
// @include     https://github.com/ryanml*
// @version     1
// @grant       GM_addStyle
// ==/UserScript==
(function() {
  // For now limit iterations to 500
  var MAX_ITERATIONS = 500;
  var INC = 0;
  // Grid updates every 150 ms
  var IT_INTERVAL = 150;
  // Constant hex values
  var INACTIVE_HEX = '#eeeeee';
  var ACTIVE_HEX = '#1e6823';
  // Gets the <rect> wrapper tag <g> elements
  var columns = document.getElementsByTagName('g');
  var colDepth = 7;
  var fillColumnGaps = fillGaps();
  var ui = buildUI();
  var grid = buildGrid();
  var gridWidth = grid.length - 1;
  var gridHeight = colDepth;
  for (var y = 0; y < colDepth; y++) {
    for (var k = 1; k < columns.length; k++) {
      var x = k - 1;
      var cell = columns[k].getElementsByTagName('rect')[y];
      cell.addEventListener('click', clickUpdateCell);
      // If cell is default color (Not filled) push 0 to the grid, else 1
      var active = cell.getAttribute('fill') == INACTIVE_HEX ? 0 : 1;
      cell.id = x + ',' + y;
      grid[x].push(active);
    }
  }
  // Grid checking interval
  var check = setInterval(checkGrid, IT_INTERVAL);
  // Loops through grid and applies Conway's algorithm to cells
  function checkGrid() {
    if (INC < MAX_ITERATIONS) {
      for (var x = 0; x < grid.length; x++) {
        for (var y = 0; y < grid[x].length; y++) {
          var isAlive = grid[x][y] == 1 ? true : false;
          var nC = getNumNeighbors(x, y);
          if (isAlive && nC < 2) {
            grid[x][y] = 0;
          }
          else if (isAlive && nC == 2 || nC == 3) {
            grid[x][y] = 1;
          }
          else if (isAlive && nC > 3) {
            grid[x][y] = 0;
          }
          else if (!isAlive && nC == 3) {
            grid[x][y] = 1;
          }
          updateCellAt(x, y, grid[x][y]);
        }
      }
      INC++;
   }
   else {
     // Stops checking after maximum interval has been reached
     clearInterval(check);
   }
  }
  // Checks neighbors
  function getNumNeighbors(x, y) {
    // All possible coordinates of neighbors
    var fullCoords = [[x-1,y-1],[x,y-1],[x+1,y-1],[x+1,y],[x+1,y+1],[x,y+1],[x-1,y+1],[x-1,y]];
    var neighborCells = [];
    // Checks to make sure the coordinates aren't out of bounds, if not, push to neighborCells
    for (var f = 0; f < fullCoords.length; f++) {
      if (fullCoords[f][0] >= 0 && fullCoords[f][0] <= gridWidth
          && fullCoords[f][1] >= 0 && fullCoords[f][1] <= colDepth - 1) {
        neighborCells.push(grid[fullCoords[f][0]][fullCoords[f][1]]);
      }
    }
    // Adds neighBorCell values via reduce, each live cell is represented by 1
    var sum = neighborCells.reduce((c, p) => c + p);
    return sum;
  }
  // Updates the <rect> markup at given coordinates
  function updateCellAt(x, y, newState) {
     var cell = document.getElementById(x + ',' + y);
     var stateHex = newState == 0 ? INACTIVE_HEX : ACTIVE_HEX;
     cell.setAttribute('fill', stateHex);
  }
  // Given a click event on the cell, sets grid at cell to opposite stateHex
  function clickUpdateCell() {
    var slc = this.id.split(',');
    var x = slc[0];
    var y = slc[1];
    var newState = grid[x][y] == 0 ? 1 : 0;
    grid[x][y] = newState;
    updateCellAt(x, y, newState);
   }
  // Builds grid of appropriate length
  function buildGrid() {
    var grid = [];
    for (col = 0; col < columns.length - 1; col++) {
      grid.push([]);
    }
    return grid;
  }
  // Fills gaps in the markup
  function fillGaps() {
    var fCol = columns[1];
    var fCellNo = (colDepth - fCol.children.length);
    var lCol = columns[columns.length - 1];
    var lCellNo = (colDepth - lCol.children.length);
    var cellMarkup = '<rect style="display:none" fill="' + INACTIVE_HEX + '"></rect>'
    for (f = 0; f < fCellNo; f++) {
      fCol.innerHTML = (cellMarkup + fCol.innerHTML);
    }
    for (l = 0; l < lCellNo; l++) {
      lCol.innerHTML += cellMarkup;
    }
  }
  // Builds UI and adds it to the document.
  function buildUI() {
    // Appends needed <style> to <head>
    GM_addStyle(".calendar-graph.days-selected rect.day { opacity: 1 !important; } " +
                "span { margin: 0px 10px; }" +
                ".golBut { margin: 0px 5px; width: 60px; }");
    // Contributions tab will be the parent div
    var contribs = document.getElementsByClassName('contributions-tab')[0];
    var contAct = document.getElementsByClassName('js-contribution-activity')[0];
    // Control panel container
    var golCont = document.createElement('div');
    golCont.className = 'boxed-group flush';
    // Title element
    var title = document.createElement('h3');
    title.innerHTML = "Github's Game of Life Control Panel";
    // Control panel div
    var contPanel = document.createElement('div');
    contPanel.className = 'boxed-group-inner';
    contPanel.style = 'padding:10px';
    // Buttons and info
    var playButton = document.createElement('button');
    playButton.innerHTML = 'play';
    playButton.className = 'golBut';
    var stepButton = document.createElement('button');
    stepButton.innerHTML = 'step';
    stepButton.className = 'golBut';
    var clearButton = document.createElement('button');
    clearButton.innerHTML = 'clear';
    clearButton.className = 'golBut';
    var liveCellSpan = document.createElement('span');
    liveCellSpan.innerHTML = '<strong>Live Cell Count:</strong>';
    var genSpan = document.createElement('span');
    genSpan.innerHTML = '<strong>Generation #:</strong>';
    // Assemble
    contPanel.appendChild(playButton);
    contPanel.appendChild(stepButton);
    contPanel.appendChild(clearButton);
    contPanel.appendChild(liveCellSpan);
    contPanel.appendChild(genSpan);
    golCont.appendChild(title);
    golCont.appendChild(contPanel);
    contribs.insertBefore(golCont, contAct);
  }
})();
