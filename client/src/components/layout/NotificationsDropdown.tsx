import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "../ui/button";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notification.service";

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const data = await getMyNotifications();
        if (isMounted) {
          setNotifications(data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    void loadNotifications();
    const timer = setInterval(() => {
      void loadNotifications();
    }, 15000);

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      isMounted = false;
      clearInterval(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 rounded-full relative cursor-pointer"
        title="Notifications"
      >
        <Bell className="h-4 w-4 text-foreground/80" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border border-border bg-card text-card-foreground shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-muted/40">
            <span className="font-semibold text-xs tracking-tight">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-medium flex items-center gap-1 text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[320px] overflow-y-auto divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                  className={`p-3 text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${
                    notif.isRead ? "hover:bg-muted/40 text-muted-foreground" : "bg-primary/5 hover:bg-primary/10 text-foreground font-medium"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${
                      notif.isRead ? "bg-transparent" : "bg-primary"
                    }`}
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="leading-snug break-words">{notif.message}</p>
                    <span className="block text-[10px] text-muted-foreground/75">
                      {new Date(notif.createdAt).toLocaleDateString()} at{" "}
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsDropdown;
