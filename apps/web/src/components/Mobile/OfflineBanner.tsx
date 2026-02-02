import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/usePWA';
import { useState, useEffect } from 'react';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [show, setShow] = useState(!isOnline);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
      setWasOffline(true);
    } else if (wasOffline) {
      // Show reconnected message briefly
      setTimeout(() => {
        setShow(false);
        setWasOffline(false);
      }, 3000);
    }
  }, [isOnline, wasOffline]);

  if (!show) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 text-white text-center text-sm font-medium transition-transform duration-300 ${
        isOnline
          ? 'bg-green-600'
          : 'bg-red-600'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>已重新连接到网络</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>您当前处于离线状态</span>
          </>
        )}
      </div>
    </div>
  );
}
