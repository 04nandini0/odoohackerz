using QRCoder;

namespace AssetFlow.Services;

public class QRCodeService : IQRCodeService
{
    public byte[] GenerateQRCode(string payload)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);
        
        return qrCode.GetGraphic(20); // 20 pixels per module
    }
}
