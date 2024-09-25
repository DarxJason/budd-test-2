// public/script.js
const gameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 0 },
          debug: false
      }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
    }
};
const game = new Phaser.Game(gameConfig);
let player;
let playerLoginCode = null; // Store the player's login code
let movements = []; // Store player movements

function preload() {
    // Load assets here (e.g., images, sprites)
}

function create() {
    // Create player sprite
    player = this.physics.add.sprite(400, 300, 'playerSprite'); // Change 'playerSprite' to your actual sprite key
    
    // Input events
    this.input.keyboard.on('keydown-W', () => player.setVelocityY(-160));
    this.input.keyboard.on('keydown-S', () => player.setVelocityY(160));
    this.input.keyboard.on('keydown-A', () => player.setVelocityX(-160));
    this.input.keyboard.on('keydown-D', () => player.setVelocityX(160));
    
    this.input.keyboard.on('keyup-W', () => player.setVelocityY(0));
    this.input.keyboard.on('keyup-S', () => player.setVelocityY(0));
    this.input.keyboard.on('keyup-A', () => player.setVelocityX(0));
    this.input.keyboard.on('keyup-D', () => player.setVelocityX(0));
    
    // Button to create an account
    const createButton = this.add.text(650, 20, 'Create Account', { fill: '#0f0' })
        .setInteractive()
        .on('pointerdown', createAccount);
        
    // Button to login
    const loginButton = this.add.text(650, 50, 'Login', { fill: '#00f' })
        .setInteractive()
        .on('pointerdown', () => this.showLoginPopup());
        
    // Button to save movements
    const saveButton = this.add.text(650, 80, 'Save Movements', { fill: '#f00' })
        .setInteractive()
        .on('pointerdown', saveMovements);
}

function update() {
    // Update movements for tracking
    if (player) {
        movements.push({ x: player.x, y: player.y });
    }
}

// Function to show a popup demanding the login code
function showLoginPopup() {
    // Create a semi-transparent background for the popup
    const popupBg = this.add.graphics();
    popupBg.fillStyle(0x000000, 0.5);
    popupBg.fillRect(150, 150, 500, 300);

    // Create the prompt text
    const promptText = this.add.text(200, 200, 'Enter your login code:', { fontSize: '24px', fill: '#fff' });

    // Placeholder for the entered login code
    let enteredCode = '';

    // Display text for the entered code
    const codeInputText = this.add.text(200, 250, enteredCode, { fontSize: '20px', fill: '#fff' });

    // Capture keyboard input
    this.input.keyboard.on('keydown', (event) => {
        if (event.key.length === 1) {
            enteredCode += event.key;
        } else if (event.key === 'Backspace') {
            enteredCode = enteredCode.slice(0, -1);
        }
        codeInputText.setText(enteredCode); // Update the displayed input
    });

    // Create a "Submit" button to confirm the login code
    const submitButton = this.add.text(350, 350, 'Submit', { fontSize: '24px', fill: '#0f0' })
        .setInteractive()
        .on('pointerdown', () => {
            if (enteredCode) {
                playerLoginCode = enteredCode; // Set the login code
                login(playerLoginCode); // Call the login function with the entered code
                
                // Destroy the popup elements
                popupBg.destroy();
                promptText.destroy();
                codeInputText.destroy();
                submitButton.destroy();
            } else {
                alert('Please enter a valid code.');
            }
        });
}

// Account creation remains the same
function createAccount() {
    fetch('https://budd-test-2.vercel.app/api/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.loginCode) {
            playerLoginCode = data.loginCode;
            console.log('Account created! Your login code:', playerLoginCode);
            alert(`Account created! Your login code: ${playerLoginCode}`);
        } else {
            console.error('Unexpected response:', data);
            alert('Failed to create account: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error creating account: ' + error.message);
    });
}

// Modified login function
function login(code) {
    if (!code) {
        alert("Please enter a login code.");
        return;
    }

    fetch('https://budd-test-2.vercel.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginCode: code })
    })
    .then(response => response.json())
    .then(data => {
        if (data.player) {
            console.log('Login successful!', data.player);
            alert('Login successful!');
        } else {
            console.error('Login failed:', data.error);
            alert('Login failed: ' + data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}

function saveMovements() {
    if (!playerLoginCode) {
        alert("Please create an account first.");
        return;
    }

    fetch('https://budd-test-2.vercel.app/api/update-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            loginCode: playerLoginCode,
            movements: movements,
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Movements saved:', data.message);
        alert('Movements saved!');
    })
    .catch(error => console.error('Error:', error));
}

// Retrieve movements function
function getMovements() {
    if (!playerLoginCode) {
        alert("Please create an account first.");
        return;
    }

    fetch('https://budd-test-2.vercel.app/api/get-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginCode: playerLoginCode })
    })
    .then(response => response.json())
    .then(data => {
        if (data.movements) {
            console.log('Retrieved movements:', data.movements);
            alert('Movements retrieved! Check the console for details.');
        } else {
            console.error('Failed to retrieve movements:', data.error);
            alert('Failed to retrieve movements: ' + data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}
