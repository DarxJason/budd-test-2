let player;
let playerLoginCode = null; // Store the player's login code

export class mainMap extends Phaser.Scene {
    constructor() {
        super("mainMap");
    }
 
    preload() {
        this.load.tilemapTiledJSON('maps', 'assets/map.json');
        this.load.image('tiles', 'assets/tiles.png');
        this.load.image('player', 'assets/flower.webp');
        this.load.image('enemy', 'assets/mob/bee.svg');
        this.load.image('squareBud', 'assets/squareBud.png');
        this.load.image('bush', 'assets/mob/bush.svg');
    }

    createAccount() {
        fetch('https://budd-test-2.vercel.app/api/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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

    login() {
        // Ask for the player's login code using a prompt
        const enteredCode = prompt("Enter your login code:");

        if (!enteredCode) {
            alert("No code entered. Please try again.");
            return;
        }

        // Send the entered login code to the server for verification
        fetch('https://budd-test-2.vercel.app/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loginCode: enteredCode
                })
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
    create() {
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

            // Create the buttons using the new function with separate background colors
        const createButtonPosition = 20;
        const loginButtonPosition = createButtonPosition + 70; // Adjust the spacing between buttons

        const createButton = this.createButton('Create Account', createButtonPosition, this.createAccount, 0x0AFC4B); // Green background
        const loginButton = this.createButton('Login', loginButtonPosition, this.login, 0xFF3D3D); // Red background

        // Handle screen resizing to reposition the buttons
        this.scale.on('resize', (gameSize) => {
            const newWidth = gameSize.width;

            // Reposition the buttons and their backgrounds on resize
            createButton.buttonBg.clear();
            createButton.buttonBg.fillStyle(0x0AFC4B, 0.8).fillRoundedRect(newWidth - createButton.buttonBg.width - 20, createButtonPosition, createButton.buttonBg.width, buttonHeight, cornerRadius);
            createButton.buttonBg.lineStyle(4, borderColor).strokeRoundedRect(newWidth - createButton.buttonBg.width - 20, createButtonPosition, createButton.buttonBg.width, buttonHeight, cornerRadius);

            // Center the text in the button
            createButton.buttonText.setX(newWidth - createButton.buttonBg.width / 2);
            createButton.buttonText.setY(createButtonPosition + buttonHeight / 2); // Center vertically

            loginButton.buttonBg.clear();
            loginButton.buttonBg.fillStyle(0xFF3D3D, 0.8).fillRoundedRect(newWidth - loginButton.buttonBg.width - 20, loginButtonPosition, loginButton.buttonBg.width, buttonHeight, cornerRadius);
            loginButton.buttonBg.lineStyle(4, borderColor).strokeRoundedRect(newWidth - loginButton.buttonBg.width - 20, loginButtonPosition, loginButton.buttonBg.width, buttonHeight, cornerRadius);

            // Center the text in the button
            loginButton.buttonText.setX(newWidth - loginButton.buttonBg.width / 2);
            loginButton.buttonText.setY(loginButtonPosition + buttonHeight / 2); // Center vertically
        });

    }

    update() {
        const maxSpeed = 175;
        const minSpeed = 0;
        const stopDistance = 10;

        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K))) {
            this.useMouseControl = !this.useMouseControl;
        }
        if (this.useMouseControl) {
            const pointer = this.input.activePointer;
            const dx = pointer.worldX - this.player.x;
            const dy = pointer.worldY - this.player.y;
            const angle = Math.atan2(dy, dx);
            const distance = Math.sqrt(dx * dx + dy * dy);
            let speed = maxSpeed;

            if (distance > stopDistance) {
                if (distance < maxSpeed) {
                    speed = Math.max(minSpeed, distance);
                }

                const velocityX = (dx / distance) * speed;
                const velocityY = (dy / distance) * speed;
                this.player.setVelocity(velocityX, velocityY);
            } else {
                this.player.setVelocity(0);
            }

            this.movementArrow.clear();
            this.movementArrow.fillStyle(0x808080);

            const arrowheadSize = 20;
            const arrowDistanceFromPlayer = 50;
            const arrowheadX = this.player.x + Math.cos(angle) * arrowDistanceFromPlayer;
            const arrowheadY = this.player.y + Math.sin(angle) * arrowDistanceFromPlayer;

            this.movementArrow.beginPath();
            this.movementArrow.moveTo(arrowheadX, arrowheadY);
            this.movementArrow.lineTo(arrowheadX - arrowheadSize * Math.cos(angle - Math.PI / 6), arrowheadY - arrowheadSize * Math.sin(angle - Math.PI / 6));
            this.movementArrow.lineTo(arrowheadX - arrowheadSize * Math.cos(angle + Math.PI / 6), arrowheadY - arrowheadSize * Math.sin(angle + Math.PI / 6));
            this.movementArrow.closePath();
            this.movementArrow.fillPath();
        } else {
            this.player.setVelocity(0);

            if (this.keys.w.isDown || this.cursors.up.isDown) {
                this.player.setVelocityY(-maxSpeed);
            } else if (this.keys.s.isDown || this.cursors.down.isDown) {
                this.player.setVelocityY(maxSpeed);
            }

            if (this.keys.a.isDown || this.cursors.left.isDown) {
                this.player.setVelocityX(-maxSpeed);
            } else if (this.keys.d.isDown || this.cursors.right.isDown) {
                this.player.setVelocityX(maxSpeed);
            }

            this.movementArrow.clear();
        }

        this.enemies.getChildren().forEach(enemy => {
            let distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            let chaseRange = 550;

            if (distance < chaseRange) {
                this.physics.moveToObject(enemy, this.player, 125);
            } else {
                enemy.setVelocity(enemy.wanderDirection.x * 50, enemy.wanderDirection.y * 50);
            }

            if (enemy.body.velocity.x !== 0 || enemy.body.velocity.y !== 0) {
                enemy.rotation = Math.atan2(enemy.body.velocity.y, enemy.body.velocity.x) + Math.PI / 2;
            }

            enemy.healthBar.clear();
            enemy.healthBar.fillStyle(0xff0000, 1);
            enemy.healthBar.fillRect(enemy.x - 20, enemy.y - 35, 40, 5);
            enemy.healthBar.fillStyle(0x00ff00, 1);
            enemy.healthBar.fillRect(enemy.x - 20, enemy.y - 35, 40 * (enemy.currentHp / enemy.maxHp), 5);
            enemy.rarityText.setPosition(enemy.x, enemy.y - 50);
        });

        this.updateHpBar();

        this.bushes.getChildren().forEach(bush => {
            bush.healthBar.clear();
            bush.healthBar.fillStyle(0xff0000, 1);
            bush.healthBar.fillRect(bush.x - 20, bush.y - 35, 40, 5);
            bush.healthBar.fillStyle(0x00ff00, 1);
            bush.healthBar.fillRect(bush.x - 20, bush.y - 35, 40 * (bush.currentHp / bush.maxHp), 5);
        });
    }

    // Function to create buttons with auto-fitting width and height
    createButton(text, yPosition, callback, backgroundColor) {
        const screenWidth = this.scale.width;

        // Calculate button dimensions based on text size
        const textWidth = this.getTextWidth(text, '24px Moderustic'); // Use the imported Google Font
        const textHeight = 30;  // Fixed height for uniformity
        const margin = 20;  // Increased margin around the text for padding
        
        // Button styles
        const buttonWidth = textWidth + margin * 2;  // Width with increased margins based on text size
        const buttonHeight = textHeight + margin;  // Increased height to provide more vertical padding
        const cornerRadius = 10;  // Border radius for rounded corners
        const borderColor = 0xffffff;  // Border color (white)
        const borderWidth = 4;  // Border width

        // Draw button background
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(backgroundColor, 0.8);  // Semi-transparent background
        buttonBg.fillRoundedRect(screenWidth - buttonWidth - 20, yPosition, buttonWidth, buttonHeight, cornerRadius); // Align to the right with padding
        buttonBg.lineStyle(borderWidth, borderColor);  // White border
        buttonBg.strokeRoundedRect(screenWidth - buttonWidth - 20, yPosition, buttonWidth, buttonHeight, cornerRadius);
        buttonBg.setScrollFactor(0).setDepth(9);  // Ensure it's sticky and below the text

        // Create button text with the imported Google Font
        const buttonText = this.add.text(screenWidth - buttonWidth / 2, yPosition + buttonHeight / 2, text, { 
            font: '24px Moderustic',  // Specify the font family here
            fill: '#ffffff', // Text color (white for contrast)
            align: 'center' // Center text alignment
        })
        .setInteractive()
        .on('pointerdown', callback.bind(this))
        .setScrollFactor(0)
        .setDepth(10)  // Ensure the text is on top of the background
        .setOrigin(0.5, 0.5); // Center the text based on its origin

        return { buttonBg, buttonText };
    }

    // Helper function to get text width
    getTextWidth(text, font) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = font;
        return context.measureText(text).width;
    }


    spawnBush(x, y, rarity) {
        let bush = this.physics.add.sprite(x, y, 'bush');
        bush.setScale(1); // Scale the bush to make it smaller
        bush.setDepth(1); // Set base depth for bush

        // Use the same health and damage mechanics as square enemies
        const rarityMultiplier = this.getRarityMultiplier(rarity);
        bush.maxHp = 60 * rarityMultiplier; // Match square health mechanics
        bush.currentHp = bush.maxHp;

        // Health bar for bush
        bush.healthBar = this.add.graphics();
        bush.healthBar.setDepth(5); // Ensure health bar is on top

        // Add rarity text above the bush
        bush.rarityText = this.add.text(bush.x, bush.y - 50, rarity, {
            fontSize: '25px',
            fill: '#ffffff'
        });
        bush.rarityText.setOrigin(0.5);
        bush.rarityText.setDepth(6); // Ensure rarity text is on top

        // Bush properties
        bush.body.immovable = true; // Make it stationary
        bush.body.moves = false; // Disable movement
        bush.damageDelt = 20 * rarityMultiplier; // Match square damage mechanics

        bush.body.setMass(1);
        bush.body.setCollideWorldBounds(true);

        // Add the bush to the bushes group
        this.bushes.add(bush); // <-- Corrected here

        bush.body.immovable = true;
        bush.body.pushable = true;

        // Update bush health bar
        bush.healthBar.clear();
        bush.healthBar.fillStyle(0xff0000, 1);
        bush.healthBar.fillRect(bush.x - 20, bush.y - 35, 40, 5); // HP bar on top
        bush.healthBar.fillStyle(0x00ff00, 1);
        bush.healthBar.fillRect(bush.x - 20, bush.y - 35, 40 * (bush.currentHp / bush.maxHp), 5);

        // Update rarity text position
        bush.rarityText.setPosition(bush.x, bush.y - 50);
    }


    attemptSpawnBush() {
        // Randomly spawn a bush with rarity logic
        let rarity = Math.random() < 0.1 ? 'rare' : 'common';
        let x, y;
        let safeDistance = 150; // Define a minimum safe distance from the player

        // Keep generating a new position if it's too close to the player
        do {
            x = Phaser.Math.Between(4000, 6000);
            y = Phaser.Math.Between(6200, 8000);
        } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < safeDistance);

        if (rarity === 'rare') {
            this.spawnBush(x, y, rarity); // Rare bush with more health
        } else {
            this.spawnBush(x, y, rarity);
        }
    }
    handleBushCollision(player, bush) {
        if (!this.damageCooldown) {
            this.takeDamage(bush.damageDelt);
            this.player.setTint(0xff0000);
            this.time.delayedCall(100, () => {
                this.player.clearTint();
            });

            this.damageCooldown = true;
            this.time.delayedCall(500, () => {
                this.damageCooldown = false;
            });
        }

        if (!bush.damageCooldown) {
            this.damageBush(bush, 5);
            bush.setTint(0xff0000);
            this.time.delayedCall(100, () => {
                bush.clearTint();
            });

            bush.damageCooldown = true;
            this.time.delayedCall(500, () => {
                bush.damageCooldown = false;
            });
        }
    }




    damageBush(bush, amount) {
        bush.currentHp = Phaser.Math.Clamp(bush.currentHp - amount, 0, bush.maxHp);
        if (bush.currentHp <= 0) {
            this.bushDied(bush);
        }
    }

    bushDied(bush) {
        bush.rarityText.destroy();

        bush.healthBar.destroy();
        bush.destroy();
    }




    autoHeal() {
        if (this.currentHp <= (this.hp - 50)) {
            this.currentHp += 50;
        }
    }

    createHpBar() {
        this.hpBarContainer = document.createElement('div');
        this.hpBarContainer.style.position = 'absolute';
        this.hpBarContainer.style.top = '20px';
        this.hpBarContainer.style.right = '20px';
        this.hpBarContainer.style.width = '250px';
        this.hpBarContainer.style.height = '30px';
        this.hpBarContainer.style.borderRadius = '30px';
        this.hpBarContainer.style.backgroundColor = '#000';
        this.hpBarContainer.style.padding = '5px';
        this.hpBarContainer.style.boxSizing = 'border-box';
        document.body.appendChild(this.hpBarContainer);

        this.hpBar = document.createElement('div');
        this.hpBar.style.height = '100%';
        this.hpBar.style.width = '100%';
        this.hpBar.style.borderRadius = '30px';
        this.hpBar.style.backgroundColor = '#ffe100';
        this.hpBar.style.boxSizing = 'border-box';
        this.hpBarContainer.appendChild(this.hpBar);

        this.updateHpBar();
    }

    createBottomBoxes() {

    }

    createPetalSlots() {
        this.petalSlots = [];
        const petalContainer = document.createElement('div');
        petalContainer.style.position = 'absolute';
        petalContainer.style.bottom = '15px'; // Position below the existing slots
        petalContainer.style.left = '50%';
        petalContainer.style.transform = 'translateX(-50%)';
        petalContainer.style.maxWidth = '100%'; // Remove the max width to prevent stacking
        document.body.appendChild(petalContainer);

        for (let i = 0; i < 10; i++) {
            const petal = document.createElement('div');
            petal.style.width = '43px';
            petal.style.height = '43px';
            petal.style.backgroundColor = '#f7f3f1';
            petal.style.display = 'inline-block';
            petal.style.margin = '3px 3px';
            petal.style.borderRadius = '5px';
            petal.style.border = '3px solid #ccc5c0';
            petalContainer.appendChild(petal);
            this.petalSlots.push(petal);

            const nobBasicPetal = document.createElement('img');
            nobBasicPetal.style.width = '33px';
            nobBasicPetal.src = 'assets/squareBud.png';
            nobBasicPetal.style.padding = '5px';
            nobBasicPetal.style.height = '33px';
            nobBasicPetal.style.borderRadius = '3px';
            nobBasicPetal.style.backgroundColor = 'black';
            nobBasicPetal.style.cursor = 'pointer';
            petal.appendChild(nobBasicPetal);
        }
    }

    createUtilityIcons() {
        const boxes = [{
            BOXborder: '#4981b1',
            BGcolor: '#5a9fdb',
            color: '#5a9fdb',
            border: '4px solid #4981b1',
            key: '(C)',
            image: 'assets/crafting.svg',
            content: 'Crafting'
        }];

        const boxContainer = document.createElement('div');
        boxContainer.style.position = 'absolute';
        boxContainer.style.bottom = '5px';
        boxContainer.style.left = '10px';
        boxContainer.style.display = 'flex';
        boxContainer.style.flexDirection = 'column';
        boxContainer.style.alignItems = 'flex-start';
        document.body.appendChild(boxContainer);

        boxes.forEach((boxInfo, index) => {
            const box = document.createElement('div');
            box.style.width = '43px';
            box.style.height = '43px';
            box.style.backgroundColor = boxInfo.color;
            box.style.margin = '3px 0';
            box.style.borderRadius = '5px';
            box.style.border = boxInfo.border;
            box.style.position = 'relative';
            box.style.cursor = 'pointer';
            boxContainer.appendChild(box);

            // Create and style the image
            const image = document.createElement('img');
            image.src = boxInfo.image;
            image.style.width = '100%';
            image.style.height = '100%';
            image.style.borderRadius = '3px';
            box.appendChild(image);

            // Add event listener to the box to redirect to the crafting scene
            box.addEventListener('click', () => {
                this.scene.start('crafting');
            });

            const tooltip = document.createElement('div');
            tooltip.style.position = 'absolute';
            tooltip.style.bottom = '100%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.marginBottom = '5px';
            tooltip.style.padding = '5px 10px';
            tooltip.style.backgroundColor = '#000';
            tooltip.style.color = '#fff';
            tooltip.style.borderRadius = '5px';
            tooltip.style.fontSize = '12px';
            tooltip.style.whiteSpace = 'nowrap';
            tooltip.style.visibility = 'hidden';
            tooltip.style.opacity = '0';
            tooltip.style.transition = 'opacity 0.3s';
            tooltip.innerHTML = `${boxInfo.key} ${boxInfo.content}`;
            box.appendChild(tooltip);

            box.addEventListener('mouseover', () => {
                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = '1';
            });

            box.addEventListener('mouseout', () => {
                tooltip.style.visibility = 'hidden';
                tooltip.style.opacity = '0';
            });

            const nobLetter = document.createElement('div');
            nobLetter.style.position = 'absolute';
            nobLetter.style.bottom = '0';
            nobLetter.style.right = '0';
            nobLetter.style.fontSize = '10px';
            nobLetter.style.backgroundColor = boxInfo.BGcolor;
            nobLetter.style.color = '#fff';
            nobLetter.style.padding = '2px 4px';
            nobLetter.style.borderRadius = '3px';
            nobLetter.style.border = boxInfo.BOXborder;
            nobLetter.innerHTML = boxInfo.key;
            box.appendChild(nobLetter);
        });
    }

    updateHpBar() {
        const hpPercentage = this.currentHp / this.hp;
        this.hpBar.style.width = `${hpPercentage * 100}%`;
    }

    handleCollision(player, enemy) {
        if (!this.damageCooldown) {
            this.takeDamage(enemy.damageDelt);
            this.player.setTint(0xff0000);
            this.time.delayedCall(100, () => {
                this.player.clearTint();
            });

            this.damageCooldown = true;
            this.time.delayedCall(500, () => {
                this.damageCooldown = false;
            });
        }

        if (!enemy.damageCooldown) {
            this.damageEnemy(enemy, 5);
            enemy.setTint(0xff0000);
            this.time.delayedCall(100, () => {
                enemy.clearTint();
            });

            enemy.damageCooldown = true;
            this.time.delayedCall(500, () => {
                enemy.damageCooldown = false;
            });
        }

        // Bounce effect
        const angle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
        const bounceForce = 200; // Adjust this value to control bounce strength
        player.body.setVelocity(Math.cos(angle) * -bounceForce, Math.sin(angle) * -bounceForce);
    }



    takeDamage(amount) {
        this.currentHp = Phaser.Math.Clamp(this.currentHp - amount, 0, this.hp);
        this.smoothHpBarDecrease();
        if (this.currentHp <= 0) {
            this.playerDied();
        }
    }

    damageEnemy(enemy, amount) {
        enemy.currentHp = Phaser.Math.Clamp(enemy.currentHp - amount, 0, enemy.maxHp);
        if (enemy.currentHp <= 0) {
            this.enemyDied(enemy);
        }
    }

    enemyDied(enemy) {
        enemy.rarityText.destroy();

        enemy.healthBar.destroy();
        enemy.destroy();
    }

    smoothHpBarDecrease() {
        this.tweens.addCounter({
            from: this.hpBar.clientWidth,
            to: (this.currentHp / this.hp) * 250,
            duration: 200,
            onUpdate: (tween) => {
                this.hpBar.style.width = `${tween.getValue()}px`;
            }
        });
    }

    playerDied() {
        this.currentHp = this.hp;
        this.player.setPosition(Phaser.Math.Between(4000, 6000), Phaser.Math.Between(6200, 8000));
        this.currentHp = this.hp / 3;
        this.smoothHpBarDecrease();
    }

    changeDirection(enemy) {
        const directions = [
            new Phaser.Math.Vector2(1, 0),
            new Phaser.Math.Vector2(-1, 0),
            new Phaser.Math.Vector2(0, 1),
            new Phaser.Math.Vector2(0, -1),
            new Phaser.Math.Vector2(1, 1).normalize(),
            new Phaser.Math.Vector2(-1, -1).normalize(),
            new Phaser.Math.Vector2(-1, 1).normalize(),
            new Phaser.Math.Vector2(1, -1).normalize()
        ];

        enemy.wanderDirection = Phaser.Utils.Array.GetRandom(directions);
    }

    changeEnemiesDirection() {
        this.enemies.getChildren().forEach(enemy => {
            this.changeDirection(enemy);
        });
    }

    spawnEnemies(count) {
        for (let i = 0; i < count; i++) {
            let x = Phaser.Math.Between(4000, 6000);
            let y = Phaser.Math.Between(6200, 8000);

            const rarityRoll = Phaser.Math.Between(1, 1000);
            let rarity, color, scale, hpMultiplier, massMultiplier, damageMultiplier;

            if (rarityRoll <= 750) {
                rarity = 'Nob';
                color = '#1b1b1b';
                scale = 1.5;
                hpMultiplier = 1;
                damageMultiplier = 1;
                massMultiplier = 1;
            } else if (rarityRoll <= 975) {
                rarity = 'Mythic';
                color = '#1ce7eb';
                scale = 3;
                hpMultiplier = 50;
                damageMultiplier = 20;
                massMultiplier = 10;
            } else if (rarityRoll <= 999) {
                rarity = 'Ultra';
                color = '#ff0084';
                scale = 5;
                hpMultiplier = 10000;
                damageMultiplier = 100;
                massMultiplier = 100;
            } else {
                rarity = 'Super';
                color = '#00ffb7';
                scale = 7;
                hpMultiplier = 1000 * 10000;
                damageMultiplier = 250;
                massMultiplier = 1000;
            }

            let enemy = this.physics.add.sprite(x, y, 'enemy');
            enemy.setScale(scale);
            enemy.setDepth(1);
            enemy.rarity = rarity;
            enemy.body.pushable = true;
            enemy.body.setMass(1);

            enemy.body.setCollideWorldBounds(true);
            enemy.body.setCircle(enemy.width * 0.3, enemy.width * 0.2, enemy.height * 0.2);

            enemy.damageMultiplier = damageMultiplier;
            enemy.body.setMass(massMultiplier);

            enemy.wanderDirection = new Phaser.Math.Vector2(0, 0);
            this.changeDirection(enemy);


            enemy.healthBar = this.add.graphics();
            enemy.healthBar.setDepth(2);

            enemy.currentHp = 60 * hpMultiplier;
            enemy.maxHp = 60 * hpMultiplier;
            enemy.damageDelt = 20 * damageMultiplier;

            enemy.rarityText = this.add.text(enemy.x, enemy.y - 35, rarity, {
                fontSize: '25px',
                fill: color
            });
            enemy.rarityText.setOrigin(0.5);
            enemy.rarityText.setDepth(3);

            this.enemies.add(enemy);
        }
    }

    attemptSpawnEnemy() {
        if (Phaser.Math.Between(1, 2) === 1) {
            this.spawnEnemies(1);
        }
    }

    getRarityMultiplier(rarity) {
        switch (rarity) {
            case 'Nob':
                return 1;
            case 'Mythic':
                return 5;
            case 'Ultra':
                return 100;
            case 'Super':
                return 250;
            default:
                return 1;
        }
    }

    chasePlayer(player, enemy) {}
}


// public/script.js
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
};
const game = new Phaser.Game(gameConfig);

export default mainMap;
