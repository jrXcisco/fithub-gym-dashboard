import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apolloClient } from '../lib/apollo';
import { LOGIN_MUTATION, SIGNUP_MUTATION } from '../graphql/auth';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  gymUuid?: string;
  gymName?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
  gymName?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apolloClient.mutate({
            mutation: LOGIN_MUTATION,
            variables: { email, password },
          });

          const { token, user } = data.login;
          localStorage.setItem('auth-token', token);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({
            isLoading: false,
            error: message,
          });
          return false;
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });
        try {
          const { data: result } = await apolloClient.mutate({
            mutation: SIGNUP_MUTATION,
            variables: data,
          });

          const { token, user } = result.signup;
          localStorage.setItem('auth-token', token);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Signup failed';
          set({
            isLoading: false,
            error: message,
          });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('auth-token');
        apolloClient.clearStore();
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
