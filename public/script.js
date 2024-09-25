class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    create() {
        // Simulate account creation after a button click
        this.createAccountButton = this.add.text(100, 100, 'Create Account', { fontSize: '20px', fill: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => this.showPopup('Account Created!'));

        // Simulate login button that demands a key
        this.loginButton = this.add.text(100, 200, 'Login', { fontSize: '20px', fill: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => this.showLoginPrompt());
    }

    // Function to show a popup message
    showPopup(message) {
        // Create a semi-transparent background for the popup
        const popupBg = this.add.graphics();
        popupBg.fillStyle(0x000000, 0.5);
        popupBg.fillRect(50, 50, 300, 200);

        // Create the text for the popup
        const popupText = this.add.text(100, 100, message, { fontSize: '24px', fill: '#fff' });

        // Create an "OK" button to close the popup
        const okButton = this.add.text(150, 200, 'OK', { fontSize: '20px', fill: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => {
                // Destroy the popup elements when OK is clicked
                popupBg.destroy();
                popupText.destroy();
                okButton.destroy();
            });
    }

    // Function to show a login prompt asking for a key
    showLoginPrompt() {
        // Create a semi-transparent background for the popup
        const popupBg = this.add.graphics();
        popupBg.fillStyle(0x000000, 0.5);
        popupBg.fillRect(50, 50, 300, 200);

        // Create the prompt text
        const promptText = this.add.text(100, 100, 'Enter your key:', { fontSize: '24px', fill: '#fff' });

        // Create a placeholder for the key (in practice, this would be an input field or another method)
        let enteredKey = '';

        const keyInputText = this.add.text(100, 150, enteredKey, { fontSize: '20px', fill: '#fff' });

        // Listen for keyboard input
        this.input.keyboard.on('keydown', (event) => {
            if (event.key.length === 1) { // Only allow single character inputs
                enteredKey += event.key;
            } else if (event.key === 'Backspace') {
                enteredKey = enteredKey.slice(0, -1); // Handle backspace
            }
            keyInputText.setText(enteredKey); // Update the displayed key
        });

        // Create a "Submit" button
        const submitButton = this.add.text(150, 200, 'Submit', { fontSize: '20px', fill: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => {
                // Here you can handle the key submission logic (e.g., validate the key)
                console.log('Entered Key:', enteredKey);

                // Destroy the popup elements after submission
                popupBg.destroy();
                promptText.destroy();
                keyInputText.destroy();
                submitButton.destroy();
            });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: MainScene
};

const game = new Phaser.Game(config);
