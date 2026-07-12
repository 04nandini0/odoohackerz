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
builder.Services.AddScoped<IAuthService, AuthService>();

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

// --- Seed Admin Account ---
using (var scope = app.Services.CreateScope())
{
    var employeeRepo = scope.ServiceProvider.GetRequiredService<IEmployeeRepository>();
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