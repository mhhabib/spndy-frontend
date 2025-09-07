// src/contexts/AuthContext.tsx
import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	ReactNode,
	useCallback,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '@/config/Config';

/**
 * Configuration
 * - PERSIST_ACCESS_TOKEN: if true, the access token will be stored in sessionStorage.
 *   Default: false (recommended). If you turn it on, you're trading a bit of UX
 *   (fewer refresh calls) for slightly higher XSS risk.
 */
const PERSIST_ACCESS_TOKEN = false;
const ACCESS_TOKEN_KEY = 'spndy_access_token';

type DecodedToken = {
	id: string;
	username: string;
	email: string;
	exp?: number;
	iat?: number;
};

export type AuthState = {
	token: string | null;
	userId: string | null;
	username: string | null;
	email: string | null;
	isAuthenticated: boolean;
	loading: boolean; // initial session restore/loading
};

export type AuthContextType = AuthState & {
	login: (email: string, password: string) => Promise<boolean>;
	signup: (
		username: string,
		email: string,
		password: string
	) => Promise<boolean>;
	logout: () => Promise<void>;
	refreshAccessToken: () => Promise<string | null>;
	setTokenManually: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [token, setToken] = useState<string | null>(() => {
		if (PERSIST_ACCESS_TOKEN) {
			return sessionStorage.getItem(ACCESS_TOKEN_KEY);
		}
		return null;
	});
	const [userId, setUserId] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);
	const [email, setEmail] = useState<string | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
	const [loading, setLoading] = useState<boolean>(true);

	// Refresh queue control
	const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

	const updateTokenInfo = useCallback((newToken: string | null) => {
		if (!newToken) {
			setUserId(null);
			setUsername(null);
			setEmail(null);
			setIsAuthenticated(false);
			if (PERSIST_ACCESS_TOKEN) sessionStorage.removeItem(ACCESS_TOKEN_KEY);
			return;
		}

		try {
			const decoded = jwtDecode<DecodedToken>(newToken);
			setUserId(decoded.id ?? null);
			setUsername(decoded.username ?? null);
			setEmail(decoded.email ?? null);
			setIsAuthenticated(true);
			if (PERSIST_ACCESS_TOKEN)
				sessionStorage.setItem(ACCESS_TOKEN_KEY, newToken);
		} catch (err) {
			// invalid token
			setUserId(null);
			setUsername(null);
			setEmail(null);
			setIsAuthenticated(false);
			if (PERSIST_ACCESS_TOKEN) sessionStorage.removeItem(ACCESS_TOKEN_KEY);
		}
	}, []);

	// setter that keeps state + storage consistent
	const setTokenManually = useCallback(
		(t: string | null) => {
			setToken(t);
			updateTokenInfo(t);
		},
		[updateTokenInfo]
	);

	// login / signup / logout implementations
	const login = useCallback(
		async (emailParam: string, password: string) => {
			try {
				const res = await fetch(`${API_BASE_URL}/auth/login`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include', // refresh cookie will be set by backend
					body: JSON.stringify({ email: emailParam, password }),
				});

				if (!res.ok) return false;
				const data = await res.json();
				if (data?.token) {
					setTokenManually(data.token);
					return true;
				}
				return false;
			} catch (err) {
				console.error('Auth login error', err);
				return false;
			}
		},
		[setTokenManually]
	);

	const signup = useCallback(
		async (usernameParam: string, emailParam: string, password: string) => {
			try {
				const res = await fetch(`${API_BASE_URL}/auth/signup`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({
						username: usernameParam,
						email: emailParam,
						password,
					}),
				});
				return res.ok;
			} catch (err) {
				console.error('Auth signup error', err);
				return false;
			}
		},
		[]
	);

	const logout = useCallback(async () => {
		try {
			// clear server-side cookie if endpoint exists
			await fetch(`${API_BASE_URL}/auth/logout`, {
				method: 'POST',
				credentials: 'include',
			});
		} catch (err) {
			console.warn('Logout request failed', err);
		} finally {
			setToken(null);
			updateTokenInfo(null);
		}
	}, [updateTokenInfo]);

	/**
	 * refreshAccessToken
	 * - ensures only one refresh request is in-flight (queueing).
	 * - returns new access token (string) or null if refresh failed.
	 */
	const refreshAccessToken = useCallback(async (): Promise<string | null> => {
		// if there is already a refresh in progress, return the same promise
		if (refreshPromiseRef.current) {
			return refreshPromiseRef.current;
		}

		const p = (async () => {
			try {
				const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
					method: 'POST',
					credentials: 'include', // send refresh token cookie
				});

				if (!res.ok) {
					// failed to refresh (no cookie, expired, or server returned error)
					setToken(null);
					updateTokenInfo(null);
					return null;
				}
				const data = await res.json();
				if (data?.token) {
					setToken(data.token);
					updateTokenInfo(data.token);
					return data.token;
				} else {
					setToken(null);
					updateTokenInfo(null);
					return null;
				}
			} catch (err) {
				console.error('refreshAccessToken error', err);
				setToken(null);
				updateTokenInfo(null);
				return null;
			} finally {
				// clear the ref so future refreshes can run
				refreshPromiseRef.current = null;
			}
		})();

		refreshPromiseRef.current = p;
		return p;
	}, [updateTokenInfo]);

	// On mount: try to restore session by calling refresh endpoint
	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			// If we persisted access token, use it quickly (optional)
			if (PERSIST_ACCESS_TOKEN) {
				const stored = sessionStorage.getItem(ACCESS_TOKEN_KEY);
				if (stored) {
					setToken(stored);
					updateTokenInfo(stored);
				}
			}

			// Always try refresh to get a fresh token (if cookie is present)
			const t = await refreshAccessToken();
			if (mounted) {
				// if refresh returned null and we had no token, we are logged out;
				// if refresh returned token it has been set already by refreshAccessToken
				setLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // run once

	// keep derived state consistent
	useEffect(() => {
		setIsAuthenticated(!!token);
	}, [token]);

	const contextValue: AuthContextType = {
		token,
		userId,
		username,
		email,
		isAuthenticated,
		loading,
		login,
		signup,
		logout,
		refreshAccessToken,
		setTokenManually,
	};

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
};

export function useAuth(): AuthContextType {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}
