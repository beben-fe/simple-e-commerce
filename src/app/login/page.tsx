'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
	Container,
	Paper,
	TextField,
	Button,
	Typography,
	Box,
	Snackbar,
	Alert,
	CircularProgress,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials } from '@/types/auth';
import axios from 'axios';

export default function LoginPage() {
	const router = useRouter();
	const { login, isAuthenticated, authChecked } = useAuth();
	const [error, setError] = useState<string>('');
	const [showSuccess, setShowSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginCredentials>();

	// Check if user is already authenticated
	useEffect(() => {
		if (authChecked) {
			if (isAuthenticated) {
				router.push('/carts');
			} else {
				setIsLoading(false);
			}
		}
	}, [isAuthenticated, router, authChecked]);

	const onSubmit = async (data: LoginCredentials) => {
		try {
			await login(data);
			setShowSuccess(true);
			setTimeout(() => {
				router.push('/carts');
			}, 1500);
		} catch (err) {
			if (axios.isAxiosError(err)) {
				// Handle Axios specific errors
				if (err.response) {
					// The request was made and the server responded with a status code
					// that falls out of the range of 2xx
					setError(err.response.data.message || 'Login failed');
				} else if (err.request) {
					// The request was made but no response was received
					setError('No response from server');
				} else {
					// Something happened in setting up the request that triggered an Error
					setError('Error setting up request');
				}
			} else {
				// Handle other errors
				setError('Invalid credentials');
			}
		}
	};

	// Show loading indicator while checking authentication
	if (isLoading) {
		return (
			<Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
				<CircularProgress />
			</Container>
		);
	}

	return (
		<Container component="main" maxWidth="xs">
			<Box
				sx={{
					marginTop: 8,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}>
				<Paper
					elevation={3}
					sx={{
						padding: 4,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						width: '100%',
					}}>
					<Typography component="h1" variant="h5">
						Sign in
					</Typography>
					<Box
						component="form"
						onSubmit={handleSubmit(onSubmit)}
						sx={{ mt: 1, width: '100%' }}>
						<TextField
							margin="normal"
							required
							fullWidth
							id="username"
							label="Username"
							autoComplete="username"
							autoFocus
							{...register('username', {
								required: 'Username is required',
								minLength: {
									value: 8,
									message: 'Username must be at least 8 characters',
								},
							})}
							error={!!errors.username}
							helperText={errors.username?.message}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							label="Password"
							type="password"
							id="password"
							autoComplete="current-password"
							{...register('password', {
								required: 'Password is required',
								minLength: {
									value: 4,
									message: 'Password must be at least 8 characters',
								},
							})}
							error={!!errors.password}
							helperText={errors.password?.message}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}>
							Sign In
						</Button>
					</Box>
				</Paper>
			</Box>
			<Snackbar
				open={!!error}
				autoHideDuration={6000}
				onClose={() => setError('')}>
				<Alert severity="error" onClose={() => setError('')}>
					{error}
				</Alert>
			</Snackbar>
			<Snackbar
				open={showSuccess}
				autoHideDuration={6000}
				onClose={() => setShowSuccess(false)}>
				<Alert severity="success" onClose={() => setShowSuccess(false)}>
					Login successful!
				</Alert>
			</Snackbar>
		</Container>
	);
}
