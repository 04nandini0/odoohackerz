// Main entry point for configuring the ASP.NET Core web application, services, and middleware.
using AssetFlow.Config;
using AssetFlow.Middleware;
using AssetFlow.Models;
using AssetFlow.Repositories;
using AssetFlow.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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
builder.Services.AddScoped<IMongoDatabase>(sp =>
{
    var config = sp.GetRequiredService<IOptions<MongoConfig>>().Value;
    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase(config.DatabaseName);
});

// --- Repositories & Services ---
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IAssetCategoryRepository, AssetCategoryRepository>();
builder.Services.AddScoped<IAssetRepository, AssetRepository>();
builder.Services.AddScoped<IActivityLogRepository, ActivityLogRepository>();
builder.Services.AddScoped<ICounterRepository, CounterRepository>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IActivityLogService, ActivityLogService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IAssetCategoryService, AssetCategoryService>();
builder.Services.AddScoped<IEmployeeDirectoryService, EmployeeDirectoryService>();
builder.Services.AddScoped<IStorageService, StorageService>();
builder.Services.AddScoped<IQRCodeService, QRCodeService>();
builder.Services.AddScoped<IAssetLifecycleService, AssetLifecycleService>();
builder.Services.AddScoped<IAssetService, AssetService>();

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
    
    if (assetRepo.GetAllAsync().Result.Count() == 0)
    {
        var electronics = catRepo.FindByNameAsync("Electronics").Result;
        var furniture = catRepo.FindByNameAsync("Furniture").Result;
        var vehicles = catRepo.FindByNameAsync("Vehicles").Result;

        var CreateMockAsset = (string name, string catId, Dictionary<string,string> customFields, AssetStatus status) => {
            var seq = counterRepo.GetNextSequenceValueAsync("assetTag").Result;
            return new Asset
            {
                Tag = $"AF-{seq:D4}",
                Name = name,
                CategoryId = catId,
                CustomFieldValues = customFields,
                Status = status,
                Location = "Main Office",
                AcquisitionDate = DateTime.UtcNow.AddDays(-100),
                AcquisitionCost = 1500.00m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        };

        if (electronics != null)
        {
            assetRepo.CreateAsync(CreateMockAsset("MacBook Pro 16", electronics.Id, new Dictionary<string, string> { { "Warranty Period (months)", "36" } }, AssetStatus.Available)).Wait();
            assetRepo.CreateAsync(CreateMockAsset("Dell XPS 15", electronics.Id, new Dictionary<string, string> { { "Warranty Period (months)", "12" } }, AssetStatus.Allocated)).Wait();
            assetRepo.CreateAsync(CreateMockAsset("Samsung Odyssey Monitor", electronics.Id, new Dictionary<string, string> { { "Warranty Period (months)", "24" } }, AssetStatus.UnderMaintenance)).Wait();
        }

        if (furniture != null)
        {
            assetRepo.CreateAsync(CreateMockAsset("Ergonomic Chair", furniture.Id, new Dictionary<string, string>(), AssetStatus.Available)).Wait();
            assetRepo.CreateAsync(CreateMockAsset("Standing Desk", furniture.Id, new Dictionary<string, string>(), AssetStatus.Available)).Wait();
        }

        if (vehicles != null)
        {
            assetRepo.CreateAsync(CreateMockAsset("Company Van", vehicles.Id, new Dictionary<string, string> { { "Registration Number", "ABC-1234" } }, AssetStatus.Available)).Wait();
            assetRepo.CreateAsync(CreateMockAsset("Executive Car", vehicles.Id, new Dictionary<string, string> { { "Registration Number", "XYZ-9876" } }, AssetStatus.Retired)).Wait();
        }

        Console.WriteLine("Seeded mock assets.");
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

app.Run();