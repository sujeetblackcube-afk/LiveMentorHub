import { create } from 'zustand';

export const useAuthModal = create((set) => ({
    isOpen: false,
    view: 'login',
    openLogin: () => set({ isOpen: true, view: 'login' }),
    openSignup: () => set({ isOpen: true, view: 'signup' }),
    openForgotPassword: () => set({ isOpen: true, view: 'forgot-password' }),
    close: () => set({ isOpen: false }),
}));
