"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

interface QRCodeDisplayProps {
  assetId: string;
}

export default function QRCodeDisplay({ assetId }: QRCodeDisplayProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string;

    const fetchQrCode = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const response = await fetch(`/api/assets/${assetId}/qr`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        if (!response.ok) throw new Error("Failed to load");
        
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setImgUrl(objectUrl);
      } catch (e) {
        console.error("Failed to load QR code", e);
      }
    };

    fetchQrCode();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [assetId]);

  if (!imgUrl) return <div className="w-32 h-32 bg-gray-100 animate-pulse rounded-md"></div>;

  return <img src={imgUrl} alt="Asset QR Code" className="w-32 h-32 object-contain" />;
}
