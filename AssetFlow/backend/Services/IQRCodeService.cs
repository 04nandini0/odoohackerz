namespace AssetFlow.Services;

public interface IQRCodeService
{
    byte[] GenerateQRCode(string payload);
}
