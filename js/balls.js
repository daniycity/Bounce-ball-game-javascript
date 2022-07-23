/**
 * @file: main.js 
 * @author: Daniele Pagano, Andrea Zappa, Federico Pasquali, Rodrigo Ramos
 * Simple game using canvas
 * 
 * All the functions for animating, transforming and managing the events of the single/all balls
 * of this website. More information about this project on readme.md
*/

//Creation of all the variables
//Canvas variables
let canvas = document.getElementById("gameCanvas");
let canvasAuxiliary = document.getElementById("auxiliaryCanvas");
let ctx = canvas.getContext("2d");
let ctx1 = canvasAuxiliary.getContext("2d");
let canvasPos = getPosition(canvas);

//Other html elements (except) canvas
let textSpeedArea = document.getElementById("text");
let randomColorButton = document.getElementById("randomColor");
let selectedColor = document.getElementById("selectedColor");
let playAndPause = document.getElementById("playAndPause");
let counterBall = document.getElementById("ballCounter");
let clearStageButton = document.getElementById("clearStage");
let increaseSizeNewBall = document.getElementById("increaseSizeNewBall");
let decreaseSizeNewBall = document.getElementById("decreaseSizeNewBall");
let increaseSizeAllBall = document.getElementById("increaseSizeAllBall");
let decreaseSizeAllBall = document.getElementById("decreaseSizeAllBall");
let sliderGravity = document.getElementById("sliderGravity");
let sizeCounter = document.getElementById("sizeCounter");
let activeTrail = document.getElementById("activeTrail");

//Ball variables
let gravity = 0.25;
let friction = 0.98;
let ballColor = selectedColor.value; //Black will be the default color for the ball
let speedMultiplier = 0.1; //Can't be 0 or the ball will not move on canvas
let balls = []; //An array to hold the balls created on mouse click
let ballRadius = 10; //Or size

//Mouse variables
let mouseX = 0;
let mouseY = 0;

function Ball(x, y) {
  this.color = ballColor;
  this.bounce = 0.9;
  this.radius = ballRadius;
  this.velX = 2 * speedMultiplier;
  this.velY = 2 * speedMultiplier;
  this.x = mouseX;
  this.y = mouseY;
}

Ball.prototype = {
  draw: function () {
    //Draw the ball
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  },
  update: function () {
    if (putInPause()) {
      this.x = this.x;
      this.y = this.y;
    } else {
      //Floor
      if (this.y + this.radius >= canvas.height) {
        this.velY *= -this.bounce;
        this.y = canvas.height - this.radius;
        this.velX *= friction;
      }
      //Ceiling
      if (this.y - this.radius <= 0) {
        this.velY *= -this.bounce;
        this.y = this.radius;
        this.velX *= friction;
      }
      //Left bound
      if (this.x - this.radius <= 0) {
        this.velX *= -this.bounce;
        this.x = this.radius;
      }
      //Right bound
      if (this.x + this.radius >= canvas.width) {
        this.velX *= -this.bounce;
        this.x = canvas.width - this.radius;
      }
      //Reset so the ball doesn't roll
      if (this.velX < 0.01 && this.velX > -0.01) {
        this.velX = 0;
      }
      if (this.velY < 0.01 && this.velY > -0.01) {
        this.velY = 0;
      }
      //Update position
      this.velY += gravity;
      this.x += this.velX;
      this.y += this.velY;
    }
  },
};
/* All the addEventListener */
//Events for windows
window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", resizeCanvas);
//Events for UI
canvas.addEventListener("mousemove", setMousePosition, false);
canvas.addEventListener("mousemove", speedCounter, false);
canvas.addEventListener("click", addNewBall);
selectedColor.addEventListener("change", colorPickerChange);
document.getElementById("randomColor").addEventListener("click", randomColorActive);
playAndPause.addEventListener("click", putInPause);
clearStageButton.addEventListener("click", removeAllBall);
increaseSizeNewBall.addEventListener("click", increaseSizeSingleBall);
decreaseSizeNewBall.addEventListener("click", decreaseSizeSingleBall);
increaseSizeAllBall.addEventListener("click", increaseSizeMultipleBall);
decreaseSizeAllBall.addEventListener("click", decreaseSizeMultipleBall);
sliderGravity.addEventListener("change", updateGravity);
activeTrail.addEventListener("click", isActiveTrail);
//Events for keyboard
document.addEventListener("keydown", checkKey);

/* All the functions 
 *
 * Take the contex of an auxiliary canvas and draw a circle given the current position
 * of the various balls.
*/
let trailPositions=[];
let y=0;
function drawTrail(){ 
    y++;
    for(let i=0;i<balls.length;i++){
        ctx1.beginPath();
        ctx1.fillStyle = balls[i].color;
        ctx1.arc(balls[i].x, balls[i].y, balls[i].radius, 0, Math.PI * 2);
        ctx1.fill();
        trailPositions[y] = {
            x: balls[i].x,
            y: balls[i].y,
            size: balls[i].radius
        };
    }
    if(y > 5){
        ctx1.clearRect(
            trailPositions[1].x -trailPositions[1].size, 
            trailPositions[1].y -trailPositions[1].size, 
            trailPositions[1].size +trailPositions[1].size,  
            trailPositions[1].size +trailPositions[1].size
        );
        trailPositions.shift();
        y--;
    }
}

/*
 * Checks if the toogle Trail is active or not:
 * -In the first case sets an interval for drawing the trail
 * -Otherwise when the toggle is de-activated, it removes the interval
 * -Clears the auxiliary canvas
*/
let intervalTrail; //Auxiliary variables used only in isActiveTrail function()
function isActiveTrail(){
    if(activeTrail.checked){
        intervalTrail = setInterval(drawTrail,100)
    }else{
        clearInterval(intervalTrail);
        ctx1.clearRect(0, 0, canvas.width, canvas.height);
    }
}
/*
 * @param {event} javascript event to get the keyCode
 * Function that checks the key code assigned by javascript to different keyboards key
 * and executes the right fuction assigned.
*/
function checkKey(e) {
  switch (e.keyCode) {
    case 39: //ArrowLeft
      increaseSizeSingleBall();
      break;
    case 37: //ArrowRight
      decreaseSizeSingleBall();
      break;
    case 38: //ArrowUp
      increaseSizeMultipleBall();
      break;
    case 40: //ArrowDown
      decreaseSizeMultipleBall();
      break;
    case 87: //W key
      increaseSpeedMultipleBallKeyboard();
      break;
    case 83: //S key
      decreaseSpeedMultipleBallKeyboard();
      break;
  }
}

/*
 * Sets the gravity variables for the ball physics depending on the value
 * of the UI element
*/
function updateGravity() {
  gravity = parseInt(sliderGravity.value);
}
/*
 * Multiplies the velocity or "steps" of every ball by 2 to make it faster
*/
function increaseSpeedMultipleBallKeyboard() {
  for (let i = 0; i < balls.length; i++) {
    balls[i].velX = balls[i].velX * 2;
    balls[i].velY = balls[i].velY * 2;
  }
}
/*
 * Divides the velocity or "steps" of every ball by 2 to make it slower
*/
function decreaseSpeedMultipleBallKeyboard() {
  for (let i = 0; i < balls.length; i++) {
    balls[i].velX = balls[i].velX * 0.5;
    balls[i].velY = balls[i].velY * 0.5;
  }
}
/*
 * Takes the radius (size) of all the balls in the canvas and increases it
*/
function increaseSizeMultipleBall() {
  for (let i = 0; i < balls.length; i++) {
    balls[i].radius++;
  }
}
/*
 * Takes the radius (size) of all the balls in the canvas and decreases it
*/
function decreaseSizeMultipleBall() {
  for (let i = 0; i < balls.length; i++) {
    if (balls[i].radius > 1) {
      balls[i].radius--;
    }
  }
}
/*
 * Takes the radius (size) when creating a ball and increases it
*/
function increaseSizeSingleBall() {
  ballRadius++;
  sizeCounter.value = ballRadius;
}
/*
 * Takes the radius (size) when creating a ball and decreases it
*/
function decreaseSizeSingleBall() {
  if (ballRadius > 1) {
    ballRadius--;
  }
  sizeCounter.value = ballRadius;
}
/*
 * Empties the array
*/
function removeAllBall() {
  balls = [];
  counterBall.value = 0;
}
/*
 * Stop the movement of the balls returning either true or false
*/
function putInPause() {
  if (playAndPause.checked) {
    return true;
  }
  return false;
}
/*
 * Returns a position on the canvas
*/
function getPosition(el) {
  let xPosition = 0;
  let yPosition = 0;
  while (el) {
    xPosition += el.offsetLeft - el.scrollLeft + el.clientLeft;
    yPosition += el.offsetTop - el.scrollTop + el.clientTop;
    el = el.offsetParent;
  }
  return {
    x: xPosition,
    y: yPosition,
  };
}
/*
 * Sets a choosen color to the ball
*/
function colorPickerChange() {
  ballColor = selectedColor.value;
}
/*
 * Function used to get proportions for both contexts
*/
function resizeCanvas() {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  ctx1.canvas.width = window.innerWidth;
  ctx1.canvas.height = window.innerHeight;
}
/*
 * Updates the coordinates of the mouse
*/
function updateMouseFollow() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(mouseX, mouseY, 50, 0, 2 * Math.PI, true);
  ctx.fillStyle = "#FF6A6A";
  ctx.fill();
  requestAnimationFrame(updateMouseFollow);
}
/*
 * Moves the coordinates of the mouse
*/
function setMousePosition(e) {
  mouseX = e.clientX - canvasPos.x;
  mouseY = e.clientY - canvasPos.y;
}
/*
 * Pushes a newly created ball in the array
*/
function addNewBall() {
  if (randomColorActive()) ballColor = randomColor();
  else ballColor = selectedColor.value;
  balls.push(new Ball(mouseX, mouseY));
  textSpeedArea.value = "0";
  speedMultiplier = 0;
  repeatCounter = 0.1;
}
/*
 * Generates a random color
*/
function randomColor() {
  const rc1 = Math.random() * 16777215;
  const rc2 = Math.floor(rc1);
  const rc3 = rc2.toString(16);
  return "#" + rc3;
}
/*
 * Gets a random position from the canvas
*/
function randomPos() {
  let pos = {
    x: Math.floor(Math.random() * canvas.width),
    y: Math.floor(Math.random() * canvas.height),
  };
  return pos;
}
/*
 * Speed counter for the textarea
*/
let repeatCounter = 0.1;
let message = "";
function speedCounter() {
  if (repeatCounter === 0) {
    textSpeedArea.value = "";
  }
  repeatCounter++;
  if (repeatCounter == 2) {
    textSpeedArea.value = textSpeedArea.value.trim() + "\n";
  } else {
    textSpeedArea.value =
      textSpeedArea.value.slice(2, textSpeedArea.value.lastIndexOf("x") + 1) +
      Math.round(repeatCounter) +
      "\n";
  }
  speedMultiplier =
    textSpeedArea.value.slice(2, textSpeedArea.value.lastIndexOf("x") + 1) +
    Math.round(repeatCounter);
  parseInt(speedMultiplier);
}
/*
 * Checks if the random color switch is active or not 
*/
function randomColorActive() {
  if (randomColorButton.checked) {
    return true;
  }
  return false;
}
/*
 * Wipes and redraws everything for every ball 
*/
(function update() {
  //Clear the canvas and redraw everything
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < balls.length; i++) {
    counterBall.value = i + 1; //Update the value of the balls in the canvas
    balls[i].draw(); //This will draw the current ball
    balls[i].update(); //This will update its position
  }
  requestAnimationFrame(update);
})();
