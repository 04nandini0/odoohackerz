using System.Text.Json;
using System.Text.Json.Serialization;
using AssetFlow.Models;
using AssetFlow.Repositories;
using MongoDB.Driver;

namespace AssetFlow
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            var db = serviceProvider.GetRequiredService<IMongoDatabase>();

            // Check if data already exists (e.g. seeded by Docker init scripts)
            var existingAssets = await db.GetCollection<Asset>("Assets").CountDocumentsAsync(_ => true);
            if (existingAssets > 0)
            {
                Console.WriteLine($"Database already contains {existingAssets} assets. Skipping C# seeder.");
                return;
            }

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            options.Converters.Add(new JsonStringEnumConverter());

            var catRepo = serviceProvider.GetRequiredService<IAssetCategoryRepository>();
            var deptRepo = serviceProvider.GetRequiredService<IDepartmentRepository>();
            var employeeRepo = serviceProvider.GetRequiredService<IEmployeeRepository>();
            var assetRepo = serviceProvider.GetRequiredService<IAssetRepository>();
            var allocRepo = serviceProvider.GetRequiredService<IAllocationRepository>();
            var bookingRepo = serviceProvider.GetRequiredService<IBookingRepository>();
            var maintRepo = serviceProvider.GetRequiredService<IMaintenanceRepository>();
            var notifRepo = serviceProvider.GetRequiredService<INotificationRepository>();

            // Clean collections before re-seeding
            await db.DropCollectionAsync("AssetCategories");
            await db.DropCollectionAsync("Departments");
            await db.DropCollectionAsync("Employees");
            await db.DropCollectionAsync("Assets");
            await db.DropCollectionAsync("Allocations");
            await db.DropCollectionAsync("Bookings");
            await db.DropCollectionAsync("MaintenanceRequests");
            await db.DropCollectionAsync("Notifications");
            await db.DropCollectionAsync("Transfers");
            await db.DropCollectionAsync("ActivityLogs");
            await db.DropCollectionAsync("AuditCycles");
            await db.DropCollectionAsync("AuditItems");
            await db.DropCollectionAsync("Counters");

            var mockDataPath = Path.Combine(Directory.GetCurrentDirectory(), "mock_data");

            if (!Directory.Exists(mockDataPath))
            {
                Console.WriteLine($"Mock data directory not found at {mockDataPath}. Skipping seeding.");
                return;
            }

            Console.WriteLine("Starting Database Seeding from mock_data...");

            // 1. Categories
            await SeedCollectionAsync<AssetCategory>(catRepo, Path.Combine(mockDataPath, "categories.json"), options, "Categories");
            // 2. Departments
            await SeedCollectionAsync<Department>(deptRepo, Path.Combine(mockDataPath, "departments.json"), options, "Departments");
            // 3. Employees
            await SeedCollectionAsync<Employee>(employeeRepo, Path.Combine(mockDataPath, "employees.json"), options, "Employees");
            // 4. Assets
            await SeedCollectionAsync<Asset>(assetRepo, Path.Combine(mockDataPath, "assets.json"), options, "Assets");
            // 5. Allocations
            await SeedCollectionAsync<Allocation>(allocRepo, Path.Combine(mockDataPath, "allocations.json"), options, "Allocations");
            // 6. Bookings
            await SeedCollectionAsync<Booking>(bookingRepo, Path.Combine(mockDataPath, "bookings.json"), options, "Bookings");
            // 7. Maintenance
            await SeedCollectionAsync<MaintenanceRequest>(maintRepo, Path.Combine(mockDataPath, "maintenance.json"), options, "Maintenance Requests");
            // 8. Notifications
            await SeedCollectionAsync<Notification>(notifRepo, Path.Combine(mockDataPath, "notifications.json"), options, "Notifications");

            Console.WriteLine("Database seeding completed successfully!");
        }

        private static async Task SeedCollectionAsync<T>(dynamic repo, string filePath, JsonSerializerOptions options, string name)
        {
            if (File.Exists(filePath))
            {
                var json = await File.ReadAllTextAsync(filePath);
                var items = JsonSerializer.Deserialize<List<T>>(json, options);
                if (items != null && items.Any())
                {
                    foreach (var item in items)
                    {
                        if (item is Employee emp && string.IsNullOrEmpty(emp.PasswordHash))
                        {
                            emp.PasswordHash = BCrypt.Net.BCrypt.HashPassword("password");
                        }
                        await repo.CreateAsync(item);
                    }
                    Console.WriteLine($"Seeded {items.Count} {name}");
                }
            }
        }
    }
}
