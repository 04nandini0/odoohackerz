// Configuration bindings for MinIO setup.
namespace AssetFlow.Config;

public class MinIOConfig
{
    public string Endpoint { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string BucketName { get; set; } = "asset-photos";
    public bool UseSSL { get; set; } = false;
}\n