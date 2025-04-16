import { useState, useEffect } from 'react';
import { Box, TextField } from '@mui/material';
import { format } from 'date-fns';

interface DateRangePickerProps {
	startDate: Date | null;
	endDate: Date | null;
	onStartDateChange: (date: Date | null) => void;
	onEndDateChange: (date: Date | null) => void;
}

export default function DateRangePicker({
	startDate,
	endDate,
	onStartDateChange,
	onEndDateChange,
}: DateRangePickerProps) {
	const [startDateInput, setStartDateInput] = useState<Date | string>(
		startDate ? format(startDate, 'yyyy-MM-dd') : ''
	);
	const [endDateInput, setEndDateInput] = useState<Date | string>(
		endDate ? format(endDate, 'yyyy-MM-dd') : ''
	);

	const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setStartDateInput(value);
		if (value) {
			const date = new Date(value);
			date.setHours(0, 0, 0, 0); // Set to start of day
			onStartDateChange(date);
		} else {
			onStartDateChange(null);
		}
	};

	const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setEndDateInput(value);
		if (value) {
			const date = new Date(value);
			date.setHours(23, 59, 59, 999); // Set to end of day
			onEndDateChange(date);
		} else {
			onEndDateChange(null);
		}
	};

	// // Sync with parent state
	useEffect(() => {
		setStartDateInput(startDate ? format(startDate, 'yyyy-MM-dd') : '');
		setEndDateInput(endDate ? format(endDate, 'yyyy-MM-dd') : '');
	}, [startDate, endDate]);

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 2,
				flexWrap: 'wrap', // Makes it responsive
			}}>
			<TextField
				label="Start Date"
				type="date"
				value={startDateInput}
				onChange={handleStartDateChange}
				InputLabelProps={{ shrink: true }}
				sx={{
					borderRadius: 2,
					'& .MuiOutlinedInput-root': {
						borderRadius: 2,
					},
					minWidth: 200,
				}}
			/>
			<TextField
				label="End Date"
				type="date"
				value={endDateInput}
				onChange={handleEndDateChange}
				InputLabelProps={{ shrink: true }}
				sx={{
					borderRadius: 2,
					'& .MuiOutlinedInput-root': {
						borderRadius: 2,
					},
					minWidth: 200,
				}}
			/>
		</Box>
	);
}
