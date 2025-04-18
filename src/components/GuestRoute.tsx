import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const GuestRoute = () => {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export default GuestRoute;
