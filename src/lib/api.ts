import axios from 'axios';
import Cookies from 'js-cookie';

// Create an Axios instance with default config
const api = axios.create({
	baseURL: 'https://fakestoreapi.com',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Add a request interceptor to add auth token if available
api.interceptors.request.use(
	(config) => {
		const token = Cookies.get('auth_token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default api;
