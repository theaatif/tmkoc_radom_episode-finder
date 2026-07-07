// Slice design for client-side Auth state management (Zustand/Redux style)
import { User } from "./hooks/useAuth";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
};

export const authActions = {
  setSession: (user: User, accessToken: string) => ({
    type: "SET_SESSION",
    payload: { user, accessToken },
  }),
  clearSession: () => ({
    type: "CLEAR_SESSION",
  }),
  setLoading: (isLoading: boolean) => ({
    type: "SET_LOADING",
    payload: isLoading,
  }),
};
