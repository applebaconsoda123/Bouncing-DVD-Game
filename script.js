/* script.js */
const canvas = document.getElementById("gameCanvas");
canvas.width = 800;
canvas.height = 600;
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");

// Initialize game variables
let dvdLogo;
let initialsArray = [];
let inputActive = false;
let gameStarted = false;
let inputBox;
let clickCount = 0;

// Load DVD logo image
const dvdImage = new Image();
dvdImage.crossOrigin = "anonymous"; // Add this line
dvdImage.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/DVD-Video_Logo.svg/2560px-DVD-Video_Logo.svg.png";

dvdImage.addEventListener("load", () => {
  // Start game
  dvdLogo = new DvdLogo();
  gameLoop();
});

// Create DVD logo object
class DvdLogo {
  constructor() {
    this.x = Math.random() * (canvas.width - 100);
    this.y = Math.random() * (canvas.height - 30);
    this.vx = 0.25;
    this.vy = 0.25;
    this.color = this.randomColor();
    this.width = 100;
    this.height = 30;
  }

  randomColor() {
    const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // DvdLogo draw method
  draw() {
    // Create an offscreen canvas for rendering the image with transparent white pixels
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = this.width;
    offscreenCanvas.height = this.height;
    const offscreenCtx = offscreenCanvas.getContext("2d");

    offscreenCtx.drawImage(dvdImage, 0, 0, this.width, this.height);

    // Get image data
    const imageData = offscreenCtx.getImageData(0, 0, this.width, this.height);
    const data = imageData.data;

    // Loop through all pixels
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Check if the pixel color is black
      if (r === 0 && g === 0 && b === 0) {
        // Set the black pixel to the logo color
        const rgb = this.hexToRgb(this.color);
        data[i] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
      } else if (r === 255 && g === 255 && b === 255) {
        // Set the white pixel to transparent
        data[i + 3] = 0;
      }
    }

    // Put updated image data back onto the offscreen canvas
    offscreenCtx.putImageData(imageData, 0, 0);

    // Draw the offscreen canvas onto the main canvas
    ctx.drawImage(offscreenCanvas, this.x, this.y, this.width, this.height);
  }

  // Helper function to convert hex color to RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x <= 0 || this.x + this.width >= canvas.width) {
      this.vx = -this.vx;
      this.color = this.randomColor();
    }

    if (this.y <= 0 || this.y + this.height >= canvas.height) {
      this.vy = -this.vy;
      this.color = this.randomColor();
    }
  }
}

// Create Initials object
class Initials {
  constructor(text, x, y) {
    this.text = text;
    this.x = parseFloat(x);
    this.y = parseFloat(y);
    this.deleted = false;
    this.color = this.randomColor(); // Assign random color to initials
  }

  randomColor() {
    const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  draw() {
    ctx.font = "16px Comic Sans MS";
    ctx.fillStyle = this.color; // Use the initials color
    ctx.fillText(this.text, this.x, this.y);
  }

  isColliding(logo) {
    const logoWidth = logo.width;
    const logoHeight = logo.height;
    const initialsWidth = ctx.measureText(this.text).width;
    const initialsHeight = 16;

    const logoRect = {
      x: logo.x,
      y: logo.y,
      width: logoWidth,
      height: logoHeight
    };

    const initialsRect = {
      x: this.x,
      y: this.y - initialsHeight,
      width: initialsWidth,
      height: initialsHeight
    };

    return (
      logoRect.x < initialsRect.x + initialsRect.width &&
      logoRect.x + logoRect.width > initialsRect.x &&
      logoRect.y < initialsRect.y + initialsRect.height &&
      logoRect.y + logoRect.height > initialsRect.y
    );
  }

  update(logo) {
    if (!this.deleted && this.isColliding(logo)) {
      this.deleted = true;
    }
  }
}

// Initialize input box for initials
const createInputBox = (x, y) => {
  inputBox = document.createElement("input");
  inputBox.type = "text";
  inputBox.maxLength = 2;
  inputBox.style.position = "absolute";
  inputBox.style.left = `${x}px`;
  inputBox.style.top = `${y}px`;
  document.body.appendChild(inputBox);
  inputBox.focus();
  inputBox.addEventListener("keyup", handleInput);
};

// Handle input validation
const handleInput = (event) => {
  if (event.key === "Enter") {
    const initials = inputBox.value.toUpperCase();
    if (initials.match(/^[A-Za-z]{2}$/)) {
      initialsArray.push(new Initials(initials, inputBox.style.left, inputBox.style.top));
      document.body.removeChild(inputBox);
      inputActive = false;
      clickCount++;
    }
  }
};

// Handle mouse click
canvas.addEventListener("click", (event) => {
  if (!gameStarted && !inputActive && clickCount < 20) {
    const canvasBounds = canvas.getBoundingClientRect();
    const x = event.clientX - canvasBounds.left;
    const y = event.clientY - canvasBounds.top;
    inputActive = true;
    createInputBox(x, y);
  }
});

// Handle start button click
startButton.addEventListener("click", () => {
  gameStarted = true;
  startButton.style.display = "none";
});

// Main game loop
const gameLoop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Only draw and update DVD logo if the game has started
  if (gameStarted) {
    dvdLogo.draw();
    dvdLogo.update();
  }

  initialsArray.forEach((initials, index) => {
    initials.draw();

    if (gameStarted) {
      initials.update(dvdLogo);

      if (initials.deleted) {
        initialsArray.splice(index, 1);
      }
    }
  });

  let winnerDeclared = false;

  const resetGame = () => {
    winnerDeclared = false;
    gameStarted = false;
    inputActive = false;
    clickCount = 0;
    initialsArray = [];
    startButton.style.display = "block";
  };

  if (gameStarted && initialsArray.length === 1 && !winnerDeclared) {
    alert(`${initialsArray[0].text} has won the game!`);
    winnerDeclared = true;
    resetGame();
  }

  requestAnimationFrame(gameLoop);
};

// Start game
dvdLogo = new DvdLogo();
gameLoop();