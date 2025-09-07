// src/pages/AddExpense.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';
import { useApiClient } from '@/utils/apiClient';

type Category = { id: number; name: string };

const AddExpense = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { toast } = useToast();
	const { isAuthenticated } = useAuth();
	const apiClient = useApiClient();

	const [categories, setCategories] = useState<Category[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Edit mode detection
	const isEditing = Boolean(location.state?.isEditing);
	const expenseToEdit = location.state?.expense ?? null;
	const categoryName = location.state?.categoryName ?? '';

	// Initialize form state (safely handle missing expenseToEdit)
	const [formData, setFormData] = useState({
		description: isEditing && expenseToEdit ? expenseToEdit.description : '',
		category: isEditing && categoryName ? categoryName : '',
		amount: isEditing && expenseToEdit ? String(expenseToEdit.amount) : '',
		date:
			isEditing && expenseToEdit
				? new Date(expenseToEdit.date).toISOString().split('T')[0]
				: new Date().toISOString().split('T')[0],
	});

	useEffect(() => {
		if (!isAuthenticated) return;

		const fetchCategories = async () => {
			try {
				const data = await apiClient.get<Category[]>('/categories');
				const sorted = (data || [])
					.map((c) => ({ id: c.id, name: c.name }))
					.sort((a, b) => a.name.localeCompare(b.name));
				setCategories(sorted);
			} catch (err) {
				console.error('Failed to fetch categories', err);
				// Safe to call toast here
				toast({
					title: 'Error',
					description: 'Failed to fetch categories',
					variant: 'destructive',
				});
			}
		};

		fetchCategories();
	}, [isAuthenticated]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleCategoryChange = (value: string) => {
		setFormData((prev) => ({ ...prev, category: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.description || !formData.category || !formData.amount) {
			toast({
				title: 'Error',
				description: 'Please fill all required fields',
				variant: 'destructive',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const selectedCategory = categories.find(
				(cat) => cat.name === formData.category
			);
			if (!selectedCategory) throw new Error('Selected category not found');

			const expenseData = {
				description: formData.description,
				amount: parseFloat(formData.amount),
				categoryId: selectedCategory.id,
				date: formData.date || new Date().toISOString(),
			};

			if (isEditing && expenseToEdit && expenseToEdit.id) {
				await apiClient.put(`/expenses/${expenseToEdit.id}`, expenseData);
				toast({
					title: 'Success',
					description: 'Expense updated successfully',
				});
				navigate('/my-expenses');
			} else {
				await apiClient.post('/expenses', expenseData);
				toast({
					title: 'Success',
					description: 'Expense added successfully',
				});
				navigate('/');
			}
		} catch (error) {
			console.error(
				`Error ${isEditing ? 'updating' : 'adding'} expense:`,
				error
			);
			// If the error has a status & data (from useApiClient), show a helpful message
			const status = (error as any)?.status;
			const data = (error as any)?.data;
			const serverMsg = data?.message || data?.error || null;

			toast({
				title: 'Error',
				description: serverMsg
					? `Failed to ${isEditing ? 'update' : 'add'} expense: ${serverMsg}`
					: `Failed to ${
							isEditing ? 'update' : 'add'
					  } expense. Please try again.`,
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 py-6">
				<Card className="card-glass w-full animate-fade-in">
					<CardHeader>
						<CardTitle>{isEditing ? 'Edit Expense' : 'Add Expense'}</CardTitle>
						<CardDescription>
							{isEditing
								? 'Update the details of your expense'
								: 'Enter the details of your new expense'}
						</CardDescription>
					</CardHeader>

					<form onSubmit={handleSubmit}>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									name="description"
									value={formData.description}
									onChange={handleChange}
									placeholder="What did you spend on?"
									disabled={isSubmitting}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="category">Category</Label>
								<Select
									value={formData.category}
									onValueChange={handleCategoryChange}
									disabled={isSubmitting}
								>
									<SelectTrigger id="category">
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent
										style={{ maxHeight: '160px', overflowY: 'auto' }}
									>
										{categories.map(({ id, name }) => (
											<SelectItem key={id} value={name}>
												{name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="amount">Amount</Label>
								<Input
									id="amount"
									name="amount"
									type="number"
									value={formData.amount}
									onChange={handleChange}
									placeholder="0.00"
									min="0"
									step="0.01"
									disabled={isSubmitting}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="date">Date</Label>
								<Input
									id="date"
									name="date"
									type="date"
									value={formData.date}
									onChange={handleChange}
									className="bg-white/70 backdrop-blur-sm"
									disabled={isSubmitting}
								/>
							</div>
						</CardContent>

						<CardFooter className="flex justify-between">
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate('/')}
								disabled={isSubmitting}
							>
								Cancel
							</Button>

							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{isEditing ? 'Updating...' : 'Adding...'}
									</>
								) : (
									<>{isEditing ? 'Update Expense' : 'Add Expense'}</>
								)}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</main>

			<Footer />
		</div>
	);
};

export default AddExpense;
