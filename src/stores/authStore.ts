import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const VALID_CREDENTIALS = {
  email: 'amit.kumar@gmail.com',
  password: '1234567',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (email: string, password: string) => {
        if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
          set({
            user: { email, name: 'Amit Kumar' },
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
