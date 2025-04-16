'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Container, CircularProgress, Typography } from '@mui/material';

export default function Home() {
	const router = useRouter();
	const { isAuthenticated, authChecked } = useAuth();

	useEffect(() => {
		// Only redirect after authentication has been checked
		if (authChecked) {
			if (isAuthenticated) {
				router.push('/carts');
			} else {
				router.push('/login');
			}
		}
	}, [isAuthenticated, router, authChecked]);

	return (
		<Container maxWidth="lg" sx={{ my: 4, textAlign: 'center' }}>
			<CircularProgress />
			<Typography variant="body1" sx={{ mt: 2 }}>
				Loading...
			</Typography>
		</Container>
	);
}
