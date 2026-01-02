import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: (failureCount, error: any) => {
				if (error?.status === 401 || error?.status === 403) return false;
				return failureCount < 2;
			},
			refetchOnWindowFocus: false,
			staleTime: 30 * 1000,
		},
		mutations: {
			retry: false,
		},
	},
});

export default queryClient;
