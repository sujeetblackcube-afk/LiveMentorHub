import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';

export default function Page() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        } else {
            navigate('/auth/login', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return null;
}
