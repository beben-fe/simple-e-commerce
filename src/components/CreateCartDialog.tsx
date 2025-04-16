'use client';

import React, { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Chip,
	useTheme,
	Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Product } from '@/types/cart';

interface CreateCartDialogProps {
	open: boolean;
	onClose: () => void;
	products: Product[];
	selectedProducts: { productId: number; quantity: number }[];
	onAddProduct: (productId: number) => void;
	onUpdateQuantity: (productId: number, quantity: number) => void;
	onRemoveProduct: (productId: number) => void;
	onCreateCart: () => void;
}

export function CreateCartDialog({
	open,
	onClose,
	products,
	selectedProducts,
	onAddProduct,
	onUpdateQuantity,
	onRemoveProduct,
	onCreateCart,
}: CreateCartDialogProps) {
	const theme = useTheme();
	const [productDetailOpen, setProductDetailOpen] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

	const handleOpenProductDetail = (product: Product) => {
		setSelectedProduct(product);
		setProductDetailOpen(true);
	};

	const handleCloseProductDetail = () => {
		setProductDetailOpen(false);
	};

	return (
		<>
			<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
				<DialogTitle>
					Create New Cart
					<IconButton
						aria-label="close"
						onClick={onClose}
						sx={{ position: 'absolute', right: 8, top: 8 }}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<Box sx={{ mt: 2 }}>
						<Typography variant="h6" sx={{ mb: 2 }}>
							Available Products
						</Typography>
						<TableContainer>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>Product</TableCell>
										<TableCell>Price</TableCell>
										<TableCell>Category</TableCell>
										<TableCell align="center">Actions</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{products.map((product) => (
										<TableRow key={`available-product-${product.id}`} hover>
											<TableCell sx={{ cursor: 'pointer' }}>
												<Box
													sx={{
														display: 'flex',
														alignItems: 'center',
														'&:hover': {
															color: theme.palette.primary.main,
														},
													}}
													onClick={() => handleOpenProductDetail(product)}>
													{product.image && (
														<Box
															component="img"
															src={product.image}
															alt={product.title}
															sx={{
																width: 40,
																height: 40,
																mr: 2,
																objectFit: 'contain',
																borderRadius: 1,
																border: `1px solid ${theme.palette.divider}`,
															}}
														/>
													)}
													<Typography noWrap sx={{ maxWidth: '300px' }}>
														{product.title}
													</Typography>
													<Tooltip title="View product details">
														<IconButton
															size="small"
															sx={{ ml: 1 }}
															onClick={(e) => {
																e.stopPropagation();
																handleOpenProductDetail(product);
															}}>
															<InfoIcon fontSize="small" />
														</IconButton>
													</Tooltip>
												</Box>
											</TableCell>
											<TableCell>${product.price.toFixed(2)}</TableCell>
											<TableCell>
												<Chip
													label={product.category}
													size="small"
													variant="outlined"
													sx={{ textTransform: 'capitalize' }}
												/>
											</TableCell>
											<TableCell align="center">
												<Button
													variant="outlined"
													size="small"
													startIcon={<AddShoppingCartIcon />}
													onClick={() => onAddProduct(product.id)}
													disabled={selectedProducts.some(
														(p) => p.productId === product.id
													)}>
													Add to Cart
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>

						<Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
							Selected Products
						</Typography>
						<TableContainer>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>Product</TableCell>
										<TableCell>Price</TableCell>
										<TableCell>Quantity</TableCell>
										<TableCell>Subtotal</TableCell>
										<TableCell>Actions</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{selectedProducts.length === 0 ? (
										<TableRow>
											<TableCell colSpan={5} align="center">
												<Typography color="text.secondary" py={2}>
													No products selected yet. Add products from the list
													above.
												</Typography>
											</TableCell>
										</TableRow>
									) : (
										selectedProducts.map((item, index) => {
											const product = products.find(
												(p) => p.id === item.productId
											);
											return (
												<TableRow
													key={`selected-product-${item.productId}-${index}`}
													hover>
													<TableCell>
														<Box
															sx={{
																display: 'flex',
																alignItems: 'center',
																cursor: 'pointer',
																'&:hover': {
																	color: theme.palette.primary.main,
																},
															}}
															onClick={() =>
																product && handleOpenProductDetail(product)
															}>
															{product?.image && (
																<Box
																	component="img"
																	src={product.image}
																	alt={product.title}
																	sx={{
																		width: 40,
																		height: 40,
																		mr: 2,
																		objectFit: 'contain',
																		borderRadius: 1,
																		border: `1px solid ${theme.palette.divider}`,
																	}}
																/>
															)}
															<Typography>{product?.title}</Typography>
														</Box>
													</TableCell>
													<TableCell>${product?.price.toFixed(2)}</TableCell>
													<TableCell>
														<TextField
															type="number"
															value={item.quantity}
															onChange={(e) =>
																onUpdateQuantity(
																	item.productId,
																	parseInt(e.target.value) || 1
																)
															}
															inputProps={{ min: 1 }}
															size="small"
														/>
													</TableCell>
													<TableCell>
														$
														{((product?.price || 0) * item.quantity).toFixed(2)}
													</TableCell>
													<TableCell>
														<Button
															variant="outlined"
															color="error"
															size="small"
															onClick={() => onRemoveProduct(item.productId)}>
															Remove
														</Button>
													</TableCell>
												</TableRow>
											);
										})
									)}
								</TableBody>
								{selectedProducts.length > 0 && (
									<TableHead>
										<TableRow>
											<TableCell colSpan={3} align="right">
												<strong>Total:</strong>
											</TableCell>
											<TableCell colSpan={2}>
												$
												{selectedProducts
													.reduce((total, item) => {
														const product = products.find(
															(p) => p.id === item.productId
														);
														return (
															total + (product?.price || 0) * item.quantity
														);
													}, 0)
													.toFixed(2)}
											</TableCell>
										</TableRow>
									</TableHead>
								)}
							</Table>
						</TableContainer>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Cancel</Button>
					<Button
						onClick={onCreateCart}
						variant="contained"
						color="primary"
						disabled={selectedProducts.length === 0}>
						Create Cart
					</Button>
				</DialogActions>
			</Dialog>

			{/* Product Detail Dialog */}
			<Dialog
				open={productDetailOpen}
				onClose={handleCloseProductDetail}
				maxWidth="md"
				fullWidth>
				{selectedProduct && (
					<>
						<DialogTitle
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								borderBottom: `1px solid ${theme.palette.divider}`,
							}}>
							<Typography variant="h6" noWrap sx={{ maxWidth: '90%' }}>
								{selectedProduct.title}
							</Typography>
							<IconButton
								edge="end"
								color="inherit"
								onClick={handleCloseProductDetail}
								aria-label="close">
								<CloseIcon />
							</IconButton>
						</DialogTitle>
						<DialogContent>
							<Box
								sx={{
									display: 'flex',
									flexDirection: { xs: 'column', md: 'row' },
									mt: 2,
									gap: 3,
								}}>
								{/* Product Image */}
								<Box
									sx={{
										width: { xs: '100%', md: '40%' },
										height: { xs: '300px', md: 'auto' },
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										p: 2,
										borderRadius: 1,
										border: `1px solid ${theme.palette.divider}`,
										backgroundColor: theme.palette.background.paper,
									}}>
									<Box
										component="img"
										src={selectedProduct.image}
										alt={selectedProduct.title}
										sx={{
											maxWidth: '100%',
											maxHeight: '300px',
											objectFit: 'contain',
										}}
									/>
								</Box>

								{/* Product Details */}
								<Box sx={{ width: { xs: '100%', md: '60%' } }}>
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'flex-start',
											mb: 2,
										}}>
										<Box>
											<Chip
												label={selectedProduct.category}
												size="small"
												color="primary"
												variant="outlined"
												sx={{ textTransform: 'capitalize', mb: 1 }}
											/>
											<Typography variant="h5" gutterBottom>
												${selectedProduct.price.toFixed(2)}
											</Typography>
										</Box>
										{selectedProduct.rating && (
											<Box
												sx={{
													bgcolor: 'rgba(0, 0, 0, 0.05)',
													p: 1,
													borderRadius: 1,
													textAlign: 'center',
												}}>
												<Typography variant="body2" color="text.secondary">
													Rating
												</Typography>
												<Typography variant="h6" color="primary">
													{selectedProduct.rating.rate}/5
												</Typography>
												<Typography variant="caption" color="text.secondary">
													({selectedProduct.rating.count} reviews)
												</Typography>
											</Box>
										)}
									</Box>

									<Typography
										variant="subtitle1"
										fontWeight="bold"
										gutterBottom>
										Description
									</Typography>
									<Typography variant="body2" paragraph>
										{selectedProduct.description}
									</Typography>

									<Box sx={{ mt: 3 }}>
										<Typography
											variant="subtitle1"
											fontWeight="bold"
											gutterBottom>
											Product Details
										</Typography>
										<Box
											sx={{
												display: 'grid',
												gridTemplateColumns: '1fr 1fr',
												gap: 2,
											}}>
											<Box>
												<Typography variant="body2" color="text.secondary">
													Product ID
												</Typography>
												<Typography variant="body1">
													{selectedProduct.id}
												</Typography>
											</Box>
											<Box>
												<Typography variant="body2" color="text.secondary">
													Category
												</Typography>
												<Typography
													variant="body1"
													sx={{ textTransform: 'capitalize' }}>
													{selectedProduct.category}
												</Typography>
											</Box>
										</Box>
									</Box>
								</Box>
							</Box>
						</DialogContent>
						<DialogActions>
							<Button onClick={handleCloseProductDetail} color="inherit">
								Close
							</Button>
							<Button
								onClick={() => {
									onAddProduct(selectedProduct.id);
									handleCloseProductDetail();
								}}
								variant="contained"
								color="primary"
								startIcon={<AddShoppingCartIcon />}
								disabled={selectedProducts.some(
									(p) => p.productId === selectedProduct.id
								)}>
								Add to Cart
							</Button>
						</DialogActions>
					</>
				)}
			</Dialog>
		</>
	);
}
