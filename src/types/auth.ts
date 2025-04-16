export interface User {
	id: number;
	username: string;
	email: string;
}

export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	token: string | null;
}

export interface LoginCredentials {
	username: string;
	password: string;
}
