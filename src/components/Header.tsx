'use client';

import {
	AppBar,
	Avatar,
	Box,
	IconButton,
	Menu,
	MenuItem,
	Toolbar,
	Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { User } from '@/types/auth';

export function Header() {
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const cookie = Cookies.get('user_data');
	const userData = cookie ? (JSON.parse(cookie) as User) : undefined;

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleLogout = () => {
		Cookies.remove('user_data');
		Cookies.remove('auth_token');
		handleClose();
		router.replace('/login');
	};

	return (
		<AppBar position="static" color="default" elevation={1}>
			<Toolbar sx={{ justifyContent: 'space-between' }}>
				<Typography variant="h6" sx={{ fontWeight: 600 }}>
					Carts Management
				</Typography>

				<Box>
					<IconButton onClick={handleClick} size="small">
						<Avatar src={'/avatar.png'} alt={userData?.username} />
					</IconButton>
					<Menu
						anchorEl={anchorEl}
						open={open}
						onClose={handleClose}
						onClick={handleClose}
						transformOrigin={{ horizontal: 'right', vertical: 'top' }}
						anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
						<MenuItem disabled>
							<Box>
								<Typography variant="subtitle1" fontWeight={600}>
									{userData?.username}
								</Typography>
							</Box>
						</MenuItem>
						<MenuItem onClick={handleLogout}>
							<LogoutIcon fontSize="small" sx={{ mr: 1 }} />
							Logout
						</MenuItem>
					</Menu>
				</Box>
			</Toolbar>
		</AppBar>
	);
}
