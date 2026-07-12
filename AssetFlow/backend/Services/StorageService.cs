using Amazon.S3;
using Amazon.S3.Model;
using AssetFlow.Config;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace AssetFlow.Services;

public class StorageService : IStorageService
{
    private readonly AmazonS3Client _s3Client;
    private readonly string _bucketName;

    public StorageService(IOptions<MinIOConfig> minioConfig)
    {
        var config = minioConfig.Value;
        _bucketName = config.BucketName;
        
        var s3Config = new AmazonS3Config
        {
            ServiceURL = config.Endpoint,
            ForcePathStyle = true, // Required for MinIO
            UseHttp = !config.UseSSL
        };

        _s3Client = new AmazonS3Client(config.AccessKey, config.SecretKey, s3Config);
        
        EnsureBucketExistsAsync().Wait();
    }

    private async Task EnsureBucketExistsAsync()
    {
        try
        {
            var bucketExists = await Amazon.S3.Util.AmazonS3Util.DoesS3BucketExistV2Async(_s3Client, _bucketName);
            if (!bucketExists)
            {
                var putBucketRequest = new PutBucketRequest
                {
                    BucketName = _bucketName,
                    UseClientRegion = true
                };
                await _s3Client.PutBucketAsync(putBucketRequest);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error ensuring bucket exists: {ex.Message}");
        }
    }

    public async Task<string> UploadFileAsync(IFormFile file, string assetId)
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var key = $"{assetId}/{timestamp}-{file.FileName.Replace(" ", "_")}";

        using var stream = file.OpenReadStream();
        var putRequest = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = stream,
            ContentType = file.ContentType
        };

        await _s3Client.PutObjectAsync(putRequest);

        // Generate the URL (in a real app, might want this to be accessible through a CDN or proxy, but direct S3 URL works for MVP)
        // Since it's MinIO with path style:
        var baseUrl = _s3Client.Config.ServiceURL;
        if (!baseUrl.EndsWith("/")) baseUrl += "/";
        
        return $"{baseUrl}{_bucketName}/{key}";
    }
}
