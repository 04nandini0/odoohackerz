import * as signalR from "@microsoft/signalr";
import { toast } from "sonner";
import { mutate } from "swr"; // Assuming SWR, or we can just trigger a zustand state

class SignalRClient {
  private connection: signalR.HubConnection | null = null;
  private isConnecting = false;

  public async connect(token: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5000/hubs/notifications", {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .build();

      this.connection.on("ReceiveNotification", (notification: any) => {
        toast(notification.message, {
          description: "New notification",
        });
        // Dispatch event or mutate for notifications feed
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
        }
      });

      this.connection.on("DashboardStale", () => {
        // Trigger SWR/data fetch refresh for KPIs
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('dashboard-stale'));
        }
      });

      await this.connection.start();
      console.log("SignalR Connected");
    } catch (err) {
      console.error("SignalR Connection Error: ", err);
    } finally {
      this.isConnecting = false;
    }
  }

  public disconnect() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }
}

export const signalRClient = new SignalRClient();