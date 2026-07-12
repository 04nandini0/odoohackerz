const http = require('http');

async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@milliai.tech', password: 'password' })
    });
    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    
    const kpisRes = await fetch('http://localhost:5000/api/dashboard/kpis', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const kpisText = await kpisRes.text();
    console.log("KPIS RESPONSE:", kpisText);
  } catch (err) {
    console.error("ERROR:", err);
  }
}

test();
