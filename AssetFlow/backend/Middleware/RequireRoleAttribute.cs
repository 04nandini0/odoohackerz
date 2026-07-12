using AssetFlow.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace AssetFlow.Middleware;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public class RequireRoleAttribute : Attribute, IAuthorizationFilter
{
    private readonly EmployeeRole[] _roles;

    public RequireRoleAttribute(params EmployeeRole[] roles)
    {
        _roles = roles;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;
        
        if (!user.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value ?? user.FindFirst("role")?.Value;
        
        if (string.IsNullOrEmpty(roleClaim) || !Enum.TryParse<EmployeeRole>(roleClaim, out var userRole))
        {
            context.Result = new ForbidResult();
            return;
        }

        if (!_roles.Contains(userRole))
        {
            context.Result = new ForbidResult();
        }
    }
}
