import { useState } from 'react';
import { Bell, X, Check, ExternalLink } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    clearNotification,
    clearAllNotifications,
  } = useWebSocket();

  const getPriorityColor = (priority: string = 'normal') => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'low':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead([notificationId]);
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有通知吗？')) {
      clearAllNotifications();
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl z-50 border border-gray-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                通知中心
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({unreadCount} 条未读)
                  </span>
                )}
              </h3>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  清空全部
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>暂无通知</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Priority Indicator */}
                        <div
                          className={`w-1 h-full rounded-full ${
                            notification.priority === 'high'
                              ? 'bg-red-500'
                              : notification.priority === 'low'
                              ? 'bg-gray-400'
                              : 'bg-blue-500'
                          }`}
                        />

                        <div className="flex-1 min-w-0">
                          {/* Title */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5" />
                            )}
                          </div>

                          {/* Message */}
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>

                          {/* Timestamp */}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(notification.timestamp), {
                              addSuffix: true,
                              locale: zhCN,
                            })}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-2">
                            {notification.actionUrl && (
                              <Link
                                to={notification.actionUrl}
                                onClick={() => {
                                  handleMarkAsRead(notification.id);
                                  setIsOpen(false);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                              >
                                查看详情
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                标记已读
                              </button>
                            )}
                            <button
                              onClick={() => clearNotification(notification.id)}
                              className="text-xs text-gray-600 hover:text-red-600 font-medium flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  查看全部通知
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
