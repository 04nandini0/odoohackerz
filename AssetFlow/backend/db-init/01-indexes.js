// =============================================================================
// AssetFlow — MongoDB Index Setup
// Runs automatically on first container start via docker-entrypoint-initdb.d
// =============================================================================
// Verification after `docker compose up -d`:
//   docker exec -it assetflow-mongo mongosh -u assetflow -p assetflow123 \
//     --authenticationDatabase admin assetflow \
//     --eval "db.getCollectionNames()"
// =============================================================================

db = db.getSiblingDB('assetflow');

// ---------------------------------------------------------------------------
// Auth / Employees
// ---------------------------------------------------------------------------
db.employees.createIndex({ email: 1 }, { unique: true });
db.employees.createIndex({ departmentId: 1 });

// ---------------------------------------------------------------------------
// Organization Setup
// ---------------------------------------------------------------------------
db.departments.createIndex({ name: 1 }, { unique: true });
db.assetCategories.createIndex({ name: 1 }, { unique: true });

// ---------------------------------------------------------------------------
// Asset Core
// ---------------------------------------------------------------------------
db.assets.createIndex({ tag: 1 }, { unique: true });
db.assets.createIndex({ serialNumber: 1 }, { unique: true, sparse: true });
db.assets.createIndex({ status: 1 });
db.assets.createIndex({ categoryId: 1 });
db.assets.createIndex(
  { name: "text", tag: "text", serialNumber: "text" },
  { name: "assets_text_search" }
);
db.counters.createIndex({ _id: 1 }, { unique: true });

// ---------------------------------------------------------------------------
// Allocation & Transfer
// Critical: partial unique index prevents double-allocation at DB level
// ---------------------------------------------------------------------------
db.allocations.createIndex(
  { assetId: 1 },
  { unique: true, partialFilterExpression: { status: "Active" } }
);
db.allocations.createIndex({ holderId: 1 });
db.allocations.createIndex({ expectedReturnDate: 1, status: 1 });
db.transfers.createIndex({ allocationId: 1 });
db.transfers.createIndex({ status: 1 });

// ---------------------------------------------------------------------------
// Booking — compound index for overlap queries
// ---------------------------------------------------------------------------
db.bookings.createIndex({ resourceAssetId: 1, startTime: 1, endTime: 1 });
db.bookings.createIndex({ status: 1 });

// ---------------------------------------------------------------------------
// Maintenance
// ---------------------------------------------------------------------------
db.maintenanceRequests.createIndex({ assetId: 1 });
db.maintenanceRequests.createIndex({ status: 1 });
db.maintenanceRequests.createIndex({ priority: 1 });

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------
db.auditCycles.createIndex({ status: 1 });
db.auditItems.createIndex({ cycleId: 1 });

// ---------------------------------------------------------------------------
// Notifications & Activity Logs
// ---------------------------------------------------------------------------
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 });
db.activityLogs.createIndex({ userId: 1, timestamp: -1 });
db.activityLogs.createIndex({ entityType: 1, entityId: 1 });

print("✅ AssetFlow indexes created successfully");
