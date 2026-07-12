// Main entry point for configuring the ASP.NET Core web application, services, and middleware.
using AssetFlow.Config;
using AssetFlow.Hubs;
using AssetFlow.Middleware;
using AssetFlow.Models;
using AssetFlow.Repositories;
using AssetFlow.Services;
using StackExchange.Redis;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- Configuration ---
builder.Services.Configure<MongoConfig>(builder.Configuration.GetSection("MongoDB"));
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

// --- MongoDB Registration ---
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var config = sp.GetRequiredService<IOptions<MongoConfig>>().Value;
    return new MongoClient(config.ConnectionString);
});
builder.Services.AddSingleton<IMongoDatabase>(sp =>
{
    var config = sp.GetRequiredService<IOptions<MongoConfig>>().Value;
    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase(config.DatabaseName);
});

// --- Repositories & Services ---
builder.Services.AddSingleton<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddSingleton<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddSingleton<ICounterRepository, CounterRepository>();
builder.Services.AddSingleton<IAssetCategoryRepository, AssetCategoryRepository>();
builder.Services.AddSingleton<IAssetRepository, AssetRepository>();
builder.Services.AddSingleton<IAllocationRepository, AllocationRepository>();
builder.Services.AddSingleton<ITransferRepository, TransferRepository>();
builder.Services.AddSingleton<IBookingRepository, BookingRepository>();
builder.Services.AddSingleton<IMaintenanceRepository, MaintenanceRepository>();
builder.Services.AddSingleton<INotificationRepository, NotificationRepository>();
builder.Services.AddSingleton<IActivityLogRepository, ActivityLogRepository>();

// Services
builder.Services.AddSingleton<IAuthService, AuthService>();
builder.Services.AddSingleton<IAssetLifecycleService, AssetLifecycleService>();
builder.Services.AddSingleton<IAllocationService, AllocationService>();
builder.Services.AddSingleton<ITransferService, TransferService>();
builder.Services.AddSingleton<IBookingService, BookingService>();
builder.Services.AddSingleton<IMaintenanceService, MaintenanceService>();
builder.Services.AddSingleton<INotificationService, NotificationService>();
builder.Services.AddSingleton<IActivityLogService, ActivityLogService>();

// SignalR and Redis
builder.Services.AddSignalR();
builder.Services.AddSingleton<IConnectionMultiplexer>(sp => 
    ConnectionMultiplexer.Connect(builder.Configuration.GetValue<string>("Redis:ConnectionString") ?? "localhost:6379"));

builder.Services.AddScoped<IStorageService, StorageService>();
builder.Services.AddScoped<IQRCodeService, QRCodeService>();
builder.Services.AddScoped<IAssetService, AssetService>();
builder.Services.AddScoped<ITransferService, TransferService>();
builder.Services.AddScoped<IBookingService, BookingService>();

builder.Services.Configure<MinIOConfig>(builder.Configuration.GetSection("MinIO"));

// --- JWT Authentication ---
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
var key = Encoding.ASCII.GetBytes(jwtSettings.Secret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Hackathon mode
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// --- Swagger with JWT Support ---
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "AssetFlow API", Version = "v1" });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// --- Seed Data ---
using (var scope = app.Services.CreateScope())
{
    var employeeRepo = scope.ServiceProvider.GetRequiredService<IEmployeeRepository>();
    var deptRepo = scope.ServiceProvider.GetRequiredService<IDepartmentRepository>();
    var catRepo = scope.ServiceProvider.GetRequiredService<IAssetCategoryRepository>();

    var adminEmail = "admin@assetflow.local";
    var existingAdmin = employeeRepo.FindByEmailAsync(adminEmail).Result;
    
    if (existingAdmin == null)
    {
        var admin = new Employee
        {
            Name = "System Admin",
            Email = adminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = EmployeeRole.Admin,
            Status = EmployeeStatus.Active
        };
        employeeRepo.CreateAsync(admin).Wait();
        Console.WriteLine("Seeded default admin account: admin@assetflow.local / Admin@123");
    }

    // Seed Departments
    if (deptRepo.GetAllAsync().Result.Count() == 0)
    {
        deptRepo.CreateAsync(new Department { Name = "Engineering" }).Wait();
        deptRepo.CreateAsync(new Department { Name = "Facilities" }).Wait();
        deptRepo.CreateAsync(new Department { Name = "HR" }).Wait();
        Console.WriteLine("Seeded standard departments.");
    }

    // Seed Asset Categories
    if (catRepo.GetAllAsync().Result.Count() == 0)
    {
        catRepo.CreateAsync(new AssetCategory 
        { 
            Name = "Electronics", 
            CustomFields = new List<CustomFieldDefinition> 
            { 
                new CustomFieldDefinition { FieldName = "Warranty Period (months)", FieldType = "number", Required = true }
            } 
        }).Wait();
        
        catRepo.CreateAsync(new AssetCategory { Name = "Furniture" }).Wait();
        
        catRepo.CreateAsync(new AssetCategory 
        { 
            Name = "Vehicles",
            CustomFields = new List<CustomFieldDefinition> 
            { 
                new CustomFieldDefinition { FieldName = "Registration Number", FieldType = "text", Required = true }
            } 
        }).Wait();
        Console.WriteLine("Seeded standard asset categories.");
    }

    // Seed Mock Employees
    if (employeeRepo.FindByEmailAsync("john@assetflow.local").Result == null)
    {
        var hrDept = deptRepo.FindByNameAsync("HR").Result;
        employeeRepo.CreateAsync(new Employee
        {
            Name = "John Doe",
            Email = "john@assetflow.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"),
            Role = EmployeeRole.Employee,
            Status = EmployeeStatus.Active,
            DepartmentId = hrDept?.Id
        }).Wait();
    }
    
    if (employeeRepo.FindByEmailAsync("jane@assetflow.local").Result == null)
    {
        var engDept = deptRepo.FindByNameAsync("Engineering").Result;
        employeeRepo.CreateAsync(new Employee
        {
            Name = "Jane Smith",
            Email = "jane@assetflow.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"),
            Role = EmployeeRole.Employee,
            Status = EmployeeStatus.Active,
            DepartmentId = engDept?.Id
        }).Wait();
    }

    // Seed Mock Assets
    var assetRepo = scope.ServiceProvider.GetRequiredService<IAssetRepository>();
    var counterRepo = scope.ServiceProvider.GetRequiredService<ICounterRepository>();
    var allocRepo = scope.ServiceProvider.GetRequiredService<IAllocationRepository>();
    var transferRepo = scope.ServiceProvider.GetRequiredService<ITransferRepository>();
    var bookingRepo = scope.ServiceProvider.GetRequiredService<IBookingRepository>();
    var employeeRepoForSeed = scope.ServiceProvider.GetRequiredService<IEmployeeRepository>();
    
    if (assetRepo.GetAllAsync().Result.Count() == 0)
    {
        var electronics = catRepo.FindByNameAsync("Electronics").Result;
        var furniture = catRepo.FindByNameAsync("Furniture").Result;
        var vehicles = catRepo.FindByNameAsync("Vehicles").Result;

        var CreateMockAsset = (string name, string catId, Dictionary<string,string> customFields, AssetStatus status, bool isBookable = false) => {
            var seq = counterRepo.GetNextSequenceValueAsync("assetTag").Result;
            return new Asset
            {
                Tag = $"AF-{seq:D4}",
                Name = name,
                CategoryId = catId,
                CustomFieldValues = customFields,
                Status = status,
                Location = "Main Office",
                IsBookable = isBookable,
                AcquisitionDate = DateTime.UtcNow.AddDays(-100),
                AcquisitionCost = 1500.00m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        };

        if (electronics != null)
        {
            assetRepo.CreateAsync(CreateMockAsset("MacBook Pro 16", electronics.Id, new Dictionary<string, string> { { "Warranty Period (months)", "36" } }, AssetStatus.Allocated)).Wait();
            assetRepo.CreateAsync(CreateMockAsset("Dell XPS 15", electronics.Id, new Dictionary<string, string> { { "Warranty Period (months)", "12" } }, AssetStatus.Available)).Wait();
            assetRepo.CreateAsync(CreateMockAsset("Samsung Odyssey Monitor", electronics.Id, new Dictionary<string, string> { { "Warranty Period (months)", "24" } }, AssetStatus.UnderMaintenance)).Wait();
        }

        if (furniture != null)
        {
            assetRepo.CreateAsync(CreateMockAsset("Ergonomic Chair", furniture.Id, new Dictionary<string, string>(), AssetStatus.Available)).Wait();
            assetRepo.CreateAsync(CreateMockAsset("Conference Room B2", furniture.Id, new Dictionary<string, string>(), AssetStatus.Available, true)).Wait();
        }

        if (vehicles != null)
        {
            assetRepo.CreateAsync(CreateMockAsset("Company Van", vehicles.Id, new Dictionary<string, string> { { "Registration Number", "ABC-1234" } }, AssetStatus.Allocated)).Wait();
        }
        Console.WriteLine("Seeded mock assets.");
    }

    if (allocRepo.GetAllAsync().Result.Count() == 0)
    {
        var allAssets = assetRepo.GetAllAsync().Result;
        var allEmployees = employeeRepoForSeed.GetAllAsync().Result;
        var admin = allEmployees.FirstOrDefault(e => e.Role == EmployeeRole.Admin);
        var employee = allEmployees.FirstOrDefault(e => e.Role == EmployeeRole.Employee);
        
        var macbook = allAssets.FirstOrDefault(a => a.Name.Contains("MacBook"));
        var van = allAssets.FirstOrDefault(a => a.Name.Contains("Van"));
        var dell = allAssets.FirstOrDefault(a => a.Name.Contains("Dell"));

        if (admin != null && employee != null)
        {
            // Active allocations
            if (macbook != null) {
                var macAlloc = new Allocation { AssetId = macbook.Id, HolderId = employee.Id, HolderType = HolderType.Employee, Status = AllocationStatus.Active, ExpectedReturnDate = DateTime.UtcNow.AddDays(30) };
                allocRepo.CreateAsync(macAlloc).Wait();

                // Transfer request for macbook
                transferRepo.CreateAsync(new Transfer { AllocationId = macAlloc.Id, AssetId = macbook.Id, FromHolderId = employee.Id, ToHolderId = admin.Id, ToHolderType = HolderType.Employee, Status = TransferStatus.Requested }).Wait();
            }

            if (van != null) {
                var vanAlloc = new Allocation { AssetId = van.Id, HolderId = admin.Id, HolderType = HolderType.Employee, Status = AllocationStatus.Active, ExpectedReturnDate = DateTime.UtcNow.AddDays(-5) }; // Overdue
                allocRepo.CreateAsync(vanAlloc).Wait();
            }

            // Returned allocation
            if (dell != null) {
                allocRepo.CreateAsync(new Allocation { AssetId = dell.Id, HolderId = admin.Id, HolderType = HolderType.Employee, Status = AllocationStatus.Returned, ExpectedReturnDate = DateTime.UtcNow.AddDays(-10), ActualReturnDate = DateTime.UtcNow.AddDays(-2) }).Wait();
            }
        }
        Console.WriteLine("Seeded mock allocations and transfers.");
    }

    if (bookingRepo.GetAllAsync().Result.Count() == 0)
    {
        var allAssets = assetRepo.GetAllAsync().Result;
        var allEmployees = employeeRepoForSeed.GetAllAsync().Result;
        var employee = allEmployees.FirstOrDefault(e => e.Role == EmployeeRole.Employee);
        
        var room = allAssets.FirstOrDefault(a => a.Name.Contains("Conference"));

        if (room != null && employee != null)
        {
            var now = DateTime.UtcNow.Date.AddHours(9); // 9 AM today
            
            // Existing: 9:00 - 10:00
            bookingRepo.CreateAsync(new Booking { ResourceAssetId = room.Id, BookedBy = employee.Id, StartTime = now, EndTime = now.AddHours(1), Purpose = "Morning sync", Status = BookingStatus.Completed }).Wait();
            // Back-to-back: 10:00 - 11:00
            bookingRepo.CreateAsync(new Booking { ResourceAssetId = room.Id, BookedBy = employee.Id, StartTime = now.AddHours(1), EndTime = now.AddHours(2), Purpose = "Architecture Review", Status = BookingStatus.Upcoming }).Wait();
            // Future
            bookingRepo.CreateAsync(new Booking { ResourceAssetId = room.Id, BookedBy = employee.Id, StartTime = now.AddDays(1), EndTime = now.AddDays(1).AddHours(2), Purpose = "Client Meeting", Status = BookingStatus.Upcoming }).Wait();
        }
        Console.WriteLine("Seeded mock bookings.");
    }

    var maintRepo = scope.ServiceProvider.GetRequiredService<IMaintenanceRepository>();
    if (maintRepo.GetAllAsync().Result.Count() == 0)
    {
        var allAssets = assetRepo.GetAllAsync().Result;
        var allEmployees = employeeRepoForSeed.GetAllAsync().Result;
        var admin = allEmployees.FirstOrDefault(e => e.Role == EmployeeRole.Admin);
        var employee = allEmployees.FirstOrDefault(e => e.Role == EmployeeRole.Employee);
        var monitor = allAssets.FirstOrDefault(a => a.Name.Contains("Monitor"));

        if (employee != null && monitor != null && admin != null)
        {
            maintRepo.CreateAsync(new MaintenanceRequest { AssetId = monitor.Id, RaisedBy = employee.Id, Issue = "Screen flickering", Priority = MaintenancePriority.High, Status = MaintenanceStatus.Pending }).Wait();
            
            // Seed a resolved one to show history
            maintRepo.CreateAsync(new MaintenanceRequest { AssetId = monitor.Id, RaisedBy = employee.Id, Issue = "Dead pixels", Priority = MaintenancePriority.Medium, Status = MaintenanceStatus.Resolved, ResolvedAt = DateTime.UtcNow.AddDays(-2), ResolutionNotes = "Replaced panel" }).Wait();
        }
        Console.WriteLine("Seeded mock maintenance requests.");
    }

    var notifRepo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
    if (notifRepo.GetByUserIdAsync(employeeRepoForSeed.FindByEmailAsync("john@assetflow.local").Result?.Id ?? "", false).Result.Count() == 0)
    {
        var admin = employeeRepoForSeed.FindByEmailAsync("john@assetflow.local").Result;
        if (admin != null)
        {
            notifRepo.CreateAsync(new Notification { UserId = admin.Id, Type = NotificationType.TransferApproved, Message = "Transfer request for MacBook Pro 16 approved.", Read = false, CreatedAt = DateTime.UtcNow.AddMinutes(-5) }).Wait();
            notifRepo.CreateAsync(new Notification { UserId = admin.Id, Type = NotificationType.OverdueReturnAlert, Message = "Company Van return is overdue.", Read = true, CreatedAt = DateTime.UtcNow.AddDays(-1) }).Wait();
        }
        Console.WriteLine("Seeded mock notifications.");
    }
}

// --- Middleware Pipeline ---
app.UseMiddleware<GlobalExceptionHandler>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Disable HTTPS redirection for easier local docker networking during hackathon if needed
// app.UseHttpsRedirection(); 

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();