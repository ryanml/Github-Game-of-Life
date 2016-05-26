// ==UserScript==
// @name        Github's Game of Life
// @namespace   https://github.com/ryanml
// @description Plays Conways' Game of Life with user's Github activity
// @include     https://github.com/ryanml*
// @version     1
// @grant       GM_addStyle
// ==/UserScript==
(function() {
  // Constant hex values
  const INACTIVE_HEX = '#eeeeee';
  const ACTIVE_HEX_ARR = ['#d6e685', '#8cc665', '#44a340', '#1e6823'];
  // Interval by default is 200ms
  var IT_INTERVAL = 200;
  // Gets the <rect> wrapper tag <g> elements
  var columns = document.getElementsByTagName('g');
  var colDepth = 7;
  var play = false;
  var colorize = false;
  var generationCount = 0;
  var fillColumnGaps = fillGaps();
  var ui = buildUI();
  var grid = buildGrid();
  var fillGrid = fillGrid();
  // Builds grid of appropriate length
  function buildGrid() {
    var grid = [];
    for (col = 0; col < columns.length - 1; col++) {
      grid.push([]);
    }
    return grid;
  }
  // Fills grid with initial states
  function fillGrid() {
    for (var y = 0; y < colDepth; y++) {
      for (var k = 1; k < columns.length; k++) {
        var x = k - 1;
        var cell = columns[k].children[y];
        cell.addEventListener('click', clickUpdateCell);
        cell.id = x + ',' + y;
        // If cell is default color (Not filled) push 0 to the grid, else 1
        var active = cell.getAttribute('fill') == INACTIVE_HEX ? 0 : 1;
        grid[x].push(active);
      }
    }
  }
  // Click event function for play/pause button. Starts and stops execution of the algorithm
  function controlSim() {
    if (!play) {
      this.id = 'pause';
      this.innerHTML = 'Pause';
      play = true;
      loop = setInterval(checkGrid, IT_INTERVAL);
    }
    else {
      this.id = 'play';
      this.innerHTML = 'Play';
      play = false;
      clearInterval(loop);
    }
  }
  // Applies one sweep of the algorithm to the grid
  function step() {
    if (!play) {
      checkGrid();
    }
  }
  // Sets all cells to dead (0)
  function clearGrid() {
    for (var x = 0; x < grid.length; x++) {
      for (var y = 0; y < grid[x].length; y++) {
        updateCellAt(x, y, grid[x][y] = 0);
      }
    }
    generationCount = 0;
    updateLiveCellCount();
    updateGenerationCount();
  }
  // Updates the interval on change of the range input
  function updateInterval() {
    IT_INTERVAL = this.value == 0 ? ((this.value + 1) * 10) : (this.value * 10);
    // If animation is playing, set new interval loop
    if (play) {
      clearInterval(loop);
      loop = setInterval(checkGrid, IT_INTERVAL);
    }
    document.getElementById('icc').innerHTML = IT_INTERVAL;
  }
  // Returns the number of live cells in the grid
  function updateLiveCellCount() {
    var liveCellNum = 0;
    for (var x = 0; x < grid.length; x++) {
      for (var y = 0; y < grid[x].length; y++) {
        if (grid[x][y] == 1) {
          liveCellNum++;
        }
      }
    }
    document.getElementById('lcc').innerHTML = liveCellNum;
  }
  // Updates the generation count in control panel
  function updateGenerationCount() {
    document.getElementById('gcc').innerHTML = generationCount;
  }
  // Loops through grid and applies Conway's algorithm to cells
  function checkGrid() {
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
          updateLiveCellCount();
        }
      }
      generationCount++;
      updateGenerationCount();
  }
  // Checks neighbors
  function getNumNeighbors(x, y) {
    // All possible coordinates of neighbors
    var fullCoords = [[x-1,y-1],[x,y-1],[x+1,y-1],[x+1,y],[x+1,y+1],[x,y+1],[x-1,y+1],[x-1,y]];
    var neighborCells = [];
    // Checks to make sure the coordinates aren't out of bounds, if not, push to neighborCells
    for (var f = 0; f < fullCoords.length; f++) {
      if (fullCoords[f][0] >= 0 && fullCoords[f][0] <= (grid.length - 1)
          && fullCoords[f][1] >= 0 && fullCoords[f][1] <= colDepth - 1) {
        neighborCells.push(grid[fullCoords[f][0]][fullCoords[f][1]]);
      }
    }
    // Adds neighBorCell values via reduce, each live cell is represented by 1
    return neighborCells.reduce((c, p) => c + p);
  }
  // Updates the <rect> markup at given coordinates
  function updateCellAt(x, y, newState) {
     var cell = document.getElementById(x + ',' + y);
     var stateHex = newState == 0 ? INACTIVE_HEX : genRandomHex();
     cell.setAttribute('fill', stateHex);
  }
  // Given a click event on the cell, sets grid at cell to opposite stateHex
  function clickUpdateCell() {
    var slc = this.id.split(',');
    var x = slc[0], y = slc[1];
    grid[x][y] = grid[x][y] == 0 ? 1 : 0;
    updateCellAt(x, y, grid[x][y]);
    updateLiveCellCount();
   }
   // Generates/gets the appropriate random hex value
   function genRandomHex() {
     var chars = 'ABCDEF0123456789';
     var hex = '#';
     if (!colorize) {
       return ACTIVE_HEX_ARR[Math.floor(Math.random() * ACTIVE_HEX_ARR.length)];
     }
     else {
       for (var n = 0; n < 6; n++) {
         hex += chars[Math.floor(Math.random() * chars.length)];
       }
       return hex;
     }
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
    GM_addStyle(" .calendar-graph.days-selected rect.day { opacity: 1 !important; } " +
                " .gol-span { display: inline-block; width: 125px; margin: 0px 7px; } " +
                " .gol-button { margin: 0px 5px; width: 55px; height: 35px; border-radius: 5px; color: #ffffff; font-weight:bold; } " +
                " .gol-button:focus { outline: none; } " +
                " #play { background: #66ff33; border: 2px solid #208000; } " +
                " #pause { background: #ff4d4d; border: 2px solid #cc0000; } " +
                " #step { background: #0066ff; border: 2px solid #003380; } " +
                " #clear { background: #e6e600; border: 2px solid #b3b300; } " +
                " #gol-range-span { width: 190px; } " +
                " #gol-range-lbl { margin-right: 5px; } " +
                " #gol-range { vertical-align:middle; width: 100px; } ");
    // Contributions tab will be the parent div
    var contribs = document.getElementsByClassName('contributions-tab')[0];
    var contAct = document.getElementsByClassName('js-contribution-activity')[0];
    contAct.style.display = 'none';
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
    // Play/pause button
    var stButton = document.createElement('button');
    stButton.innerHTML = 'Play';
    stButton.className = 'gol-button';
    stButton.id = 'play';
    stButton.addEventListener('click', controlSim);
    // Step button
    var stepButton = document.createElement('button');
    stepButton.innerHTML = 'Step';
    stepButton.className = 'gol-button';
    stepButton.id = 'step';
    stepButton.addEventListener('click', step);
    // Clear button
    var clearButton = document.createElement('button');
    clearButton.innerHTML = 'Clear';
    clearButton.className = 'gol-button';
    clearButton.id = 'clear';
    clearButton.addEventListener('click', clearGrid);
    // Displays number of live cells
    var liveCellSpan = document.createElement('span');
    liveCellSpan.className = 'gol-span';
    liveCellSpan.innerHTML = '<strong>Live Cell Count: </strong><span id="lcc"></span>';
    // Displays cycle count
    var genCountSpan = document.createElement('span');
    genCountSpan.className = 'gol-span';
    genCountSpan.style = 'width:105px';
    genCountSpan.innerHTML = '<strong>Generation: </strong><span id="gcc">0</span>';
    // Range input for interval adjustment
    var rangeSpan = document.createElement('span');
    rangeSpan.className = 'gol-span';
    rangeSpan.id = 'gol-range-span';
    var rangeLabel = document.createElement('span');
    rangeLabel.id = 'gol-range-lbl';
    rangeLabel.innerHTML = '<strong>Int (ms): </strong><span id="icc">200</span>'
    var rangeInput = document.createElement('input');
    rangeInput.type = 'range';
    rangeInput.id = 'gol-range';
    // Default value 20 (for 200ms)
    rangeInput.value = 20;
    rangeInput.addEventListener('change', updateInterval);
    rangeSpan.appendChild(rangeLabel);
    rangeSpan.appendChild(rangeInput);
    // Checkbox for colorize
    var colorCheck = document.createElement('input');
    colorCheck.type = 'checkbox';
    colorCheck.style = 'vertical-align:middle';
    colorCheck.addEventListener('change', function() {
      colorize = this.checked ? true : false;
    });
    // Assemble
    contPanel.appendChild(stButton);
    contPanel.appendChild(stepButton);
    contPanel.appendChild(clearButton);
    contPanel.appendChild(liveCellSpan);
    contPanel.appendChild(genCountSpan);
    contPanel.appendChild(rangeSpan);
    contPanel.appendChild(colorCheck);
    golCont.appendChild(title);
    golCont.appendChild(contPanel);
    contribs.insertBefore(golCont, contAct);
  }
})();
