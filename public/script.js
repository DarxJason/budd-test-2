// public/script.js
const gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    pixelArt: true, 
    scene: mainMap, 
    physics: {
        default: 'arcade',
        arcade: {
            fps: 60,
            debug: false
        }
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
     
      // Button to create an account
      const createButton = this.add.text(650, 20, 'Create Account', { fill: '#0f0' })
          .setInteractive()
          .on('pointerdown', createAccount);
      // Button to login
      const loginButton = this.add.text(650, 50, 'Login', { fill: '#00f' })
          .setInteractive()
          .on('pointerdown', login);
      // Button to save movements
      const saveButton = this.add.text(650, 80, 'Save Movements', { fill: '#f00' })
          .setInteractive()
          .on('pointerdown', saveMovements);
  }
  function update() {
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
      function login() {
    // Ask for the player's login code using a prompt
    const enteredCode = prompt("Enter your login code:");

    if (!enteredCode) {
        alert("No code entered. Please try again.");
        return;
    }

    // Send the entered login code to the server for verification
    fetch('https://budd-test-2.vercel.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginCode: enteredCode })
    })
    .then(response => response.json())
    .then(data => {
        if (data.player) {
            console.log('Login successful!', data.player);
            alert('Success! You are now logged in.');
        } else {
            console.error('Login failed:', data.error);
            alert('Fail! Incorrect login code.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error during login: ' + error.message);
    });
}

