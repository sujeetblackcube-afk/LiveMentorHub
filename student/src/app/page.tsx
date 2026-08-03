'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import LandingPage from './LandingPage';

export default function Page() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/student/dashboard');
        }
    }, [isAuthenticated, router]);

    return isAuthenticated ? null : <LandingPage />;
}
