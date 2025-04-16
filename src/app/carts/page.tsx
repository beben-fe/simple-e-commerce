'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
	Box,
	Button,
	Container,
	Paper,
	Typography,
	Snackbar,
	Alert,
	CircularProgress,
	useTheme,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	List,
	ListItem,
	ListItemText,
	Divider,
	IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import {
	DataGrid,
	GridColDef,
	GridRenderCellParams,
	gridClasses,
} from '@mui/x-data-grid';
import { useAuth } from '@/contexts/AuthContext';
import { Cart, Product, CartItem } from '@/types/cart';
import DateRangePicker from '@/components/DateRangePicker';
import { CreateCartDialog } from '@/components/CreateCartDialog';
import {
	useFilteredCarts,
	useCarts,
	useCreateCart,
	useProducts,
} from '@/hooks/index';

export default function CartsPage() {
	const router = useRouter();
	const theme = useTheme();
	const { user, isAuthenticated, authChecked } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
		null,
		null,
	]);
	const [isFilterApplied, setIsFilterApplied] = useState(false);
	const [openCreateDialog, setOpenCreateDialog] = useState(false);
	const [selectedProducts, setSelectedProducts] = useState<
		{ productId: number; quantity: number }[]
	>([]);
	const [showSuccess, setShowSuccess] = useState(false);
	const [error, setError] = useState<string>('');

	// State for product details dialog
	const [productDetailsOpen, setProductDetailsOpen] = useState(false);
	const [selectedCartProducts, setSelectedCartProducts] = useState<{
		products: CartItem[];
		cartId: number;
		date: string;
	} | null>(null);

	// Use regular carts query for unfiltered data
	const { data: allCarts = [], isLoading: isLoadingAllCarts } = useCarts();

	// Use filtered carts query when filters are applied
	const {
		data: filteredCarts = [],
		isLoading: isLoadingFilteredCarts,
		error: cartsError,
		refetch: refetchFilteredCarts,
	} = useFilteredCarts(dateRange, isFilterApplied);

	// Determine which dataset to use
	const carts = isFilterApplied ? filteredCarts : allCarts;
	const isLoadingCarts = isFilterApplied
		? isLoadingFilteredCarts
		: isLoadingAllCarts;

	const {
		data: products = [],
		isLoading: isLoadingProducts,
		error: productsError,
	} = useProducts();
	const createCartMutation = useCreateCart();

	// Handle opening product details dialog
	const handleOpenProductDetails = (
		cartId: number,
		cartProducts: CartItem[],
		cartDate: string
	) => {
		setSelectedCartProducts({
			products: cartProducts,
			cartId,
			date: cartDate,
		});
		setProductDetailsOpen(true);
	};

	// Apply filters when both dates are set
	useEffect(() => {
		const hasStartDate = !!dateRange[0];
		const hasEndDate = !!dateRange[1];

		// Only apply filter when both dates are set
		if (hasStartDate && hasEndDate) {
			setIsFilterApplied(true);
			refetchFilteredCarts();
		}
	}, [dateRange, refetchFilteredCarts]);

	// Handle clearing filters
	const handleClearFilters = () => {
		setDateRange([null, null]);
		setIsFilterApplied(false);
	};

	useEffect(() => {
		// Only check authentication after it has been verified
		if (!authChecked) {
			return;
		}

		// Check authentication status
		if (!isAuthenticated) {
			router.push('/login');
			return;
		}
		setIsLoading(false);
	}, [isAuthenticated, router, authChecked]);

	// Handle errors from queries
	useEffect(() => {
		if (cartsError) {
			setError('Failed to fetch carts');
			console.error('Error fetching carts:', cartsError);
		}
		if (productsError) {
			setError('Failed to fetch products');
			console.error('Error fetching products:', productsError);
		}
	}, [cartsError, productsError]);

	const handleCreateCart = async () => {
		if (!user) return;

		const newCart = {
			userId: user.id,
			products: selectedProducts,
		};

		try {
			await createCartMutation.mutateAsync(newCart);
			setOpenCreateDialog(false);
			setSelectedProducts([]);
			setShowSuccess(true);
		} catch (err) {
			setError('Failed to create cart');
			console.error('Error creating cart:', err);
		}
	};

	const addProductToCart = (productId: number) => {
		if (selectedProducts.some((p) => p.productId === productId)) {
			setError('Product already in cart');
			return;
		}
		setSelectedProducts([...selectedProducts, { productId, quantity: 1 }]);
	};

	const updateQuantity = (productId: number, quantity: number) => {
		if (quantity < 1) return;
		setSelectedProducts(
			selectedProducts.map((p) =>
				p.productId === productId ? { ...p, quantity } : p
			)
		);
	};

	// Show loading state while checking authentication
	if (isLoading) {
		return (
			<Container maxWidth="lg" sx={{ my: 4, textAlign: 'center' }}>
				<CircularProgress />
			</Container>
		);
	}

	// Prepare data for DataGrid
	const rows = carts.map((cart: Cart) => {
		// Calculate total price
		const totalPrice = cart.products
			.reduce((total: number, p: CartItem) => {
				const product = products.find(
					(prod: Product) => prod.id === p.productId
				);
				return total + (product?.price || 0) * p.quantity;
			}, 0)
			.toFixed(2);

		// Format products for display
		const cartProducts = cart.products.map((p: CartItem) => {
			const product = products.find((prod: Product) => prod.id === p.productId);
			return `${product?.title || 'Unknown Product'} x ${p.quantity}`;
		});

		// Format date
		const cartDate = new Date(cart.date);
		const dateForSorting = cartDate.getTime(); // Use timestamp for sorting

		return {
			id: cart.id,
			cartId: cart.id, // For display
			date: dateForSorting, // Numeric timestamp for sorting
			dateDisplay: cartDate.toLocaleDateString(), // Formatted for display
			products: cartProducts,
			rawProducts: cart.products, // Keep the raw product data for the dialog
			totalPrice: parseFloat(totalPrice), // Numeric for sorting
			totalPriceDisplay: `$${totalPrice}`, // Formatted for display
			itemCount: cart.products.length,
		};
	});

	// Define columns for DataGrid
	const columns: GridColDef[] = [
		{
			field: 'cartId',
			headerName: 'Cart ID',
			width: 100,
			sortable: true,
		},
		{
			field: 'dateDisplay',
			headerName: 'Date',
			width: 150,
			sortable: true,
			sortComparator: (v1, v2, param1, param2) => {
				// Sort by the timestamp in the 'date' field
				const a = param1.api.getCellValue(param1.id, 'date') as number;
				const b = param2.api.getCellValue(param2.id, 'date') as number;
				return a - b;
			},
		},
		{
			field: 'products',
			headerName: 'Products',
			width: 600,
			sortable: false,
			renderCell: (params: GridRenderCellParams) => {
				const cartId = params.row.cartId;
				const rawProducts = params.row.rawProducts;
				const dateDisplay = params.row.dateDisplay;

				return (
					<Box
						sx={{
							py: 1,
							display: 'flex',
							alignItems: 'center',
							width: '100%',
							'& > div': {
								mb: 0.5,
								color: theme.palette.text.primary,
								flexGrow: 1,
							},
							'& > div:not(:last-child)': {
								pb: 0.5,
								borderBottom: `1px dashed ${theme.palette.divider}`,
							},
						}}>
						<Box sx={{ flexGrow: 1 }}>
							{params.value
								.slice(0, 2)
								.map((product: string, index: number) => (
									<div key={`cart-product-${index}`}>{product}</div>
								))}
							{params.value.length > 2 && (
								<Typography color="text.secondary" variant="body2">
									+{params.value.length - 2} more items
								</Typography>
							)}
						</Box>
						<IconButton
							color="primary"
							size="small"
							onClick={() =>
								handleOpenProductDetails(cartId, rawProducts, dateDisplay)
							}
							sx={{ flexShrink: 0, ml: 1 }}
							title="View product details">
							<InfoIcon />
						</IconButton>
					</Box>
				);
			},
		},
		{
			field: 'totalPriceDisplay',
			headerName: 'Total',
			width: 120,
			sortable: true,
			align: 'right',
			headerAlign: 'right',
			sortComparator: (v1, v2, param1, param2) => {
				// Sort by the numeric value in 'totalPrice'
				const a = param1.api.getCellValue(param1.id, 'totalPrice') as number;
				const b = param2.api.getCellValue(param2.id, 'totalPrice') as number;
				return a - b;
			},
		},
		{
			field: 'itemCount',
			headerName: 'Items',
			width: 100,
			sortable: true,
			align: 'center',
			headerAlign: 'center',
		},
	];

	// If products are still loading but authentication is done, render the UI with loading state for the table
	if (isLoadingProducts) {
		return (
			<Container maxWidth="lg" sx={{ my: 4 }}>
				<Typography variant="h4" gutterBottom>
					Carts Management
				</Typography>
				<Box sx={{ mb: 4 }}>
					<Paper sx={{ p: 3, mb: 3 }}>
						<Typography variant="h6" gutterBottom>
							Filter Carts by Date
						</Typography>
						<CircularProgress />
					</Paper>
				</Box>
			</Container>
		);
	}

	return (
		<Container maxWidth="lg" sx={{ my: 4 }}>
			<Typography variant="h4" gutterBottom>
				Carts Management
			</Typography>

			<Box sx={{ mb: 4 }}>
				<Paper sx={{ p: 3, mb: 3 }}>
					<Typography variant="h6" gutterBottom>
						Filter Carts by Date
					</Typography>
					<Box sx={{ mb: 2 }}>
						<DateRangePicker
							startDate={dateRange[0]}
							endDate={dateRange[1]}
							onStartDateChange={(date) => setDateRange([date, dateRange[1]])}
							onEndDateChange={(date) => setDateRange([dateRange[0], date])}
						/>
					</Box>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}>
						<Typography variant="body2" color="text.secondary">
							{carts.length} {carts.length === 1 ? 'cart' : 'carts'} found
							{isFilterApplied && ' (filtered)'}
						</Typography>
						<Button
							size="small"
							variant="outlined"
							onClick={handleClearFilters}
							disabled={!dateRange[0] && !dateRange[1]}>
							Clear Filters
						</Button>
					</Box>
				</Paper>

				<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
					<Button
						variant="contained"
						color="primary"
						onClick={() => setOpenCreateDialog(true)}>
						Create New Cart
					</Button>
				</Box>
			</Box>

			<Paper
				sx={{
					width: '100%',
					overflow: 'hidden',
					borderRadius: 2,
					boxShadow: theme.shadows[3],
				}}>
				<Typography
					variant="h6"
					sx={{
						p: 2,
						borderBottom: `1px solid ${theme.palette.divider}`,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}>
					<span>Cart Transactions</span>
					{isLoadingCarts && <CircularProgress size={24} sx={{ ml: 2 }} />}
				</Typography>
				<Box sx={{ height: 500, width: '100%' }}>
					<DataGrid
						rows={rows}
						columns={columns}
						initialState={{
							pagination: {
								paginationModel: { pageSize: 5 },
							},
							sorting: {
								sortModel: [{ field: 'date', sort: 'desc' }],
							},
						}}
						pageSizeOptions={[5, 10, 25, 50]}
						disableRowSelectionOnClick
						loading={isLoadingCarts}
						sx={{
							border: 'none',
							// Zebra stripe rows
							[`& .${gridClasses.row}.even`]: {
								backgroundColor:
									theme.palette.mode === 'dark'
										? theme.palette.grey[900]
										: theme.palette.grey[50],
							},
							// Highlight header
							[`& .${gridClasses.columnHeaders}`]: {
								backgroundColor:
									theme.palette.mode === 'dark'
										? theme.palette.grey[800]
										: theme.palette.primary.light,
								color:
									theme.palette.mode === 'dark'
										? theme.palette.common.white
										: theme.palette.primary.contrastText,
								fontWeight: 'bold',
							},
							// Custom pagination styling
							[`& .${gridClasses.footerContainer}`]: {
								borderTop: `1px solid ${theme.palette.divider}`,
							},
							// Cell and row hover styling
							[`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]:
								{
									outline: 'none',
								},
							[`& .${gridClasses.row}:hover`]: {
								backgroundColor:
									theme.palette.mode === 'dark'
										? theme.palette.grey[800]
										: theme.palette.grey[100],
							},
						}}
						getRowClassName={(params) =>
							params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
						}
					/>
				</Box>
			</Paper>

			{/* Create Cart Dialog */}
			<CreateCartDialog
				open={openCreateDialog}
				onClose={() => setOpenCreateDialog(false)}
				products={products}
				selectedProducts={selectedProducts}
				onAddProduct={addProductToCart}
				onUpdateQuantity={updateQuantity}
				onRemoveProduct={(productId: number) =>
					setSelectedProducts(
						selectedProducts.filter((p) => p.productId !== productId)
					)
				}
				onCreateCart={handleCreateCart}
			/>

			{/* Product Details Dialog */}
			<Dialog
				open={productDetailsOpen}
				onClose={() => setProductDetailsOpen(false)}
				maxWidth="md"
				fullWidth>
				<DialogTitle
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}>
					<Box>
						<Typography variant="h6">Cart Products</Typography>
						<Typography variant="body2" color="text.secondary">
							{selectedCartProducts?.date &&
								`Date: ${selectedCartProducts.date}`}{' '}
							| Cart ID: {selectedCartProducts?.cartId}
						</Typography>
					</Box>
					<IconButton
						edge="end"
						color="inherit"
						onClick={() => setProductDetailsOpen(false)}
						aria-label="close">
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					<List sx={{ width: '100%' }}>
						{selectedCartProducts?.products.map(
							(item: CartItem, index: number) => {
								const product = products.find(
									(prod: Product) => prod.id === item.productId
								);

								const productPrice = product?.price || 0;
								const subtotal = productPrice * item.quantity;

								return (
									<Box key={`product-${item.productId}-${index}`}>
										<ListItem
											alignItems="flex-start"
											sx={{
												flexDirection: { xs: 'column', sm: 'row' },
												py: 2,
												alignItems: { xs: 'flex-start', sm: 'center' },
											}}>
											{/* Product Image */}
											{product?.image && (
												<Box
													sx={{
														mr: { xs: 0, sm: 3 },
														mb: { xs: 2, sm: 0 },
														width: { xs: '100%', sm: 100 },
														height: { xs: 200, sm: 100 },
														position: 'relative',
														borderRadius: 1,
														overflow: 'hidden',
														border: `1px solid ${theme.palette.divider}`,
														flexShrink: 0,
													}}>
													<Box
														component="img"
														src={product.image}
														alt={product.title || 'Product image'}
														sx={{
															position: 'absolute',
															width: '100%',
															height: '100%',
															objectFit: 'contain',
															p: 1,
														}}
													/>
												</Box>
											)}

											{/* Product Info */}
											<Box sx={{ flexGrow: 1 }}>
												<ListItemText
													primary={
														<Typography variant="subtitle1">
															{product?.title || 'Unknown Product'}
														</Typography>
													}
													secondary={
														<Box sx={{ mt: 1 }}>
															<Typography
																variant="body2"
																color="text.secondary">
																<strong>Category:</strong>{' '}
																{product?.category || 'N/A'}
															</Typography>
															<Typography
																variant="body2"
																color="text.secondary">
																<strong>ID:</strong> {product?.id}
															</Typography>
															<Typography
																variant="body2"
																color="text.secondary">
																<strong>Rating:</strong>{' '}
																{product?.rating?.rate || 'N/A'}(
																{product?.rating?.count || 0} reviews)
															</Typography>
														</Box>
													}
												/>
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{ mt: 1 }}>
													<strong>Description:</strong>{' '}
													{product?.description || 'No description available'}
												</Typography>
											</Box>

											{/* Price Info */}
											<Box
												sx={{
													display: 'flex',
													flexDirection: 'column',
													ml: { xs: 0, sm: 2 },
													mt: { xs: 2, sm: 0 },
													minWidth: { xs: '100%', sm: '180px' },
													alignItems: { xs: 'flex-start', sm: 'flex-end' },
													pt: { xs: 2, sm: 0 },
													borderTop: {
														xs: `1px solid ${theme.palette.divider}`,
														sm: 'none',
													},
												}}>
												<Typography variant="body2">
													<strong>Unit Price:</strong> $
													{productPrice.toFixed(2)}
												</Typography>
												<Typography variant="body2">
													<strong>Quantity:</strong> {item.quantity}
												</Typography>
												<Typography
													variant="subtitle2"
													sx={{ fontWeight: 'bold', mt: 1 }}>
													Subtotal: ${subtotal.toFixed(2)}
												</Typography>
											</Box>
										</ListItem>
										{index < selectedCartProducts.products.length - 1 && (
											<Divider sx={{ my: 1 }} />
										)}
									</Box>
								);
							}
						)}
					</List>
				</DialogContent>
				<DialogActions>
					<Typography variant="body1" sx={{ flexGrow: 1, pl: 2 }}>
						<strong>Total:</strong> $
						{selectedCartProducts?.products
							.reduce((total, p) => {
								const product = products.find(
									(prod) => prod.id === p.productId
								);
								return total + (product?.price || 0) * p.quantity;
							}, 0)
							.toFixed(2)}
					</Typography>
					<Button onClick={() => setProductDetailsOpen(false)}>Close</Button>
				</DialogActions>
			</Dialog>

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
					Cart created successfully!
				</Alert>
			</Snackbar>
		</Container>
	);
}
