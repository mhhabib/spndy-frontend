// src/pages/AddExpense.tsx
import { useEffect, useState } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useApiClient } from '@/utils/apiClient';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { format, isValid } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

type Category = { id: number; name: string };

const AddExpense = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { toast } = useToast();
	const { isAuthenticated } = useAuth();
	const apiClient = useApiClient();

	const [categories, setCategories] = useState<Category[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorAmount, setErrorAmount] = useState('');

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

	const validateAndCalculateAmount = (value) => {
		const trimmed = value.trim();

		// Empty input is valid (optional field)
		if (!trimmed) {
			return { isValid: true, value: '' };
		}

		// Check if it's a simple number first
		const simpleNumber = parseFloat(trimmed);
		if (!isNaN(simpleNumber) && /^-?\d*\.?\d+$/.test(trimmed)) {
			if (!isFinite(simpleNumber)) {
				return { isValid: false, error: 'Amount cannot be infinity' };
			}
			if (simpleNumber < 0) {
				return { isValid: false, error: 'Amount cannot be negative' };
			}
			return { isValid: true, value: simpleNumber.toFixed(2) };
		}

		// Check if it contains math operators
		if (/[+\-*/()]/.test(trimmed)) {
			// Sanitize: only allow numbers, operators, decimal points, and parentheses
			const sanitized = trimmed.replace(/[^0-9+\-*/.()]/g, '');

			// Additional validation checks
			if (sanitized !== trimmed.replace(/\s/g, '')) {
				return { isValid: false, error: 'Contains invalid characters' };
			}

			// Check for invalid patterns
			if (/^[+*/]|[+\-*/]{2,}|[+\-*/]$/.test(sanitized)) {
				return { isValid: false, error: 'Invalid mathematical expression' };
			}

			// Check for empty parentheses
			if (/\(\s*\)/.test(sanitized)) {
				return { isValid: false, error: 'Empty parentheses are not allowed' };
			}

			// Check balanced parentheses
			let balance = 0;
			for (let char of sanitized) {
				if (char === '(') balance++;
				if (char === ')') balance--;
				if (balance < 0) {
					return { isValid: false, error: 'Unbalanced parentheses' };
				}
			}
			if (balance !== 0) {
				return { isValid: false, error: 'Unbalanced parentheses' };
			}

			try {
				// Safely evaluate the expression
				const result = Function(`'use strict'; return (${sanitized})`)();

				if (typeof result !== 'number') {
					return {
						isValid: false,
						error: 'Expression did not produce a number',
					};
				}

				if (isNaN(result)) {
					return { isValid: false, error: 'Invalid calculation result' };
				}

				if (!isFinite(result)) {
					return { isValid: false, error: 'Result cannot be infinity' };
				}

				if (result < 0) {
					return { isValid: false, error: 'Result cannot be negative' };
				}

				// Check for unreasonably large amounts
				if (result > 999999999.99) {
					return { isValid: false, error: 'Amount is too large' };
				}

				return { isValid: true, value: result.toFixed(2) };
			} catch (error) {
				return { isValid: false, error: 'Invalid mathematical expression' };
			}
		}

		// If we get here, it's neither a valid number nor a valid expression
		return {
			isValid: false,
			error: 'Please enter a valid number or expression',
		};
	};

	const handleAmountBlur = () => {
		const validation = validateAndCalculateAmount(formData.amount);

		if (!validation.isValid) {
			setErrorAmount(validation.error);
			return;
		}

		if (validation.value) {
			setFormData((prev) => ({ ...prev, amount: validation.value }));
		}
	};

	const handleAmountFocus = () => setErrorAmount('');

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

		const amountValidation = validateAndCalculateAmount(formData.amount);

		if (!amountValidation.isValid) {
			setErrorAmount(amountValidation.error);
			return;
		}

		setIsSubmitting(true);

		try {
			const selectedCategory = categories.find(
				(cat) => cat.name === formData.category,
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
				console.log('New expense data ', expenseData);
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
				error,
			);
			// If the error has a status & data (from useApiClient), show a helpful message
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
		<div className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 py-6">
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
								type="text"
								value={formData.amount}
								onChange={handleChange}
								onBlur={handleAmountBlur}
								onFocus={handleAmountFocus}
								placeholder="0.00 or 100+50"
								disabled={isSubmitting}
								className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
									errorAmount
										? 'border-red-500 focus:ring-red-500'
										: 'border-gray-300'
								} ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
							/>
							{errorAmount && (
								<p className="text-sm text-red-600 mt-1">{errorAmount}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label>Date</Label>

							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										disabled={isSubmitting}
										className="w-full justify-start text-left font-normal"
									>
										<CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
										{formData.date
											? format(new Date(formData.date), 'PPP')
											: 'Pick a date'}
									</Button>
								</PopoverTrigger>

								<PopoverContent
									className="w-auto p-0 bg-background border border-border shadow-lg z-50"
									align="start"
								>
									<Calendar
										mode="single"
										selected={new Date(formData.date)}
										onSelect={(date) => {
											if (!date || !isValid(date)) return;

											setFormData((prev) => ({
												...prev,
												date: format(date, 'yyyy-MM-dd'),
											}));
										}}
										modifiers={{ today: false }}
										modifiersClassNames={{ today: '' }}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
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

						<Button
							type="submit"
							disabled={isSubmitting || errorAmount.length > 0}
						>
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
		</div>
	);
};

export default AddExpense;
