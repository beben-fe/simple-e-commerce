import axios from 'axios';

const api = axios.create({
	baseURL: 'https://fakestoreapi.com',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
	(config) => {
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add a response interceptor for error handling
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response) {
			console.error('Response error:', error.response.data);
		} else if (error.request) {
			console.error('Request error:', error.request);
		} else {
			console.error('Error:', error.message);
		}
		return Promise.reject(error);
	}
);

export default api;
