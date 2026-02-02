import toast, { Toaster } from 'react-hot-toast';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Bell, AlertCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const iconMap = {
  high: AlertCircle,
  normal: Bell,
  low: Info,
};

const colorMap = {
  high: 'text-red-600',
  normal: 'text-blue-600',
  low: 'text-gray-600',
};

export function NotificationToast() {
  useWebSocket({
    onNotification: (notification) => {
      const Icon = iconMap[notification.priority || 'normal'];
      const color = colorMap[notification.priority || 'normal'];

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {notification.message}
                  </p>
                  {notification.actionUrl && (
                    <Link
                      to={notification.actionUrl}
                      onClick={() => toast.dismiss(t.id)}
                      className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      查看详情 →
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
              >
                关闭
              </button>
            </div>
          </div>
        ),
        {
          duration: 5000,
          position: 'top-right',
        }
      );

      // Play notification sound (optional)
      if ('Notification' in window && Notification.permission === 'granted') {
        // You can also show browser notification
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
        });
      }
    },
    onConnect: () => {
      console.log('WebSocket connected');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    },
  });

  return <Toaster />;
}
