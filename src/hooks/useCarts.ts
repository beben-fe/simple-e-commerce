import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Cart, CreateCartRequest } from '@/types/cart';

// Query key for carts
export const cartsQueryKey = ['carts'];

// Fetch all carts
export function useCarts() {
	return useQuery({
		queryKey: cartsQueryKey,
		queryFn: async () => {
			const { data } = await api.get<Cart[]>('/carts');
			return data;
		},
	});
}

// Fetch filtered carts by date range
export function useFilteredCarts(
	dateRange: [Date | null, Date | null],
	enabled = true
) {
	// Check if date range filters are applied
	const hasDateFilter = !!(dateRange[0] || dateRange[1]);

	return useQuery({
		queryKey: [...cartsQueryKey, 'filtered', dateRange],
		queryFn: async () => {
			const { data } = await api.get<Cart[]>('/carts');
			return data;
		},
		select: (data) => {
			// If no filters are applied and not explicitly enabled, return all data
			if (!hasDateFilter) {
				return data;
			}

			return data.filter((cart) => {
				// Date range filtering
				const cartDate = new Date(cart.date);
				cartDate.setHours(0, 0, 0, 0); // Normalize cart date to start of day

				const matchesDateRange =
					(!dateRange[0] || cartDate >= dateRange[0]) &&
					(!dateRange[1] || cartDate <= dateRange[1]);

				return matchesDateRange;
			});
		},
		// Only enable the query if explicitly enabled or if filters are applied
		enabled: enabled && hasDateFilter,
	});
}

// Create a new cart
export function useCreateCart() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (newCart: CreateCartRequest) => {
			const { data } = await api.post<Cart>('/carts', newCart);
			return data;
		},
		onSuccess: (newCart) => {
			// Invalidate and refetch carts query
			queryClient.invalidateQueries({ queryKey: cartsQueryKey });
			// Optionally, update the cache directly
			queryClient.setQueryData<Cart[]>(cartsQueryKey, (oldCarts) => {
				if (!oldCarts) return [newCart];
				return [newCart, ...oldCarts];
			});
		},
	});
}
