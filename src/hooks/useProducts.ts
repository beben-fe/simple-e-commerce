import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Product } from '@/types/cart';

// Query key for products
export const productsQueryKey = ['products'];

// Fetch all products
export function useProducts() {
	return useQuery({
		queryKey: productsQueryKey,
		queryFn: async () => {
			const { data } = await api.get<Product[]>('/products');
			return data;
		},
	});
}
