import { createContext, useContext, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createApiClient } from '@/utils/api';

const ApiContext = createContext<any>(null);

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
	const auth = useAuth();

	const api = useMemo(
		() =>
			createApiClient({
				getToken: () => auth.token,
				refreshAccessToken: auth.refreshAccessToken,
				logout: auth.logout,
			}),
		[auth]
	);

	return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = () => {
	const ctx = useContext(ApiContext);
	if (!ctx) throw new Error('useApi must be used inside ApiProvider');
	return ctx;
};
