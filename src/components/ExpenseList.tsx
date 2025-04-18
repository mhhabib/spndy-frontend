import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/utils';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/Config';

export interface Expense {
	id: number;
	description: string;
	amount: number;
	date: string;
	createdAt: string;
	updatedAt: string;
	userId: number;
	CategoryId: number;
	Category: {
		id: number;
		name: string;
		createdAt: string;
		updatedAt: string;
	};
}

interface ExpenseListProps {
	expenses: Expense[];
	isEditModeOn: boolean;
	onDeleteExpense: (id: number) => void;
}

type SortDirection = 'asc' | 'desc' | null;

const ExpenseList = ({
	expenses: initialExpenses,
	isEditModeOn,
	onDeleteExpense,
}: ExpenseListProps) => {
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
	const [sortDirection, setSortDirection] = useState<SortDirection>(null);
	const { toast } = useToast();
	const navigate = useNavigate();
	const { token } = useAuth();

	// Update expenses when props change
	useEffect(() => {
		setExpenses(initialExpenses);
	}, [initialExpenses]);

	const formatDate = (isoString: string) => {
		const date = new Date(isoString);
		return new Intl.DateTimeFormat('en-US', {
			month: 'long',
			day: '2-digit',
			year: 'numeric',
		}).format(date);
	};

	const handleEdit = (expense: Expense) => {
		navigate('/add-expense', {
			state: {
				isEditing: true,
				expense: expense,
				categoryName: expense.Category.name,
			},
		});
	};

	const handleDelete = async () => {
		if (deleteId) {
			try {
				await axios.delete(`${API_BASE_URL}/expenses/${deleteId}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				// Call the parent component's delete handler to update the UI
				onDeleteExpense(deleteId);

				toast({
					title: 'Expense deleted',
					description: 'The expense has been successfully deleted.',
				});
			} catch (error) {
				console.error('Error deleting expense:', error);
				toast({
					title: 'Error',
					description: 'Failed to delete expense. Please try again.',
					variant: 'destructive',
				});
			} finally {
				setIsDeleteDialogOpen(false);
			}
		}
	};

	const toggleSortByCategory = () => {
		let newDirection: SortDirection;

		// Toggle sort direction: null -> asc -> desc -> null
		if (sortDirection === null) {
			newDirection = 'asc';
		} else if (sortDirection === 'asc') {
			newDirection = 'desc';
		} else {
			newDirection = null;
		}

		setSortDirection(newDirection);

		// Create a new sorted array based on direction
		const sortedExpenses = [...expenses];

		if (newDirection === null) {
			setExpenses(initialExpenses);
		} else {
			const sortedExpenses = [...expenses].sort((a, b) => {
				const nameA = a.Category?.name?.toLowerCase() || '';
				const nameB = b.Category?.name?.toLowerCase() || '';

				if (newDirection === 'asc') {
					return nameA.localeCompare(nameB);
				} else {
					return nameB.localeCompare(nameA);
				}
			});

			setExpenses(sortedExpenses);
		}
	};

	const getSortIcon = () => {
		if (sortDirection === null) return <ArrowUpDown className="h-4 w-4 ml-1" />;
		if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4 ml-1" />;
		return <ArrowDown className="h-4 w-4 ml-1" />;
	};

	return (
		<Card className="card-glass w-full animate-slide-in-bottom [animation-delay:400ms]">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg font-medium">Recent Expenses</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="relative overflow-x-auto rounded-lg">
					<table className="w-full text-sm text-left">
						<thead className="text-xs uppercase bg-muted/30 backdrop-blur-sm">
							<tr>
								<th scope="col" className="px-4 py-3 whitespace-nowrap">
									#
								</th>
								<th scope="col" className="px-4 py-3">
									Description
								</th>
								<th
									scope="col"
									className="px-4 py-3 cursor-pointer select-none"
									onClick={toggleSortByCategory}
								>
									<div className="flex items-center">
										Category
										{getSortIcon()}
									</div>
								</th>
								<th scope="col" className="px-4 py-3 text-right">
									Amount
								</th>
								{isEditModeOn && (
									<th scope="col" className="px-4 py-3 text-right">
										Actions
									</th>
								)}
							</tr>
						</thead>
						<tbody>
							{expenses.map((expense, index) => (
								<tr
									key={expense.id}
									className="expense-item border-b border-border/40 bg-white/30 backdrop-blur-sm last:border-0"
								>
									<td className="px-4 py-3 whitespace-nowrap">{index + 1}</td>
									<td className="px-4 py-3">
										<div>
											<p className="font-medium">{expense.description}</p>
											<p className="text-xs text-muted-foreground">
												{formatDate(expense.date)}
											</p>
										</div>
									</td>
									<td className="px-4 py-3">
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
											{expense.Category.name}
										</span>
									</td>
									<td className="px-4 py-3 text-right font-medium">
										{formatCurrency(expense.amount)}
									</td>
									{isEditModeOn && (
										<td className="px-4 py-3 text-right whitespace-nowrap">
											<div className="flex justify-end gap-2">
												<Button
													size="icon"
													variant="ghost"
													className="h-8 w-8"
													onClick={() => handleEdit(expense)}
												>
													<Edit className="h-4 w-4" />
													<span className="sr-only">Edit</span>
												</Button>
												<Dialog
													open={isDeleteDialogOpen && deleteId === expense.id}
													onOpenChange={setIsDeleteDialogOpen}
												>
													<DialogTrigger asChild>
														<Button
															size="icon"
															variant="ghost"
															className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive/20"
															onClick={() => setDeleteId(expense.id)}
														>
															<Trash className="h-4 w-4" />
															<span className="sr-only">Delete</span>
														</Button>
													</DialogTrigger>
													<DialogContent className="sm:max-w-[425px]">
														<DialogHeader>
															<DialogTitle>Confirm Deletion</DialogTitle>
															<DialogDescription>
																Are you sure you want to delete this expense?
																This action cannot be undone.
															</DialogDescription>
														</DialogHeader>
														<DialogFooter>
															<Button
																variant="outline"
																onClick={() => setIsDeleteDialogOpen(false)}
															>
																Cancel
															</Button>
															<Button
																variant="destructive"
																onClick={handleDelete}
															>
																Delete
															</Button>
														</DialogFooter>
													</DialogContent>
												</Dialog>
											</div>
										</td>
									)}
								</tr>
							))}
							{expenses.length === 0 && (
								<tr className="border-b border-border/40 bg-white/30 backdrop-blur-sm">
									<td
										colSpan={isEditModeOn ? 5 : 4}
										className="px-4 py-10 text-center text-muted-foreground"
									>
										No expenses found for this period.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	);
};

export default ExpenseList;
