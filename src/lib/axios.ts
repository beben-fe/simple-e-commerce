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
		// You can add auth token here if needed
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
		// Handle specific error cases
		if (error.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
			console.error('Response error:', error.response.data);
		} else if (error.request) {
			// The request was made but no response was received
			console.error('Request error:', error.request);
		} else {
			// Something happened in setting up the request that triggered an Error
			console.error('Error:', error.message);
		}
		return Promise.reject(error);
	}
);

export default api;
