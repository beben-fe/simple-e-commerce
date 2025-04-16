import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
	Dispatch,
	SetStateAction,
} from 'react';
import Cookies from 'js-cookie';
import { AuthState, LoginCredentials, User } from '@/types/auth';
import api from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

interface AuthContextType extends AuthState {
	login: (credentials: LoginCredentials) => Promise<void>;
	logout: () => void;
	authChecked: boolean;
	setAuthChecked: Dispatch<SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [authState, setAuthState] = useState<AuthState>({
		user: null,
		isAuthenticated: false,
		token: null,
	});
	const [authChecked, setAuthChecked] = useState(false);

	// Restore auth state from cookies on mount
	useEffect(() => {
		const token = Cookies.get('auth_token');
		const userData = Cookies.get('user_data');

		// If we have token and user data, restore both
		if (token && userData) {
			try {
				const user = JSON.parse(userData) as User;
				setAuthState({
					user,
					isAuthenticated: true,
					token,
				});
			} catch (error) {
				console.error('Error parsing user data:', error);
				// If user data is invalid but token exists, create default user
				if (token) {
					const defaultUser: User = {
						id: 1,
						username: 'user',
						email: 'user@example.com',
					};
					setAuthState({
						user: defaultUser,
						isAuthenticated: true,
						token,
					});
				} else {
					// Clear invalid cookies if no token
					Cookies.remove('auth_token');
					Cookies.remove('user_data');
				}
			}
		}
		// If we only have the token, create a default user
		else if (token) {
			setAuthState({
				...authState,
				isAuthenticated: true,
				token,
			});
		}

		setAuthChecked(true);
	}, []);

	const loginMutation = useMutation({
		mutationFn: async (credentials: LoginCredentials) => {
			// Using Axios for API request
			const response = await api.post('/auth/login', credentials);
			return response.data;
		},
		onSuccess: (data) => {
			const token = data.token;

			// Set cookies
			Cookies.set('auth_token', token, { expires: 7 });

			setAuthState({
				...authState,
				isAuthenticated: true,
				token,
			});
		},
	});

	const login = async (credentials: LoginCredentials) => {
		try {
			await loginMutation.mutateAsync(credentials);
		} catch (error) {
			throw error;
		}
	};

	const logout = () => {
		// Clear cookies
		Cookies.remove('auth_token');
		Cookies.remove('user_data');

		setAuthState({
			user: null,
			isAuthenticated: false,
			token: null,
		});
	};

	return (
		<AuthContext.Provider
			value={{ ...authState, login, logout, authChecked, setAuthChecked }}>
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
