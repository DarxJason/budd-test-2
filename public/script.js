function login() {
    // Create a semi-transparent background for the popup
    const popupBg = this.add.graphics();
    popupBg.fillStyle(0x000000, 0.5);
    popupBg.fillRect(150, 150, 500, 300);

    // Create the text for the prompt
    const promptText = this.add.text(200, 180, 'Enter your login code:', { fontSize: '24px', fill: '#fff' });

    // Placeholder for the login code input
    let enteredCode = '';

    // Text object to display the inputted code
    const codeInputText = this.add.text(200, 250, enteredCode, { fontSize: '20px', fill: '#fff' });

    // Listen for keyboard input
    this.input.keyboard.on('keydown', (event) => {
        if (event.key.length === 1) {
            enteredCode += event.key;  // Add characters to the input
        } else if (event.key === 'Backspace') {
            enteredCode = enteredCode.slice(0, -1);  // Handle backspace
        }
        codeInputText.setText(enteredCode);  // Update the displayed input
    });

    // Create a "Submit" button
    const submitButton = this.add.text(300, 350, 'Submit', { fontSize: '20px', fill: '#0f0' })
        .setInteractive()
        .on('pointerdown', () => {
            if (enteredCode) {
                // Send the entered login code to the server for verification
                fetch('https://budd-test-2.vercel.app/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ loginCode: enteredCode })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.player) {
                        console.log('Login successful!');
                        // Load player info or handle success here
                        // For example, you might update the player object with the loaded data
                        playerLoginCode = enteredCode;

                        // Destroy popup elements after successful login
                        popupBg.destroy();
                        promptText.destroy();
                        codeInputText.destroy();
                        submitButton.destroy();
                    } else {
                        console.error('Login failed:', data.error);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            }
        });
}
