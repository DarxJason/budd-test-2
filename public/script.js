const gameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
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
        this.load.tilemapTiledJSON('maps', 'assets/map.json');
        this.load.image('tiles', 'assets/tiles.png');
        this.load.image('player', 'assets/flower.webp');
        this.load.image('yellow_ladybug', 'assets/shineyLadybug.png');
        this.load.image('petal', 'assets/petal.png');
        this.load.image('squareBud', 'assets/squareBud.png');
    }
    function create() {

        const map = this.add.tilemap('maps');
        const tiles = map.addTilesetImage('tileset', 'tiles');
        const groundLayer = map.createLayer('Map', tiles, 0, 0);
        const wallLayer = map.createLayer('Walls', tiles, 0, 0);

        groundLayer.setScale(15);
        wallLayer.setScale(15);
        this.useMouseControl = false;
        this.movementArrow = this.add.graphics();
        this.movementArrow.lineStyle(12, 0x808080);
        this.player = this.physics.add.sprite(Phaser.Math.Between(4000, 6000), Phaser.Math.Between(6200, 8000), 'player');
        this.player.setScale(0.3);
        this.player.setDepth(1);
        this.player.body.setCircle(this.player.width * 0.47, this.player.width * 0.06, this.player.height * 0.05);
        this.player.body.setMass(10000);

        this.hp = 500;
        this.currentHp = this.hp;

        this.createHpBar();
        this.createPetalSlots();
        this.createUtilityIcons();

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D
        });

         // Listen for server updates
         socket.on('currentPlayers', (players) => {
            Object.keys(players).forEach(id => {
                const playerInfo = players[id];
                this.addPlayer(playerInfo);
            });
        });

        socket.on('newPlayer', (playerInfo) => {
            this.addPlayer(playerInfo);
        });

        socket.on('updatePlayers', (players) => {
            Object.keys(players).forEach(id => {
                const playerInfo = players[id];
                this.updatePlayer(playerInfo);
            });
        });

        socket.on('playerDisconnected', (playerId) => {
            this.removePlayer(playerId);
        });

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(0.85);

        this.minimap = this.cameras.add(10, 10, 150, 150).setZoom(0.05).setName('mini');
        this.minimap.startFollow(this.player);
        this.minimap.setScroll(0, 0);
        this.cameras.main.ignore(this.minimap);

        wallLayer.setCollisionBetween(15, 21);
        this.physics.add.collider(this.player, wallLayer);

        this.enemies = this.physics.add.group();
        this.bushes = this.physics.add.group(); // New group for bushes
        

        this.physics.add.collider(this.player, this.enemies, this.handleCollision, null, this);
        this.physics.add.collider(this.enemies, this.enemies);
        this.physics.add.collider(this.enemies, wallLayer);
        this.physics.add.overlap(this.player, this.enemies, this.chasePlayer, null, this);
        // Add colliders for the player, enemies, and bushes with the walls

        this.physics.add.collider(this.bushes, wallLayer);


        // Add collision between the player and bushes
        this.physics.add.collider(this.player, this.bushes, this.handleBushCollision, null, this);
       
     
        this.time.addEvent({
            delay: 2000,
            callback: this.changeEnemiesDirection,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: 5000,
            callback: this.autoHeal,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: 15000,
            callback: this.attemptSpawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Attempt to spawn bushes with the same rarity logic as squares
        this.time.addEvent({
            delay: 10000,
            callback: this.attemptSpawnBush,
            callbackScope: this,
            loop: true
        });
     
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
  }

