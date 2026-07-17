import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    isAuthenticated: boolean;
    user: { name: string; email: string; studentId?: string; country?: string; profileImage?: string } | null;
    login: (userData: { name: string; email: string; studentId?: string; country?: string; profileImage?: string }) => void;
    logout: () => void;
}

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,
            login: (userData) => set({ isAuthenticated: true, user: userData }),
            logout: () => {
                if (typeof window !== "undefined") {
                    localStorage.removeItem("studentId");
                    localStorage.removeItem("country");
                    localStorage.removeItem("cp_token");
                }
                set({ isAuthenticated: false, user: null });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
