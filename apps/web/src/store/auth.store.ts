import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@device-passport/shared';

interface AuthState {
  user: Omit<User, 'password'> | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: Omit<User, 'password'>, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  isExpert: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
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

        const roleHierarchy: Record<UserRole, number> = {
          [UserRole.PUBLIC]: 0,
          [UserRole.CUSTOMER]: 1,
          [UserRole.ENGINEER]: 2,
          [UserRole.QC_INSPECTOR]: 3,
          [UserRole.OPERATOR]: 4,
          [UserRole.ADMIN]: 5,
        };

        const userLevel = roleHierarchy[user.role];
        const minRequired = Math.min(...roles.map((r) => roleHierarchy[r]));

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
    }
  )
);
