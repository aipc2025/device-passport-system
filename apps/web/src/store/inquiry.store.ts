import { create } from 'zustand';

interface InquiryState {
  // Unread count
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: () => void;

  // Active view
  activeView: 'all' | 'sent' | 'received';
  setActiveView: (view: 'all' | 'sent' | 'received') => void;

  // Polling interval (for real-time updates)
  pollingEnabled: boolean;
  setPollingEnabled: (enabled: boolean) => void;
}

export const useInquiryStore = create<InquiryState>()((set) => ({
  // Unread count
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  // Active view
  activeView: 'all',
  setActiveView: (activeView) => set({ activeView }),

  // Polling
  pollingEnabled: true,
  setPollingEnabled: (pollingEnabled) => set({ pollingEnabled }),
}));
