import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuth = create(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,
            login: (userData) => set({ isAuthenticated: true, user: userData }),
            updateUser: (partialData) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...partialData } : partialData,
                })),
            logout: () => {
                if (typeof window !== "undefined") {
                    const token = localStorage.getItem("cp_token");
                    if (token) {
                        const apiBase = import.meta.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
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
