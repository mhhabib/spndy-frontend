import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
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
import { API_BASE_URL } from '@/config/Config';
import { Loader2 } from 'lucide-react';

const AddExpense = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { toast } = useToast();
	const { token, isAuthenticated } = useAuth();
	const [categories, setCategories] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Check if we're in edit mode based on the location state
	const isEditing = location.state?.isEditing || false;
	const expenseToEdit = location.state?.expense || null;
	const categoryName = location.state?.categoryName || '';

	// Initialize form with either existing expense data or defaults
	const [formData, setFormData] = useState({
		description: isEditing ? expenseToEdit.description : '',
		category: isEditing ? categoryName : '',
		amount: isEditing ? expenseToEdit.amount.toString() : '',
		date: isEditing
			? new Date(expenseToEdit.date).toISOString().split('T')[0]
			: new Date().toISOString().split('T')[0],
	});

	const fetchCategories = useCallback(async () => {
		try {
			const { data } = await axios.get(`${API_BASE_URL}/categories`);
			const sortedCategories = data
				.map((category) => ({ id: category.id, name: category.name }))
				.sort((a, b) => a.name.localeCompare(b.name));
			setCategories(sortedCategories);
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to fetch categories',
				variant: 'destructive',
			});
		}
	}, [toast]);

	useEffect(() => {
		if (isAuthenticated) {
			fetchCategories();
		}
	}, [isAuthenticated, fetchCategories]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleCategoryChange = (value) => {
		setFormData((prev) => ({ ...prev, category: value }));
	};

	const handleSubmit = async (e) => {
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
			if (isEditing) {
				console.log('EDIT DATA ', expenseData.categoryId);
				console.log('Selected category ', selectedCategory, formData.category);

				const response = await axios.put(
					`${API_BASE_URL}/expenses/${expenseToEdit.id}`,
					expenseData,
					{
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
					}
				);
				toast({
					title: 'Success',
					description: 'Expense updated successfully',
				});
				navigate('/my-expenses');
			} else {
				await axios.post(`${API_BASE_URL}/expenses`, expenseData, {
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				});
				toast({ title: 'Success', description: 'Expense added successfully' });
				navigate('/');
			}
		} catch (error) {
			console.error(
				`Error ${isEditing ? 'updating' : 'adding'} expense:`,
				error
			);
			toast({
				title: 'Error',
				description: `Failed to ${
					isEditing ? 'update' : 'add'
				} expense. Please try again.`,
				variant: 'destructive',
			});
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
