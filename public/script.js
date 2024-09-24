fetch('https://your-vercel-app.vercel.app/api/create-account', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
})
  .then(response => response.json())
  .then(data => {
    playerLoginCode = data.loginCode;
    console.log('Your login code:', playerLoginCode);
    alert(`Your login code: ${playerLoginCode}`);
  })
  .catch(error => console.error('Error:', error));

fetch('https://your-vercel-app.vercel.app/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ loginCode: playerLoginCode })
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
