const http = require('http');

async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@milliai.tech', password: 'password' })
    });
    const loginData = await loginRes.json();
    console.log("LOGIN SUCCESSFUL?", loginRes.ok);
    const token = loginData.accessToken;
    
    const assetsRes = await fetch('http://localhost:5000/api/assets', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const assetsText = await assetsRes.text();
    console.log("ASSETS RESPONSE LENGTH:", assetsText.length);
    if (assetsText.length > 0) {
       console.log("ASSETS FIRST 100 CHARS:", assetsText.substring(0, 100));
    }
  } catch (err) {
    console.error("ERROR:", err);
  }
}

test();
