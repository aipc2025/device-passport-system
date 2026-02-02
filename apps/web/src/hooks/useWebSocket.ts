import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  priority?: 'low' | 'normal' | 'high';
  timestamp: Date;
}

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onNotification?: (notification: Notification) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    onNotification,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { token } = useAuthStore();

  const connect = useCallback(() => {
    if (!token) {
      console.warn('Cannot connect to WebSocket: No auth token');
      return;
    }

    if (socketRef.current?.connected) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const wsUrl = apiUrl.replace(/^http/, 'ws');

    socketRef.current = io(`${wsUrl}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      onConnect?.();
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      onDisconnect?.();
    });

    socketRef.current.on('error', (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    });

    socketRef.current.on('notification', (notification: Notification) => {
      console.log('Received notification:', notification);
      setNotifications((prev) => [notification, ...prev]);
      onNotification?.(notification);
    });

    socketRef.current.on('connected', (data) => {
      console.log('WebSocket welcome:', data);
    });
  }, [token, onConnect, onDisconnect, onError, onNotification]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const subscribe = useCallback((channels: string[]) => {
    if (!socketRef.current?.connected) {
      console.warn('Cannot subscribe: Socket not connected');
      return;
    }

    socketRef.current.emit('subscribe', { channels });
  }, []);

  const unsubscribe = useCallback((channels: string[]) => {
    if (!socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit('unsubscribe', { channels });
  }, []);

  const markAsRead = useCallback((notificationIds: string[]) => {
    if (!socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit('mark_read', { notificationIds });

    // Update local state
    setNotifications((prev) =>
      prev.map((n) =>
        notificationIds.includes(n.id) ? { ...n, read: true } : n
      )
    );
  }, []);

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    if (autoConnect && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, token, connect, disconnect]);

  return {
    isConnected,
    notifications,
    unreadCount: notifications.filter((n) => !(n as any).read).length,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    markAsRead,
    clearNotification,
    clearAllNotifications,
  };
}

// Hook for displaying notification toast
export function useNotificationToast() {
  const { notifications } = useWebSocket({
    onNotification: (notification) => {
      // Display toast notification
      console.log('New notification:', notification);
      // Integrate with toast library (e.g., react-hot-toast)
    },
  });

  return { notifications };
}
