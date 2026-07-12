using Microsoft.AspNetCore.Http;

namespace AssetFlow.Services;

public interface IStorageService
{
    Task<string> UploadFileAsync(IFormFile file, string assetId);
}
