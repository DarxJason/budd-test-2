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

