import json
import random
from datetime import datetime, timedelta, timezone

def generate_object_id():
    return ''.join(random.choices('0123456789abcdef', k=24))

DEPARTMENTS = ["Engineering", "HR", "Finance", "IT", "Operations", "Sales", "Marketing"]
LOCATIONS = ["HQ - Floor 1", "HQ - Floor 2", "HQ - Server Room", "Branch - NY", "Branch - SF", "Remote"]
EMPLOYEE_NAMES = ["Alice Smith", "Bob Jones", "Charlie Brown", "Diana Prince", "Evan Wright", "Fiona Gallagher", "George Costanza", "Hannah Abbott", "Ian Malcolm", "Julia Roberts"]

ASSET_MODELS = {
    "Laptop": ["MacBook Pro 16", "MacBook Air M2", "ThinkPad T14", "Dell XPS 15", "HP EliteBook"],
    "Phone": ["iPhone 14 Pro", "iPhone 13", "Samsung Galaxy S23", "Google Pixel 7"],
    "Monitor": ["Dell UltraSharp 27", "LG UltraFine 4K", "Samsung Odyssey G7"],
    "Accessory": ["Logitech MX Master 3", "Apple Magic Keyboard", "Sony WH-1000XM5"],
    "Server": ["Dell PowerEdge R740", "HPE ProLiant DL380", "Cisco UCS C220"]
}

STATUS_WEIGHTS = ["Available", "Allocated", "Allocated", "Allocated", "UnderMaintenance", "Reserved", "Retired"]
CONDITIONS = ["New", "Good", "Good", "Good", "Fair", "Poor"]

def generate_date_in_past(days=365):
    past = datetime.now(timezone.utc) - timedelta(days=random.randint(1, days))
    return past.isoformat()

def main():
    # 1. Departments & Categories (Implicit or explicit)
    dept_ids = {d: generate_object_id() for d in DEPARTMENTS}
    cat_ids = {c: generate_object_id() for c in ASSET_MODELS.keys()}
    
    # 2. Employees
    employees = []
    for name in EMPLOYEE_NAMES:
        dept = random.choice(DEPARTMENTS)
        employees.append({
            "id": generate_object_id(),
            "name": name,
            "email": name.lower().replace(" ", ".") + "@milliai.tech",
            "departmentId": dept_ids[dept],
            "role": "Employee" if random.random() > 0.2 else "AssetManager",
            "status": "Active",
            "createdAt": generate_date_in_past()
        })
        
    admin_id = generate_object_id()
    employees.append({
        "id": admin_id,
        "name": "System Admin",
        "email": "admin@milliai.tech",
        "departmentId": dept_ids["IT"],
        "role": "Admin",
        "status": "Active",
        "createdAt": generate_date_in_past(1000)
    })

    # 3. Assets
    assets = []
    for i in range(1, 51):
        cat_name = random.choice(list(ASSET_MODELS.keys()))
        model = random.choice(ASSET_MODELS[cat_name])
        status = random.choice(STATUS_WEIGHTS)
        is_bookable = cat_name in ["Server", "Accessory"] or random.random() > 0.8
        
        asset = {
            "id": generate_object_id(),
            "tag": f"AST-{1000 + i}",
            "name": model,
            "categoryId": cat_ids[cat_name],
            "serialNumber": f"SN-{''.join(random.choices('0123456789ABCDEF', k=10))}",
            "acquisitionDate": generate_date_in_past(800),
            "acquisitionCost": round(random.uniform(100, 3000), 2),
            "condition": random.choice(CONDITIONS),
            "location": random.choice(LOCATIONS),
            "isBookable": is_bookable,
            "status": status,
            "departmentId": dept_ids[random.choice(DEPARTMENTS)],
            "createdAt": generate_date_in_past(800)
        }
        assets.append(asset)
        
    # 4. Allocations
    allocations = []
    for asset in assets:
        if asset["status"] == "Allocated":
            emp = random.choice(employees)
            allocations.append({
                "id": generate_object_id(),
                "assetId": asset["id"],
                "holderId": emp["id"],
                "holderType": "Employee",
                "allocatedAt": generate_date_in_past(60),
                "allocatedBy": admin_id,
                "status": "Active",
                "createdAt": generate_date_in_past(60)
            })
            
    # 5. Bookings
    bookings = []
    bookable_assets = [a for a in assets if a["isBookable"]]
    for _ in range(15):
        if not bookable_assets: break
        asset = random.choice(bookable_assets)
        emp = random.choice(employees)
        bookings.append({
            "id": generate_object_id(),
            "resourceAssetId": asset["id"],
            "bookedBy": emp["id"],
            "startTime": (datetime.now(timezone.utc) + timedelta(days=random.randint(1, 5))).isoformat(),
            "endTime": (datetime.now(timezone.utc) + timedelta(days=random.randint(1, 5), hours=2)).isoformat(),
            "status": "Upcoming",
            "purpose": "Project Requirement",
            "createdAt": generate_date_in_past(5)
        })

    # 6. Maintenance
    maintenance = []
    for asset in assets:
        if asset["status"] == "UnderMaintenance":
            emp = random.choice(employees)
            maintenance.append({
                "id": generate_object_id(),
                "assetId": asset["id"],
                "raisedBy": emp["id"],
                "issue": "Device is overheating and shutting down randomly.",
                "priority": "High",
                "status": "InProgress",
                "raisedAt": generate_date_in_past(10)
            })
            
    # 7. Notifications
    notifications = []
    for emp in employees:
        notifications.append({
            "id": generate_object_id(),
            "userId": emp["id"],
            "title": "Welcome to AssetFlow",
            "message": "Your enterprise asset management portal.",
            "read": False,
            "createdAt": datetime.now(timezone.utc).isoformat()
        })

    # Save to files
    data_map = {
        "employees.json": employees,
        "assets.json": assets,
        "allocations.json": allocations,
        "bookings.json": bookings,
        "maintenance.json": maintenance,
        "notifications.json": notifications,
        "departments.json": [{"id": v, "name": k} for k, v in dept_ids.items()],
        "categories.json": [{"id": v, "name": k} for k, v in cat_ids.items()]
    }

    import os
    os.makedirs("mock_data", exist_ok=True)
    for filename, data in data_map.items():
        with open(os.path.join("mock_data", filename), 'w') as f:
            json.dump(data, f, indent=2)

    print(f"Successfully generated {len(data_map)} JSON files in mock_data/ directory.")

if __name__ == "__main__":
    main()
