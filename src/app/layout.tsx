'use client';

import { Inter } from 'next/font/google';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from '@/contexts/AuthContext';
import QueryProvider from '@/providers/QueryProvider';
import { Header } from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

const theme = createTheme({
	palette: {
		mode: 'light',
		primary: {
			main: '#1976d2',
		},
		secondary: {
			main: '#dc004e',
		},
	},
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<QueryProvider>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						<AuthProvider>
							<Header /> {children}
						</AuthProvider>
					</ThemeProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
