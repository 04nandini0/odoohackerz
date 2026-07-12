// Configuration bindings for Mongo setup.
namespace AssetFlow.Config;

public class MongoConfig
{
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
}