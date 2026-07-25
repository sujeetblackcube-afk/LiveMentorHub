import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    isAuthenticated: boolean;
    user: { name: string; email: string; studentId?: string; country?: string; profileImage?: string } | null;
    login: (userData: { name: string; email: string; studentId?: string; country?: string; profileImage?: string }) => void;
    updateUser: (partialData: Partial<{ name: string; email: string; studentId?: string; country?: string; profileImage?: string }>) => void;
    logout: () => void;
}

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,
            login: (userData) => set({ isAuthenticated: true, user: userData }),
            updateUser: (partialData) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...partialData } : (partialData as any),
                })),
            logout: () => {
                if (typeof window !== "undefined") {
                    const token = localStorage.getItem("cp_token");
                    if (token) {
                        const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
                        fetch(`${apiBase}/api/auth/logout`, {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }).catch(() => {});
                    }
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
