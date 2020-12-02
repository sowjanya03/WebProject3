
var puzzleContext = document.getElementById('puzzle').getContext('2d');
var imgSelect = document.getElementById('dropdown').value;
var width_ = document.getElementById('puzzle').width;
var tile_id = document.getElementById('scale').value;
var img = new Image();
var timer = 300;

var tile_size = width_ / tile_id;

var puzzle_tile = new Object;
puzzle_tile.x = 0;
puzzle_tile.y = 0;

var emptyLoc = new Object;
emptyLoc.x = 0;
emptyLoc.y = 0;

var solved = false;
var gamePos = new Object;

var mysound;

img.src = imgSelect;
img.addEventListener('load', configureGame, false);


gameTimer();
playMusic();
startGame();


function playMusic(){
  mySound = new sound("music.mp3");
}

//Set BGM 
function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
      this.sound.play();
  }
  this.stop = function(){
      this.sound.pause();
  }    
}

//Onchange of tiles size
document.getElementById('scale').onchange = function() {
  tile_id = this.value;
  tile_size = width_ / tile_id;
  startGame();
  configureGame();
};

//Onchange of background image
document.getElementById('dropdown').onchange = function() {
  img.src = this.value;
  startGame();
  configureGame();
};

document.getElementById('puzzle').onmousemove = function(e) {
  puzzle_tile.x = Math.floor((e.pageX - this.offsetLeft) / tile_size);
  puzzle_tile.y = Math.floor((e.pageY - this.offsetTop) / tile_size);
};

document.getElementById('puzzle').onclick = function() {
  if (calculateDistance(puzzle_tile.x, puzzle_tile.y, emptyLoc.x, emptyLoc.y) == 1) {
    shiftPos(emptyLoc, puzzle_tile);
    configureGame();
  }

  //Animation on game win
  if(solved){
    setTimeout(function() {window.location.replace("./winpage.html");}, 500);
    //window.location.replace("./winpage.html");
  }
};

function configureGame() {
  puzzleContext.clearRect ( 0 , 0 , width_ , width_ );
  for (var i = 0; i < tile_id; ++i) {
    for (var j = 0; j < tile_id; ++j) {
      var x = gamePos[i][j].x;
      var y = gamePos[i][j].y;
      if(i != emptyLoc.x || j != emptyLoc.y || solved == true) {
        puzzleContext.drawImage(img, x * tile_size, y * tile_size, tile_size, tile_size,
            i * tile_size, j * tile_size, tile_size, tile_size);
      }     
    }
  }
}

//Game Timer
function gameTimer(){
  var interval = setInterval(function() {
    document.getElementById('remaintime_div').innerHTML = --timer;
    if (timer <= 0)
    {
       document.getElementById('remaintime_div').innerHTML = "Game over";
       clearInterval(interval);
    }
    }, 1000);
}

//Shuffle and start
function startGame() {
 mySound.play();
  gamePos = new Array(tile_id);
  for (var i = 0; i < tile_id; ++i) {
    gamePos[i] = new Array(tile_id);
    for (var j = 0; j < tile_id; ++j) {
      gamePos[i][j] = new Object;
      gamePos[i][j].x = i;
      gamePos[i][j].y = j;
    }
  }
  setGame();
  checkEmpty();
  if (!isSolvable(tile_id, tile_id, emptyLoc.y + 1)) {
    if (emptyLoc.y == 0 && emptyLoc.x <= 1) {
      changeTiles(tile_id - 2, tile_id - 1, tile_id - 1, tile_id - 1);
    } else {
      changeTiles(0, 0, 1, 0);
    }
    checkEmpty();
  }
  solved = false;
}

//Set all the tiles
function setGame() {
  var i = tile_id * tile_id - 1;
  while (i > 0) {
    var j = Math.floor(Math.random() * i);
    var xi = i % tile_id;
    var yi = Math.floor(i / tile_id);
    var xj = j % tile_id;
    var yj = Math.floor(j / tile_id);
    changeTiles(xi, yi, xj, yj);
    --i;
  }
}

//On reset button click - re-shuffle
function resetBoard(event) {
  gameTimer().clearInterval();
  event.preventDefault();
  startGame();
  configureGame();
}

function changeTiles(i, j, k, l) {
  var temp = new Object();
  temp = gamePos[i][j];
  gamePos[i][j] = gamePos[k][l];
  gamePos[k][l] = temp;
}

function isSolvable(width, height, emptyRow) {
  if (width % 2 == 1) {
    return (calculateSum() % 2 == 0)
  } else {
    return ((calculateSum() + height - emptyRow) % 2 == 0)
  }
}

//Calculate the transitions
function calculateSum() {
  var inversions = 0;
  for (var j = 0; j < tile_id; ++j) {
    for (var i = 0; i < tile_id; ++i) {
      inversions += calculateTransitions(i, j);
    }
  }
  return inversions;
}

function calculateTransitions(i, j) {
  var inversions = 0;
  var tileNum = j * tile_id + i;
  var lastTile = tile_id * tile_id;
  var tileValue = gamePos[i][j].y * tile_id + gamePos[i][j].x;
  for (var q = tileNum + 1; q < lastTile; ++q) {
    var k = q % tile_id;
    var l = Math.floor(q / tile_id);

    var compValue = gamePos[k][l].y * tile_id + gamePos[k][l].x;
    if (tileValue > compValue && tileValue != (lastTile - 1)) {
      ++inversions;
    }
  }
  return inversions;
}

function checkEmpty() {
  for (var j = 0; j < tile_id; ++j) {
    for (var i = 0; i < tile_id; ++i) {
      if (gamePos[i][j].x == tile_id - 1 && gamePos[i][j].y == tile_id - 1) {
        emptyLoc.x = i;
        emptyLoc.y = j;
      }
    }
  }
}



//Calculate co-ordinate distances
function calculateDistance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

//Change the positions based on the cordinate locations
function shiftPos(toLoc, fromLoc) {
  console.log('gamePos', gamePos)
  if (!solved) {
    gamePos[toLoc.x][toLoc.y].x = gamePos[fromLoc.x][fromLoc.y].x;
    //console.log('gamePos[toLoc.x][toLoc.y].x = gamePos[fromLoc.x][fromLoc.y].x;', gamePos[toLoc.x][toLoc.y].x = gamePos[fromLoc.x][fromLoc.y].x)
    gamePos[toLoc.x][toLoc.y].y = gamePos[fromLoc.x][fromLoc.y].y;
    //console.log('gamePos[toLoc.x][toLoc.y].y = gamePos[fromLoc.x][fromLoc.y].y;', gamePos[toLoc.x][toLoc.y].y = gamePos[fromLoc.x][fromLoc.y].y)
    gamePos[fromLoc.x][fromLoc.y].x = tile_id - 1;
    //console.log('gamePos[fromLoc.x][fromLoc.y].x = tile_id - 1;', gamePos[fromLoc.x][fromLoc.y].x = tile_id - 1)
    gamePos[fromLoc.x][fromLoc.y].y = tile_id - 1;
    //console.log('gamePos[fromLoc.x][fromLoc.y].y = tile_id - 1;', gamePos[fromLoc.x][fromLoc.y].y = tile_id - 1)
    toLoc.x = fromLoc.x;
    //console.log('toLoc.x = fromLoc.x;', toLoc.x = fromLoc.x)
    toLoc.y = fromLoc.y;
    //console.log('toLoc.y = fromLoc.y;', toLoc.y = fromLoc.y)
    checkSolved();
  }
}

//Check if the game is solved
function checkSolved() {
  var flag = true;
  for (var i = 0; i < tile_id; ++i) {
    for (var j = 0; j < tile_id; ++j) {
      if (gamePos[i][j].x != i || gamePos[i][j].y != j) {
        flag = false;
      }
    }
  }
  solved = flag;
}







