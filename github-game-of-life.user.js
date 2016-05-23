// ==UserScript==
// @name        Github's Game of Life
// @namespace   https://github.com/ryanml
// @description Plays Conways' Game of Life with user's Github activity
// @include     https://github.com/ryanml*
// @version     1
// @grant       none
// ==/UserScript==
(function() {
  var columns = document.getElementsByTagName('g');
  var colDepth = 7;
  var fillColumnGaps = fillGaps();
  var grid = buildGrid();
  var inactiveHex = '#eeeeee';
  for (var c = 0; c < colDepth; c++) {
    for (var k = 1; k < columns.length; k++) {
      var x = k - 1;
      var y = c;
      var cell = columns[k].getElementsByTagName('rect')[c];
      // If cell is default color (Not filled) push 0 to the grid, else 1
      var active = cell.getAttribute('fill') == inactiveHex ? 0 : 1;
      cell.id = "x" + x + "y" + y;
      grid[x].push(active);
    }
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
    var cellMarkup = '<rect style="display:none" fill="#eeeeee"></rect>'
    for (f = 0; f < fCellNo; f++) {
      fCol.innerHTML = (cellMarkup + fCol.innerHTML);
    }
    for (l = 0; l < lCellNo; l++) {
      lCol.innerHTML += cellMarkup;
    }
  }
})();
