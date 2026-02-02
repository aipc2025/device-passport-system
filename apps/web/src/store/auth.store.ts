import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, ROLE_PERMISSION_LEVELS } from '@device-passport/shared';

interface AuthState {
  user: Omit<User, 'password'> | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (user: Omit<User, 'password'>, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  isExpert: () => boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      setHasHydrated: (hydrated) => {
        set({ _hasHydrated: hydrated });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      hasRole: (roles: UserRole[]) => {
        const user = get().user;
        if (!user) return false;

        const userLevel = ROLE_PERMISSION_LEVELS[user.role];
        const minRequired = Math.min(...roles.map((r) => ROLE_PERMISSION_LEVELS[r]));

        return userLevel >= minRequired;
      },

      isExpert: () => {
        const user = get().user;
        return !!user?.isExpert;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);
