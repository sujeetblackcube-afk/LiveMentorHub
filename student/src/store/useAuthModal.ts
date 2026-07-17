import { create } from 'zustand';

type AuthView = 'login' | 'signup' | 'forgot-password';

interface AuthModalStore {
    isOpen: boolean;
    view: AuthView;
    openLogin: () => void;
    openSignup: () => void;
    openForgotPassword: () => void;
    close: () => void;
}

export const useAuthModal = create<AuthModalStore>((set) => ({
    isOpen: false,
    view: 'login',
    openLogin: () => set({ isOpen: true, view: 'login' }),
    openSignup: () => set({ isOpen: true, view: 'signup' }),
    openForgotPassword: () => set({ isOpen: true, view: 'forgot-password' }),
    close: () => set({ isOpen: false }),
}));
