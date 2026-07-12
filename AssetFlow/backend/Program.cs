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
builder.Services.AddSingleton<IDepartmentService, DepartmentService>();
builder.Services.AddSingleton<IEmployeeDirectoryService, EmployeeDirectoryService>();
builder.Services.AddSingleton<IAssetCategoryService, AssetCategoryService>();
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

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
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

// --- Seed Data (resilient — failures logged but don't crash the app) ---
try
{
    using (var scope = app.Services.CreateScope())
    {
        await AssetFlow.DbSeeder.SeedAsync(scope.ServiceProvider);
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Warning: Database seeding failed: {ex.Message}");
    Console.WriteLine("The application will continue without seed data.");
}

// --- Middleware Pipeline ---
app.UseMiddleware<GlobalExceptionHandler>();

// Swagger enabled unconditionally for hackathon demo
app.UseSwagger();
app.UseSwaggerUI();

// Disable HTTPS redirection for easier local docker networking during hackathon if needed
// app.UseHttpsRedirection(); 

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();