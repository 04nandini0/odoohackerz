"use client";

import AssetRegistrationForm from "@/components/assets/AssetRegistrationForm";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewAssetPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "Admin" && user.role !== "AssetManager") {
      router.push("/assets");
    }
  }, [user, router]);

  if (!user || (user.role !== "Admin" && user.role !== "AssetManager")) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
      <AssetRegistrationForm />
    </div>
  );
}
