// Get form, game container, and reset button elements
const gridSizeForm = document.getElementById("grid-size-form");
const gameContainer = document.getElementById("game-container");
const resetButton = document.getElementById("reset-button");
const startWindow = document.getElementById("start-window");
const backButton = document.getElementById("back-button");
const nameForm = document.getElementById("player-names-form");
const namePrompt = document.getElementById("name-prompt");

let playerChoice = 1;
let size = 0;
let player1Name = "P1";
let player2Name = "P2";

// Function to set the playerChoice to 1
function single() {
  playerChoice = 1;
  startWindow.style.display = "none";
  gridSizeForm.style.display = "block";
  backButton.style.display = "block";
}

// Function to set the playerChoice to 2
function double() {
  playerChoice = 2;
  startWindow.style.display = "none";
  gridSizeForm.style.display = "block";
  backButton.style.display = "block";
}

backButton.addEventListener("click", function () {
  // Go back one screen based on the current screen
  if (gridSizeForm.style.display == "block") {
    startWindow.style.display = "block";
    gridSizeForm.style.display = "none";
    backButton.style.display = "none";
  } else if (namePrompt.style.display == "block") {
    namePrompt.style.display = "none";
    gridSizeForm.style.display = "block";
  }
});

// Function to show the game grid with the selected grid size
function showGameGrid(gridSize) {
  // Hide the grid size form and show the game container
  gridSizeForm.style.display = "none";
  size = gridSize;
  // Call the function to start the game with the selected grid size based on playerChoice
  if (playerChoice === 1) {
    gameContainer.style.display = "block";
    startSingleGame(gridSize);
  } else if (playerChoice === 2) {
    namePrompt.style.display = "block";
  }
}

// Function to start the game with the specified grid size
function startSingleGame(gridSize) {
  // Inititalize the shield status
  let shieldActive = false;
  let shieldTurns = 0;
  backButton.style.display = "none";
  document.getElementById("score").style.display = "block";
  document.getElementById("double-score").style.display = "none";
  // Initialize game state
  let runScore = 0;
  let blocksRevealed = 0;
  let fielderPositions;
  if(gridSize!=10) fielderPositions = generateRandomPositions(gridSize, 2*gridSize-8);
  else fielderPositions = generateRandomPositions(gridSize,11);
  // Create game grid
  const gameGrid = document.getElementById("game-grid");
  gameGrid.innerHTML = "";
  gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  gameGrid.style.pointerEvents = "auto"; // Enable click events on the game grid

  // Add event listener to the game grid
  gameGrid.addEventListener("click", handleBlockClick);

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const block = document.createElement("div");
      block.classList.add("block");
      block.dataset.row = i;
      block.dataset.col = j;

      // Add a random chance for a block to give a score of two, four, six or shield-power-up
      if (Math.random() < 0.35) {
        block.dataset.score = 2;
      } else if (Math.random() < 0.14) {
        block.dataset.score = 4;
      } else if (Math.random() < 0.10) {
        block.dataset.score = 6;
      } else if (Math.random() < 0.06) {
        block.dataset.score = 10;
      } else {
        block.dataset.score = 1;
      }

      gameGrid.appendChild(block);
    }
  }

  // Function to handle block click event
  function handleBlockClick(event) {
    const clickedElement = event.target;
    // Check if the shield is active
    if (shieldTurns != 0) {
      shieldTurns -= 1;
      if (shieldTurns == 0) alert("Shield expired");
    } else {
      shieldActive = false;
    }
    // Check if the clicked element is a block
    if (!clickedElement.classList.contains("block")) {
      return; // Ignore click on non-block elements
    }

    // Get the clicked block as a variable
    const clickedBlock = clickedElement;
    const row = parseInt(clickedBlock.dataset.row);
    const col = parseInt(clickedBlock.dataset.col);
    const score = parseInt(clickedBlock.dataset.score);

    // Check if the block is already revealed
    if (clickedBlock.classList.contains("revealed")) {
      return; // Ignore click on revealed block
    }

    if (blocksRevealed === gridSize*gridSize) {
      //End the game in case the shield protects the players from all the fielders
      endGame(runScore);
    }

    if (fielderPositions.some((pos) => pos[0] === row && pos[1] === col)) {
      // Clicked on a block with a fielder

      clickedBlock.style.boxShadow = "1px 1px 1px red";
      clickedBlock.style.backgroundColor = "#def2c8";
      clickedBlock.style.backgroundSize = "cover";
      // If shield is active, then it is not out
      if (shieldActive) {
        alert("The shield protected you!");
        clickedBlock.style.backgroundImage = "url('./images/shield.png')";
        clickedBlock.classList.add("revealed");
        blocksRevealed+=1;
        clickedBlock.removeEventListener("click", handleBlockClick);
        shieldActive = false;
        shieldTurns = 0;
      } else {
        endGame(runScore);
        clickedBlock.style.backgroundImage = "url('./images/out.png')";
      }
    } else if (score != 10) {
      // Clicked on a block without a fielder
      clickedBlock.classList.add("revealed");
      blocksRevealed+=1;
      clickedBlock.removeEventListener("click", handleBlockClick);
      clickedBlock.style.backgroundColor = "#def2c8";
      clickedBlock.style.boxShadow = "1px 1px 1px green";
      runScore += score;
      document.getElementById("run-score").textContent = runScore;
      clickedBlock.textContent = score;
    } else {
      // Code for when the user clicks on a shield block
      shieldActive = true;
      shieldTurns = 4;
      alert("You got a shield for 3 turns!!");
      clickedBlock.classList.add("revealed");
      blocksRevealed+=1;
      clickedBlock.removeEventListener("click", handleBlockClick);
      clickedBlock.style.backgroundColor = "#def2c8";
      clickedBlock.style.boxShadow = "1px 1px 1px green";
      clickedBlock.style.backgroundSize = "cover";
      clickedBlock.style.backgroundImage = "url('./images/shield.png')";
    }
  }

  // Function to end the game and display the final score
  function endGame(score) {
    gameGrid.removeEventListener("click", handleBlockClick);
    gameGrid.style.pointerEvents = "none"; // Disable further clicks on the game grid
    resetButton.style.display = "block";
    alert(`Game over! Your final score is ${score}.`);
  }
}

nameForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent the default form submission behavior
  namePrompt.style.display = "none";
  // Get the entered player names
  player1Name = document.getElementById("player1-name").value;
  player2Name = document.getElementById("player2-name").value;

  // Update player names in the UI
  document.getElementById("player1-score").textContent = `${player1Name} : 0`;
  document.getElementById("player2-score").textContent = `${player2Name} : 0`;
  // Start the game using the entered names
  gameContainer.style.display = "block";
  startDoubleGame(size);
});

function startDoubleGame(gridSize) {
  // Initialize game state
  backButton.style.display = "none";
  document.getElementById("score").style.display = "none";
  document.getElementById("double-score").style.display = "block";
  document.getElementById("player1-score").style.textShadow = "1px 1px 1px #def2c8";
  document.getElementById("player2-score").style.textShadow = "0px 0px 0px #F7F18A";
  let currentPlayer = 1;
  let p1out = false;
  let p2out = false;
  let p1shield = false;
  let p2shield = false;
  let p1shieldTurns = 0;
  let p2shieldTurns = 0;
  let player1Score = 0;
  let player2Score = 0;
  let blocksRevealed = 0;
  if(gridSize!=10) fielderPositions = generateRandomPositions(gridSize, 2*gridSize-8);
  else fielderPositions = generateRandomPositions(gridSize,11);
  
  // Create game grid
  const gameGrid = document.getElementById("game-grid");
  gameGrid.innerHTML = "";
  gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  gameGrid.style.pointerEvents = "auto"; // Enable click events on the game grid

  // Add event listener to the game grid
  gameGrid.addEventListener("click", handleBlockClick);

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const block = document.createElement("div");
      block.classList.add("block");
      block.dataset.row = i;
      block.dataset.col = j;

      // Add a random chance for a block to give a score of two
      if (Math.random() < 0.35) {
        block.dataset.score = 2;
      } else if (Math.random() < 0.14) {
        block.dataset.score = 4;
      } else if (Math.random() < 0.10) {
        block.dataset.score = 6;
      } else if (Math.random() < 0.06) {
        block.dataset.score = 10;
      } else {
        block.dataset.score = 1;
      }

      gameGrid.appendChild(block);
    }
  }

  // Function to handle block click event
  function handleBlockClick(event) {
    const clickedElement = event.target;
    if (currentPlayer == 1 && p1shield) {
      p1shieldTurns -= 1;
      if (p1shieldTurns === 0) {
        p1shield=false;
        alert(`${player1Name}'s shield ran out!!`);
      }
    }
    if (currentPlayer == 2 && p2shield) {
      p2shieldTurns -= 1;
      if (p2shieldTurns === 0) {
        p2shield = false;
        alert(`${player2Name}'s shield ran out!!`);
      }
    }
    // Check if the clicked element is a block
    if (!clickedElement.classList.contains("block")) {
      return; // Ignore click on non-block elements
    }

    const clickedBlock = clickedElement;
    const row = parseInt(clickedBlock.dataset.row);
    const col = parseInt(clickedBlock.dataset.col);
    const score = parseInt(clickedBlock.dataset.score);

    // Check if the block is already revealed
    if (clickedBlock.classList.contains("revealed")) {
      return; // Ignore click on revealed block
    }
    clickedBlock.classList.add("revealed");
    blocksRevealed+=1;
    if (fielderPositions.some((pos) => pos[0] === row && pos[1] === col)) {
      // Clicked on a block with a fielder
      clickedBlock.style.backgroundImage = "url('./images/out.png')";
      clickedBlock.style.backgroundSize = "cover";
      clickedBlock.removeEventListener("click", handleBlockClick);
      clickedBlock.style.animation = "fade-in 0.5s";
      clickedBlock.style.boxShadow = "1px 1px 1px red";
      // Update scores for the respective players
      if (currentPlayer === 1) {
        if(p2out===false) togglePlayer();
        document.getElementById(
          "player1-score"
        ).textContent = `${player1Name} : ${player1Score}`;
        clickedBlock.style.backgroundColor = "#def2c8";
        if (p1shield == false) {
          p1out = true;
          if (p2out === false)
            alert(`${player1Name} got out at ${player1Score} runs!!`);
        }
        if (p1shield) {
          alert(`${player1Name} got protected by the shield!!`);
          clickedBlock.style.backgroundImage = "url('./images/shield.png')";
          p1shield = false;
          p1shieldTurns = 0;
        }
      } else if (currentPlayer === 2) {
        clickedBlock.style.backgroundColor = "#F7F18A";
        if(p1out===false) togglePlayer();
        document.getElementById(
          "player2-score"
        ).textContent = `${player2Name} : ${player2Score}`;
        if (p2shield == false) {
          p2out = true;
          if (p1out === false)
            alert(`${player2Name} got out at ${player2Score} runs!!`);
        } else {
          alert(`${player2Name} got protected by the shield!!`);
          clickedBlock.style.backgroundImage = "url('./images/shield.png')";
          p2shield = false;
          p2shieldTurns = 0;
        }
      }

      if (p1out && p2out) {
        endGame();
      }
    } else if (score != 10) {
      // Clicked on a block without a fielder
      clickedBlock.classList.add("revealed");
      clickedBlock.removeEventListener("click", handleBlockClick);

      // Update scores for the respective players
      if (currentPlayer === 1) {
        player1Score += score;
        clickedBlock.style.backgroundColor = "#def2c8";
        clickedBlock.style.boxShadow = "1px 1px 1px green";
        if (p2out === false) togglePlayer();
        document.getElementById(
          "player1-score"
        ).textContent = `${player1Name} : ${player1Score}`;
      } else if (currentPlayer === 2) {
        player2Score += score;
        clickedBlock.style.backgroundColor = "#F7F18A ";
        clickedBlock.style.boxShadow = "1px 1px 1px yellow";
        if (p1out === false) togglePlayer();
        document.getElementById(
          "player2-score"
        ).textContent = `${player2Name} : ${player2Score}`;
      }
      clickedBlock.textContent = score;
    } else {
      if (currentPlayer === 1) {
        alert(`${player1Name} got a shield for 3 turns!!`);
        p1shield = true;
        p1shieldTurns = 4;
        clickedBlock.removeEventListener("click", handleBlockClick);
        clickedBlock.style.backgroundColor = "#def2c8";
        clickedBlock.style.backgroundImage = "url('./images/shield.png')";
        clickedBlock.style.backgroundSize = "cover";
        if (p2out === false) togglePlayer();
      } else {
        p2shield = true;
        alert(`${player2Name} got a shield for 3 turns!!`);
        p2shieldTurns = 4;
        clickedBlock.removeEventListener("click", handleBlockClick);
        clickedBlock.style.backgroundColor = "#F7F18A";
        clickedBlock.style.backgroundImage = "url('./images/shield.png')";
        clickedBlock.style.backgroundSize = "cover";
        if (p1out === false) togglePlayer();
      }
    } if(blocksRevealed == gridSize*gridSize) endgame(); //In case the shield protects the players from all the fielders
  }

  // Function to toggle between players
  function togglePlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    if(currentPlayer===1){
      document.getElementById("player1-score").style.textShadow = "1px 1px 1px #def2c8";
      document.getElementById("player2-score").style.textShadow = "0px 0px 0px #F7F18A";
    }else{
      document.getElementById("player1-score").style.textShadow = "0px 0px 0px #def2c8";
      document.getElementById("player2-score").style.textShadow = "1px 1px 1px #F7F18A";
    }
  }

  // Function to end the game and display the final scores
  function endGame() {
    gameGrid.removeEventListener("click", handleBlockClick);
    gameGrid.style.pointerEvents = "none"; // Disable further clicks on the game grid
    resetButton.style.display = "block";
    if (player1Score > player2Score) {
      alert(`${player1Name} won the game!!`);
    } else if (player2Score > player1Score) {
      alert(`${player2Name} won the game!!`);
    } else {
      alert("It's a tie!!");
    }
  }
}

// Add event listener to the reset button click event
resetButton.addEventListener("click", function () {
  // Reset the game
  gridSizeForm.style.display = "none";
  gameContainer.style.display = "none";
  resetButton.style.display = "none";
  backButton.style.display = "none";
  startWindow.style.display = "block";
  document.getElementById("run-score").textContent = "0";
  document.getElementById("player1-score").textContent = "0";
  document.getElementById("player2-score").textContent = "0";
  // Remove all blocks from the game grid
  const gameGrid = document.getElementById("game-grid");
  gameGrid.innerHTML = "";
});

// Generate an array of random positions
function generateRandomPositions(gridSize, count) {
  const positions = [];
  const allPositions = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      allPositions.push([i, j]);
    }
  }
  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * allPositions.length);
    positions.push(allPositions.splice(index, 1)[0]);
  }
  return positions;
}

window.addEventListener("DOMContentLoaded", () => {
  const infoWindow = document.getElementById("info-window");
  const infoButton = document.getElementById("info-button");
  const closeButton = document.getElementById("close-button");
  const overlay = document.getElementById("overlay");

  infoButton.addEventListener("click", openInfoWindow);
  closeButton.addEventListener("click", closeInfoWindow);

  function openInfoWindow() {
    infoWindow.classList.add("show");
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
  }

  function closeInfoWindow() {
    infoWindow.classList.remove("show");
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
  }
});
