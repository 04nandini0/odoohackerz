const http = require('http');

async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@assetflow.local', password: 'Admin@123' })
    });
    const loginData = await loginRes.json();
    console.log("LOGIN:", loginData);
    const token = loginData.accessToken;
    
    const assetsRes = await fetch('http://localhost:5000/api/assets', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const assetsText = await assetsRes.text();
    console.log("ASSETS RESPONSE LENGTH:", assetsText.length);
    console.log("ASSETS RESPONSE:", assetsText.substring(0, 300));
  } catch (err) {
    console.error("ERROR:", err);
  }
}

test();
