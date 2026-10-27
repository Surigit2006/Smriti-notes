
"use client";

import { useEffect, useState } from "react";
import { CloudOff, Wifi } from "lucide-react";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      if (online) {
        setShowOnlineMessage(true);
        const timeout = window.setTimeout(() => {
          setShowOnlineMessage(false);
        }, 2500);

        return timeout;
      }

      setShowOnlineMessage(false);
    };

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      const timeout = updateStatus();
      // The status update is handled even if no timer is returned.
      return timeout;
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineMessage(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showOnlineMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-1/2 top-3 z-[9999] flex -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-lg backdrop-blur-md ${
        isOnline
          ? "border-green-500/20 bg-green-50/95 text-green-800 dark:bg-green-950/95 dark:text-green-200"
          : "border-amber-500/20 bg-amber-50/95 text-amber-900 dark:bg-amber-950/95 dark:text-amber-200"
      }`}
    >
      {isOnline ? <Wifi size={16} /> : <CloudOff size={16} />}
      <span>
        {isOnline
          ? "Back online — you're all synced up"
          : "You're offline — your local notes are still available"}
      </span>
    </div>
  );
}
