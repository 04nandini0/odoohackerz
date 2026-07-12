import os

base_dir = "/Users/avinashkumarjha/Desktop/odoohackerz/AssetFlow"

files = {}

def add_file(path, content):
    files[path] = content

# Root files
add_file("docker-compose.yml", """# Defines the Docker Compose services for MongoDB, Redis, RabbitMQ, MinIO, Backend, and Frontend.
version: '3.8'

services:
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 10s
      retries: 5

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    healthcheck:
      test: rabbitmq-diagnostics -q ping
      interval: 10s
      timeout: 10s
      retries: 5

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  backend:
    build:
      context: ./backend
    ports:
      - "5000:80"
    depends_on:
      mongo:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
      minio:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
""")

add_file(".env.example", """# Placeholder environment variables for Backend and Frontend.
# Backend
MONGO_CONNECTION_STRING=mongodb://mongo:27017/AssetFlow
REDIS_CONNECTION_STRING=redis:6379
RABBITMQ_HOST=rabbitmq
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
JWT_SECRET=super_secret_jwt_key_change_me_in_production

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SIGNALR_URL=http://localhost:5000/notifications
""")

add_file(".gitignore", """# Ignores .NET, Node.js, and Docker build artifacts.
# Node
node_modules/
.next/
out/
build/

# .NET
bin/
obj/

# Docker
.docker/

# Env
.env
.env.local
""")

add_file("README.md", """# AssetFlow
# Provides project overview, setup instructions, and architecture details for AssetFlow.
""")

add_file(".github/workflows/build.yml", """# GitHub Actions CI workflow to build and test backend and frontend.
name: Build and Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'
      - name: Build
        run: dotnet build backend/AssetFlow.csproj --configuration Release

  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Build
        run: cd frontend && npm run build
""")

# Backend Files
add_file("backend/Dockerfile", """# Dockerfile for building and serving the ASP.NET Core Web API.
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "AssetFlow.dll"]
""")

add_file("backend/Program.cs", """// Main entry point for configuring the ASP.NET Core web application, services, and middleware.
var builder = WebApplication.CreateBuilder(args);

// TODO: implement service registrations (MongoDB, Redis, RabbitMQ, MinIO, SignalR)

var app = builder.Build();

// TODO: implement middleware pipeline

app.Run();
""")

add_file("backend/appsettings.json", """// Global application settings and connection strings.
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
""")

add_file("backend/appsettings.Development.json", """// Development-specific application settings.
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information"
    }
  }
}
""")

add_file("backend/AssetFlow.csproj", """<!-- Project file for the ASP.NET Core Web API backend. -->
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="MongoDB.Driver" Version="2.24.0" />
    <PackageReference Include="StackExchange.Redis" Version="2.7.27" />
    <PackageReference Include="RabbitMQ.Client" Version="6.8.1" />
    <PackageReference Include="AWSSDK.S3" Version="3.7.307.9" />
  </ItemGroup>

</Project>
""")

# Backend Configs
configs = ["MongoConfig", "RedisConfig", "RabbitMQConfig", "MinIOConfig"]
for cfg in configs:
    add_file(f"backend/Config/{cfg}.cs", f"""// Configuration bindings for {cfg.replace('Config', '')} setup.
namespace AssetFlow.Config;

public class {cfg}
{{
    // TODO: implement
}}
""")

# Backend Models
models = ["Department", "AssetCategory", "Employee", "Asset", "Allocation", "Transfer", "Booking", "MaintenanceRequest", "AuditCycle", "AuditItem", "Notification", "ActivityLog"]
for model in models:
    add_file(f"backend/Models/{model}.cs", f"""// Domain entity representing a {model} in the MongoDB database.
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AssetFlow.Models;

public class {model}
{{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id {{ get; set; }}
    
    // TODO: implement properties
}}
""")

# Backend DTOs
dtos = ["Auth", "Dashboard", "Organization", "Assets", "Allocations", "Bookings", "Maintenance", "Audits", "Reports", "Notifications"]
for dto in dtos:
    add_file(f"backend/DTOs/{dto}Dto.cs", f"""// Data Transfer Objects for the {dto} module.
namespace AssetFlow.DTOs;

public class {dto}RequestDto
{{
    // TODO: implement
}}

public class {dto}ResponseDto
{{
    // TODO: implement
}}
""")

# Backend Repositories
add_file("backend/Repositories/IBaseRepository.cs", """// Generic repository interface for MongoDB data access.
namespace AssetFlow.Repositories;

public interface IBaseRepository<T>
{
    // TODO: implement basic CRUD signatures
}
""")

add_file("backend/Repositories/BaseRepository.cs", """// Generic repository implementation for MongoDB data access.
namespace AssetFlow.Repositories;

public class BaseRepository<T> : IBaseRepository<T>
{
    // TODO: implement basic CRUD operations
}
""")

for model in models:
    add_file(f"backend/Repositories/I{model}Repository.cs", f"""// Repository interface for {model} specific data operations.
using AssetFlow.Models;

namespace AssetFlow.Repositories;

public interface I{model}Repository : IBaseRepository<{model}>
{{
    // TODO: implement
}}
""")
    add_file(f"backend/Repositories/{model}Repository.cs", f"""// Repository implementation for {model} specific data operations.
using AssetFlow.Models;

namespace AssetFlow.Repositories;

public class {model}Repository : BaseRepository<{model}>, I{model}Repository
{{
    // TODO: implement
}}
""")

# Backend Services
services = ["Auth", "Dashboard", "Organization", "Assets", "Allocations", "Bookings", "Maintenance", "Audits", "Reports", "Notifications"]
for svc in services:
    add_file(f"backend/Services/I{svc}Service.cs", f"""// Service interface defining business logic for the {svc} module.
namespace AssetFlow.Services;

public interface I{svc}Service
{{
    // TODO: implement
}}
""")
    add_file(f"backend/Services/{svc}Service.cs", f"""// Service implementation providing business logic for the {svc} module.
namespace AssetFlow.Services;

public class {svc}Service : I{svc}Service
{{
    // TODO: implement
}}
""")

# Backend Controllers
for ctrl in services:
    add_file(f"backend/Controllers/{ctrl}Controller.cs", f"""// API Controller handling HTTP requests for the {ctrl} module.
using Microsoft.AspNetCore.Mvc;

namespace AssetFlow.Controllers;

[ApiController]
[Route("api/[controller]")]
public class {ctrl}Controller : ControllerBase
{{
    // TODO: implement endpoints
}}
""")

# Backend Hubs
add_file("backend/Hubs/NotificationHub.cs", """// SignalR hub for real-time WebSocket communication and notifications.
using Microsoft.AspNetCore.SignalR;

namespace AssetFlow.Hubs;

public class NotificationHub : Hub
{
    // TODO: implement
}
""")

# Backend Middleware
add_file("backend/Middleware/JwtMiddleware.cs", """// Middleware for validating JWT Bearer tokens on incoming requests.
namespace AssetFlow.Middleware;

public class JwtMiddleware
{
    // TODO: implement
}
""")

add_file("backend/Middleware/RoleGuardMiddleware.cs", """// Middleware for enforcing role-based access control.
namespace AssetFlow.Middleware;

public class RoleGuardMiddleware
{
    // TODO: implement
}
""")

add_file("backend/Middleware/GlobalExceptionHandler.cs", """// Middleware for catching unhandled exceptions and returning standard error responses.
namespace AssetFlow.Middleware;

public class GlobalExceptionHandler
{
    // TODO: implement
}
""")

# Frontend Files
add_file("frontend/package.json", """// Package configuration for the Next.js frontend app.
{
  "name": "assetflow-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "^18",
    "react-dom": "^18",
    "zustand": "^4.5.2",
    "react-hook-form": "^7.51.3",
    "zod": "^3.23.4",
    "sonner": "^1.4.41"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.4.1"
  }
}
""")

add_file("frontend/Dockerfile", """# Dockerfile for building and serving the Next.js frontend application.
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
""")

add_file("frontend/middleware.ts", """// Next.js middleware for route protection and redirecting unauthenticated users.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // TODO: implement route protection logic
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
""")

# Frontend routes
routes = [
    "(auth)/login", "(auth)/signup", "dashboard", "organization", 
    "assets", "allocations", "bookings", "maintenance", 
    "audits", "reports", "notifications"
]

for route in routes:
    add_file(f"frontend/app/{route}/page.tsx", f"""// Main page component for the {route} route.
export default function Page() {{
    return (
        <div>
            <h1>{route} Page</h1>
            {{/* TODO: implement */}}
        </div>
    );
}}
""")
    add_file(f"frontend/app/{route}/loading.tsx", f"""// Loading state component for the {route} route.
export default function Loading() {{
    return <div>Loading...</div>;
}}
""")

# Frontend Components
components = ["auth", "dashboard", "organization", "assets", "allocations", "bookings", "maintenance", "audits", "reports", "notifications"]
for comp in components:
    add_file(f"frontend/components/{comp}/Placeholder.tsx", f"""// Placeholder component for the {comp} module.
export function Placeholder() {{
    // TODO: implement
    return <div>Placeholder</div>;
}}
""")
add_file("frontend/components/ui/button.tsx", """// Reusable Button UI component.
export function Button() {
    // TODO: implement
    return <button>Click me</button>;
}
""")

# Frontend Lib
add_file("frontend/lib/api-client.ts", """// Typed fetch wrapper for interacting with the backend API.
export const apiClient = {
    // TODO: implement
};
""")
add_file("frontend/lib/signalr-client.ts", """// SignalR client configuration for real-time notifications.
export const signalrClient = {
    // TODO: implement
};
""")
add_file("frontend/lib/utils.ts", """// General utility functions and helpers for the frontend.
export function cn() {
    // TODO: implement tailwind class merger (clsx + twMerge)
}
""")

# Frontend Zod Schemas
for model in models:
    model_lower = model.lower()
    add_file(f"frontend/lib/zod-schemas/{model_lower}.ts", f"""// Zod schema definition for {model} validation.
import * as z from 'zod';

export const {model}Schema = z.object({{
    // TODO: implement
}});
""")
    
# Frontend Types
for model in models:
    model_lower = model.lower()
    add_file(f"frontend/types/{model_lower}.ts", f"""// TypeScript interface defining the shape of a {model}.
export interface {model} {{
    // TODO: implement
}}
""")

# Frontend Stores (Zustand)
for store in components:
    add_file(f"frontend/store/{store}Store.ts", f"""// Zustand store for managing {store} state.
import {{create}} from 'zustand';

interface {store.capitalize()}State {{
    // TODO: implement
}}

export const use{store.capitalize()}Store = create<{store.capitalize()}State>((set) => ({{
    // TODO: implement
}}));
""")

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content.strip() + "\\n")
print(f"Scaffolded {len(files)} files in {base_dir}")
