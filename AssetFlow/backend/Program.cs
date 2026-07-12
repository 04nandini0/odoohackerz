// Main entry point for configuring the ASP.NET Core web application, services, and middleware.
var builder = WebApplication.CreateBuilder(args);

// TODO: implement service registrations (MongoDB, Redis, RabbitMQ, MinIO, SignalR)

var app = builder.Build();

// TODO: implement middleware pipeline

app.Run();\n