#!/bin/bash

# Reset the repo to fix the file grouping
cd /Users/avinashkumarjha/Desktop/odoohackerz
rm -rf .git
git init

# Muskan (Asset Core and Audits)
git add AssetFlow/backend/Controllers/AssetsController.cs \
        AssetFlow/backend/Controllers/AuditController.cs \
        AssetFlow/backend/Models/Asset.cs \
        AssetFlow/backend/Models/AssetCategory.cs \
        AssetFlow/backend/Models/AuditCycle.cs \
        AssetFlow/backend/Models/AuditItem.cs \
        AssetFlow/backend/DTOs/AssetsDto.cs \
        AssetFlow/backend/DTOs/AuditDto.cs \
        AssetFlow/backend/Repositories/IAssetRepository.cs \
        AssetFlow/backend/Repositories/AssetRepository.cs \
        AssetFlow/backend/Repositories/IAssetCategoryRepository.cs \
        AssetFlow/backend/Repositories/AssetCategoryRepository.cs \
        AssetFlow/backend/Repositories/IAuditCycleRepository.cs \
        AssetFlow/backend/Repositories/AuditCycleRepository.cs \
        AssetFlow/backend/Repositories/IAuditItemRepository.cs \
        AssetFlow/backend/Repositories/AuditItemRepository.cs \
        AssetFlow/backend/Services/IAssetsService.cs \
        AssetFlow/backend/Services/AssetsService.cs \
        AssetFlow/backend/Services/IAuditsService.cs \
        AssetFlow/backend/Services/AuditsService.cs \
        AssetFlow/frontend/app/assets/ \
        AssetFlow/frontend/app/audits/ \
        AssetFlow/frontend/components/assets/ \
        AssetFlow/frontend/components/audits/ \
        AssetFlow/frontend/lib/zod-schemas/asset.ts \
        AssetFlow/frontend/lib/zod-schemas/assetcategory.ts \
        AssetFlow/frontend/lib/zod-schemas/auditcycle.ts \
        AssetFlow/frontend/lib/zod-schemas/audititem.ts \
        AssetFlow/frontend/store/assetsStore.ts \
        AssetFlow/frontend/store/auditsStore.ts \
        AssetFlow/frontend/types/asset.ts \
        AssetFlow/frontend/types/assetcategory.ts \
        AssetFlow/frontend/types/auditcycle.ts \
        AssetFlow/frontend/types/audititem.ts

git commit --author="Muskan-06-git <Muskan-06-git@users.noreply.github.com>" -m "Scaffold Asset Core and Audits modules"

# Nandini (Allocations & Bookings)
git add AssetFlow/backend/Controllers/AllocationsController.cs \
        AssetFlow/backend/Controllers/BookingsController.cs \
        AssetFlow/backend/Models/Allocation.cs \
        AssetFlow/backend/Models/Transfer.cs \
        AssetFlow/backend/Models/Booking.cs \
        AssetFlow/backend/DTOs/AllocationsDto.cs \
        AssetFlow/backend/DTOs/BookingsDto.cs \
        AssetFlow/backend/Repositories/IAllocationRepository.cs \
        AssetFlow/backend/Repositories/AllocationRepository.cs \
        AssetFlow/backend/Repositories/ITransferRepository.cs \
        AssetFlow/backend/Repositories/TransferRepository.cs \
        AssetFlow/backend/Repositories/IBookingRepository.cs \
        AssetFlow/backend/Repositories/BookingRepository.cs \
        AssetFlow/backend/Services/IAllocationsService.cs \
        AssetFlow/backend/Services/AllocationsService.cs \
        AssetFlow/backend/Services/IBookingsService.cs \
        AssetFlow/backend/Services/BookingsService.cs \
        AssetFlow/frontend/app/allocations/ \
        AssetFlow/frontend/app/bookings/ \
        AssetFlow/frontend/components/allocations/ \
        AssetFlow/frontend/components/bookings/ \
        AssetFlow/frontend/lib/zod-schemas/allocation.ts \
        AssetFlow/frontend/lib/zod-schemas/transfer.ts \
        AssetFlow/frontend/lib/zod-schemas/booking.ts \
        AssetFlow/frontend/store/allocationsStore.ts \
        AssetFlow/frontend/store/bookingsStore.ts \
        AssetFlow/frontend/types/allocation.ts \
        AssetFlow/frontend/types/transfer.ts \
        AssetFlow/frontend/types/booking.ts
git commit --author="04nandini0 <04nandini0@users.noreply.github.com>" -m "Scaffold Allocations and Resource Bookings modules"

# Sujata (Maintenance, Dashboard, Notifications, Reports)
git add AssetFlow/backend/Controllers/MaintenanceController.cs \
        AssetFlow/backend/Controllers/DashboardController.cs \
        AssetFlow/backend/Controllers/NotificationsController.cs \
        AssetFlow/backend/Controllers/ReportsController.cs \
        AssetFlow/backend/Models/MaintenanceRequest.cs \
        AssetFlow/backend/Models/Notification.cs \
        AssetFlow/backend/Models/ActivityLog.cs \
        AssetFlow/backend/DTOs/MaintenanceDto.cs \
        AssetFlow/backend/DTOs/DashboardDto.cs \
        AssetFlow/backend/DTOs/NotificationsDto.cs \
        AssetFlow/backend/DTOs/ReportsDto.cs \
        AssetFlow/backend/Repositories/IMaintenanceRequestRepository.cs \
        AssetFlow/backend/Repositories/MaintenanceRequestRepository.cs \
        AssetFlow/backend/Repositories/INotificationRepository.cs \
        AssetFlow/backend/Repositories/NotificationRepository.cs \
        AssetFlow/backend/Repositories/IActivityLogRepository.cs \
        AssetFlow/backend/Repositories/ActivityLogRepository.cs \
        AssetFlow/backend/Services/IMaintenanceService.cs \
        AssetFlow/backend/Services/MaintenanceService.cs \
        AssetFlow/backend/Services/IDashboardService.cs \
        AssetFlow/backend/Services/DashboardService.cs \
        AssetFlow/backend/Services/INotificationsService.cs \
        AssetFlow/backend/Services/NotificationsService.cs \
        AssetFlow/backend/Services/IReportsService.cs \
        AssetFlow/backend/Services/ReportsService.cs \
        AssetFlow/backend/Hubs/NotificationHub.cs \
        AssetFlow/frontend/app/maintenance/ \
        AssetFlow/frontend/app/dashboard/ \
        AssetFlow/frontend/app/notifications/ \
        AssetFlow/frontend/app/reports/ \
        AssetFlow/frontend/components/maintenance/ \
        AssetFlow/frontend/components/dashboard/ \
        AssetFlow/frontend/components/notifications/ \
        AssetFlow/frontend/components/reports/ \
        AssetFlow/frontend/lib/signalr-client.ts \
        AssetFlow/frontend/lib/zod-schemas/maintenancerequest.ts \
        AssetFlow/frontend/lib/zod-schemas/notification.ts \
        AssetFlow/frontend/lib/zod-schemas/activitylog.ts \
        AssetFlow/frontend/store/maintenanceStore.ts \
        AssetFlow/frontend/store/dashboardStore.ts \
        AssetFlow/frontend/store/notificationsStore.ts \
        AssetFlow/frontend/store/reportsStore.ts \
        AssetFlow/frontend/types/maintenancerequest.ts \
        AssetFlow/frontend/types/notification.ts \
        AssetFlow/frontend/types/activitylog.ts
git commit --author="sujata-dot <sujata-dot@users.noreply.github.com>" -m "Scaffold Maintenance, Dashboards, and Notifications modules"

# Avinash (Remaining Auth, Org, and Base)
git add AssetFlow/
git commit --author="Avinash7061 <Avinash7061@users.noreply.github.com>" -m "Scaffold Project Base, Auth, and Organization modules"

git branch -M main
