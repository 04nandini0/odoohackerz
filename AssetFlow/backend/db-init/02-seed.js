// =============================================================================
// AssetFlow — MongoDB Seed Data
// Runs automatically on first container start via docker-entrypoint-initdb.d
// =============================================================================
// Verification after `docker compose up -d`:
//   docker exec -it assetflow-mongo mongosh -u assetflow -p assetflow123 \
//     --authenticationDatabase admin assetflow \
//     --eval "db.getCollectionNames()"
//   docker exec -it assetflow-mongo mongosh -u assetflow -p assetflow123 \
//     --authenticationDatabase admin assetflow \
//     --eval "db.assets.countDocuments()"
//   docker exec -it assetflow-mongo mongosh -u assetflow -p assetflow123 \
//     --authenticationDatabase admin assetflow \
//     --eval "db.employees.countDocuments()"
// =============================================================================

db = db.getSiblingDB('assetflow');

// Pre-computed bcrypt hashes (cannot compute inline in Mongo init scripts)
const ADMIN_HASH = '$2b$12$JOKYig7V1lxCzduSvrXlKuqn8aCH4fBwohuj0uoB6hD/krsOPIyVS'; // Admin@123
const EMP_HASH   = '$2b$12$BgQDstkwpdusrebDErixRuWa79qPvTyWBDcJ3f17/5EXWXV9UJV4S'; // password

// ---------------------------------------------------------------------------
// 1. Departments
// ---------------------------------------------------------------------------
db.departments.insertMany([
  { _id: ObjectId('eb5413b105f2dcd4f577e2ff'), name: 'Engineering', status: 'Active', createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId('fd7435b88a9dda71c2814ea5'), name: 'HR', status: 'Active', createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId('d6512d5b4a4de9abaf56dbd1'), name: 'Finance', status: 'Active', createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId('36ce1867f22f4f5d69daa8d0'), name: 'IT', status: 'Active', createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId('788ea1c30f3db398b4be1d19'), name: 'Operations', status: 'Active', createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId('43829a489def8f8cc1a40126'), name: 'Sales', status: 'Active', createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId('4615ea9ee9702e2a2c10ae7b'), name: 'Marketing', status: 'Active', createdAt: new Date(), updatedAt: new Date() }
]);
print('Seeded 7 Departments');

// ---------------------------------------------------------------------------
// 2. Asset Categories
// ---------------------------------------------------------------------------
db.assetCategories.insertMany([
  { _id: ObjectId('9d799e53e8328efef5067875'), name: 'Laptop', customFields: [], status: 'Active', createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId('1922364505fabd8a5e7460c6'), name: 'Phone', customFields: [], status: 'Active', createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId('29756646450090b5e5a0ebf5'), name: 'Monitor', customFields: [], status: 'Active', createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId('5bb6f5e690e1bd1ee27b5520'), name: 'Accessory', customFields: [], status: 'Active', createdAt: new Date(), updatedAt: new Date() },
  { _id: ObjectId('bba61d63684a0dcac83350b3'), name: 'Server', customFields: [], status: 'Active', createdAt: new Date(), updatedAt: new Date() }
]);
print('Seeded 5 Categories');

// ---------------------------------------------------------------------------
// 3. Employees (Admin + 10 mock employees)
// ---------------------------------------------------------------------------
db.employees.insertMany([
  { _id: ObjectId('a8d6eb7890777548c4913e12'), name: 'System Admin', email: 'admin@assetflow.local', passwordHash: ADMIN_HASH, departmentId: ObjectId('36ce1867f22f4f5d69daa8d0'), role: 'Admin', status: 'Active', refreshTokens: [], resetPasswordToken: null, resetPasswordTokenExpiry: null, createdAt: new Date('2026-01-26'), updatedAt: new Date() },
  { _id: ObjectId('44bdee845353e98d7e4d04e4'), name: 'Alice Smith', email: 'alice.smith@assetflow.local', passwordHash: EMP_HASH, departmentId: ObjectId('4615ea9ee9702e2a2c10ae7b'), role: 'Employee', status: 'Active', refreshTokens: [], resetPasswordToken: null, resetPasswordTokenExpiry: null, createdAt: new Date('2025-10-13'), updatedAt: new Date() },
  { _id: ObjectId('084f24899434d7aa8a1e40ca'), name: 'Bob Jones', email: 'bob.jones@assetflow.local', passwordHash: EMP_HASH, departmentId: ObjectId('eb5413b105f2dcd4f577e2ff'), role: 'AssetManager', status: 'Active', refreshTokens: [], resetPasswordToken: null, resetPasswordTokenExpiry: null, createdAt: new Date('2026-03-24'), updatedAt: new Date() },
  { _id: ObjectId('c35ebae76a73156b75a6682c'), name: 'Charlie Brown', email: 'charlie.brown@assetflow.local', passwordHash: EMP_HASH, departmentId: ObjectId('4615ea9ee9702e2a2c10ae7b'), role: 'Employee', status: 'Active', refreshTokens: [], resetPasswordToken: null, resetPasswordTokenExpiry: null, createdAt: new Date('2026-01-04'), updatedAt: new Date() },
  { _id: ObjectId('61e6435b1449acf93117aa4c'), name: 'Diana Prince', email: 'diana.prince@assetflow.local', passwordHash: EMP_HASH, departmentId: ObjectId('eb5413b105f2dcd4f577e2ff'), role: 'Employee', status: 'Active', refreshTokens: [], resetPasswordToken: null, resetPasswordTokenExpiry: null, createdAt: new Date('2025-10-29'), updatedAt: new Date() },
  { _id: ObjectId('32e85a902c062e4ebc52bc41'), name: 'Evan Wright', email: 'evan.wright@assetflow.local', passwordHash: EMP_HASH, departmentId: ObjectId('eb5413b105f2dcd4f577e2ff'), role: 'Employee', status: 'Active', refreshTokens: [], resetPasswordToken: null, resetPasswordTokenExpiry: null, createdAt: new Date('2026-01-12'), updatedAt: new Date() },
  { _id: ObjectId('4e029d8bbe31adf752c7aafc'), name: 'Fiona Gallagher', email: 'fiona.gallagher@assetflow.local', passwordHash: EMP_HASH, departmentId: ObjectId('fd7435b88a9dda71c2814ea5'), role: 'Employee', status: 'Active', refreshTokens: [], resetPasswordToken: null, resetPasswordTokenExpiry: null, createdAt: new Date('2025-08-25'), updatedAt: new Date() },
  { _id: ObjectId('dfdc5224fc348f737b9dd5d3'), name: 'George Costanza', email: 'george.costanza@assetflow.local', passwordHash: EMP_HASH, departmentId: ObjectId('43829a489def8f8cc1a40126'), role: 'Employee', status: 'Active', refreshTokens: [], resetPasswordToken: null, resetPasswordTokenExpiry: null, createdAt: new Date('2026-03-10'), updatedAt: new Date() },
  { _id: ObjectId('cb36bb062d1e70e7642d8127'), name: 'Hannah Abbott', email: 'hannah.abbott@assetflow.local', passwordHash: EMP_HASH, departmentId: ObjectId('d6512d5b4a4de9abaf56dbd1'), role: 'Employee', status: 'Active', refreshTokens: [], resetPasswordToken: null, resetPasswordTokenExpiry: null, createdAt: new Date('2026-03-26'), updatedAt: new Date() },
  { _id: ObjectId('8c8690cdaf12cb915057f45d'), name: 'Ian Malcolm', email: 'ian.malcolm@assetflow.local', passwordHash: EMP_HASH, departmentId: ObjectId('43829a489def8f8cc1a40126'), role: 'Employee', status: 'Active', refreshTokens: [], resetPasswordToken: null, resetPasswordTokenExpiry: null, createdAt: new Date('2026-02-28'), updatedAt: new Date() },
  { _id: ObjectId('ba1800fb864c2e171cdfbdca'), name: 'Julia Roberts', email: 'julia.roberts@assetflow.local', passwordHash: EMP_HASH, departmentId: ObjectId('36ce1867f22f4f5d69daa8d0'), role: 'Employee', status: 'Active', refreshTokens: [], resetPasswordToken: null, resetPasswordTokenExpiry: null, createdAt: new Date('2025-09-26'), updatedAt: new Date() }
]);
print('Seeded 11 Employees');

// ---------------------------------------------------------------------------
// 4. Counter (for asset tag sequence)
// ---------------------------------------------------------------------------
db.counters.insertOne({ _id: 'assetTag', seq: 50 });
print('Seeded counter: assetTag = 50');

// ---------------------------------------------------------------------------
// 5. Notifications
// ---------------------------------------------------------------------------
db.notifications.insertMany([
  { _id: ObjectId('4e3b11de95d8a6f574ac0515'), userId: ObjectId('44bdee845353e98d7e4d04e4'), title: 'Welcome to AssetFlow', message: 'Your enterprise asset management portal is ready.', read: false, createdAt: new Date() },
  { _id: ObjectId('543defdde6e03fe17b7acc99'), userId: ObjectId('084f24899434d7aa8a1e40ca'), title: 'Welcome to AssetFlow', message: 'Your enterprise asset management portal is ready.', read: false, createdAt: new Date() },
  { _id: ObjectId('bd9dd627e6fac4326a3ae1b9'), userId: ObjectId('32e85a902c062e4ebc52bc41'), title: 'Asset Overdue', message: 'Your allocation for iPhone 13 (AST-1010) was due on Jun 15. Please return it ASAP.', read: false, createdAt: new Date() },
  { _id: ObjectId('94a987fd9468bf5199d4e573'), userId: ObjectId('ba1800fb864c2e171cdfbdca'), title: 'Maintenance Update', message: 'Your maintenance request for Dell PowerEdge R740 has been marked as Critical.', read: false, createdAt: new Date() },
  { _id: ObjectId('ba7a9abae4f26a9ced40b492'), userId: ObjectId('a8d6eb7890777548c4913e12'), title: 'System Alert', message: '2 maintenance requests require your approval. 1 allocation is overdue.', read: false, createdAt: new Date() }
]);
print('Seeded 5 Notifications');

print('\n✅ AssetFlow database seeding completed successfully!');
print('   Admin login: admin@assetflow.local / Admin@123');
print('   Employee login: alice.smith@assetflow.local / password');
