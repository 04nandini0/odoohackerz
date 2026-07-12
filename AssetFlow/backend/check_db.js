const { MongoClient } = require('mongodb');

async function check() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    const db = client.db('assetflow');
    const employees = await db.collection('Employees').find({}).toArray();
    console.log("EMPLOYEES:", employees.map(e => ({ email: e.Email, role: e.Role, passwordHash: e.PasswordHash })));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}
check();
