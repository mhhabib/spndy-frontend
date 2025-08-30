import React, {
	createContext,
	useContext,
	useState,
	ReactNode,
	useEffect,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '@/config/Config';

interface DecodedToken {
	email: string;
	username: string;
	id: string;
}

interface AuthContextType {
	token: string | null;
	username: string | null;
	email: string | null;
	userId: string | null;

	isAuthenticated: boolean;
	login: (email: string, password: string) => Promise<boolean>;
	signup: (
		username: string,
		email: string,
		password: string
	) => Promise<boolean>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [token, setToken] = useState<string | null>(() =>
		localStorage.getItem('access_token')
	);
	const [username, setUsername] = useState<string | null>(null);
	const [email, setEmail] = useState<string | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
	const [userId, setUserId] = useState<string | null>(null);

	const updateTokenInfo = (newToken: string | null) => {
		if (!newToken) {
			setUsername(null);
			setEmail(null);
			setUserId(null);
			setIsAuthenticated(false);
			return;
		}

		try {
			const decoded = jwtDecode<DecodedToken>(newToken);
			setUsername(decoded.username);
			setEmail(decoded.email);
			setUserId(decoded.id);
			setIsAuthenticated(true);
		} catch {
			setUsername(null);
			setEmail(null);
			setUserId(null);
			setIsAuthenticated(false);
		}
	};

	// Update state when token changes
	useEffect(() => {
		updateTokenInfo(token);
	}, [token]);

	const login = async (email: string, password: string): Promise<boolean> => {
		// This is a mock login function. In a real app, you would call an API.
		try {
			const response = await fetch(`${API_BASE_URL}/auth/login`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});

			if (response.ok) {
				const data = await response.json();
				console.log('Login data ', data);
				localStorage.setItem('access_token', data.token);
				setToken(data.token);
				return true;
			}
			return false;
		} catch (error) {
			console.error('Login error:', error);
			return false;
		}
	};

	const signup = async (
		username: string,
		email: string,
		password: string
	): Promise<boolean> => {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/signup`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, email, password }),
			});
			console.log('Response ', response);
			if (response.ok) {
				return true;
			} else {
				return false;
			}
		} catch (error) {
			return false;
		}
	};

	const logout = () => {
		setToken(null);
		localStorage.removeItem('access_token');
	};

	return (
		<AuthContext.Provider
			value={{
				token,
				userId,
				username,
				email,
				isAuthenticated,
				login,
				signup,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
