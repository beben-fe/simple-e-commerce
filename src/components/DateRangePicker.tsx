import { useState, useEffect } from 'react';
import { Box, TextField } from '@mui/material';

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
	const [startDateInput, setStartDateInput] = useState<string>(
		startDate ? startDate.toISOString().split('T')[0] : ''
	);
	const [endDateInput, setEndDateInput] = useState<string>(
		endDate ? endDate.toISOString().split('T')[0] : ''
	);

	// Sync with parent state
	useEffect(() => {
		setStartDateInput(startDate ? startDate.toISOString().split('T')[0] : '');
		setEndDateInput(endDate ? endDate.toISOString().split('T')[0] : '');
	}, [startDate, endDate]);

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

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
			<TextField
				label="Start Date"
				type="date"
				value={startDateInput}
				onChange={handleStartDateChange}
				InputLabelProps={{ shrink: true }}
			/>
			<TextField
				label="End Date"
				type="date"
				value={endDateInput}
				onChange={handleEndDateChange}
				InputLabelProps={{ shrink: true }}
			/>
		</Box>
	);
}
