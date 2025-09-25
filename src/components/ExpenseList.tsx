import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Edit,
	Trash,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	ChevronRight,
	ChevronLeft,
	ChevronsLeft,
	ChevronsRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { colors, formatCurrency } from '@/utils/utils';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/Config';
import habibAvatar from '@/avatar/habib.jpg';
import kanjunAvatar from '@/avatar/kanjun.jpg';
import { isMobile as isMobileDevice } from 'react-device-detect';
import ConfirmDialog from './ConfirmDialog';

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
	User: {
		id: number;
		username: string;
	};
}

interface ExpenseListProps {
	expenses: Expense[];
	isEditModeOn: boolean;
	isSelfExpense: boolean;
	onDeleteExpense: (id: number) => void;
}

type SortDirection = 'asc' | 'desc' | null;

const ExpenseList = ({
	expenses: initialExpenses,
	isEditModeOn,
	isSelfExpense,
	onDeleteExpense,
}: ExpenseListProps) => {
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
	const [sortDirection, setSortDirection] = useState<SortDirection>(null);
	const [expandedExpenseId, setExpandedExpenseId] = useState<number | null>(
		null
	);
	const { toast } = useToast();
	const navigate = useNavigate();
	const { token } = useAuth();
	const categoryColorMap: Record<string, string> = {};

	const ITEMS_PER_PAGE = 25;
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [paginatedExpenses, setPaginatedExpenses] = useState<Expense[]>([]);

	const [isSmallScreen, setIsSmallScreen] = useState(
		isMobileDevice || window.innerWidth < 768
	);

	useEffect(() => {
		setExpenses(initialExpenses);
		setTotalPages(
			Math.max(1, Math.ceil(initialExpenses.length / ITEMS_PER_PAGE))
		);
		setCurrentPage(1);
	}, [initialExpenses]);

	useEffect(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		setPaginatedExpenses(expenses.slice(startIndex, endIndex));
	}, [currentPage, expenses]);

	useEffect(() => {
		const handleResize = () => {
			setIsSmallScreen(window.innerWidth < 768);
		};

		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

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

	const getLuminance = (hex: string) => {
		const rgb = hex
			.replace('#', '')
			.match(/.{2}/g)!
			.map((x) => parseInt(x, 16) / 255);
		const [r, g, b] = rgb.map((c) =>
			c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
		);
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};

	const getTextColor = (bgColor: string) => {
		return getLuminance(bgColor) > 0.5 ? '#222222' : '#FFFFFF';
	};

	const getCategoryColor = (category: string, index: number) => {
		if (!categoryColorMap[category]) {
			categoryColorMap[category] = colors[index % colors.length];
		}
		const bgColor = categoryColorMap[category];
		const textColor = getTextColor(bgColor);
		return { bgColor, textColor };
	};

	const getUserAvatar = (userName: string) => {
		return userName === 'Habib' ? habibAvatar : kanjunAvatar;
	};

	const toggleExpand = (id: number) => {
		setExpandedExpenseId(expandedExpenseId === id ? null : id);
	};

	const truncateDescription = (description: string, maxLength = 20) => {
		if (description.length <= maxLength) return description;
		return `${description.substring(0, maxLength)}...`;
	};

	const goToPage = (page: number) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	};

	const goToFirstPage = () => goToPage(1);
	const goToPreviousPage = () => goToPage(currentPage - 1);
	const goToNextPage = () => goToPage(currentPage + 1);
	const goToLastPage = () => goToPage(totalPages);

	// Generate page numbers to display
	const getPageNumbers = () => {
		const pages = [];
		const maxPagesToShow = isSmallScreen ? 3 : 5;
		const halfMax = Math.floor(maxPagesToShow / 2);

		let startPage = Math.max(1, currentPage - halfMax);
		let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

		// Adjust if we're near the end
		if (endPage - startPage + 1 < maxPagesToShow) {
			startPage = Math.max(1, endPage - maxPagesToShow + 1);
		}

		for (let i = startPage; i <= endPage; i++) {
			pages.push(i);
		}

		return pages;
	};

	// Pagination component
	const Pagination = () => {
		const pageNumbers = getPageNumbers();

		if (totalPages <= 1) return null;

		return (
			<div className="flex items-center justify-center space-x-1 mt-4">
				<Button
					variant="outline"
					size="icon"
					onClick={goToFirstPage}
					disabled={currentPage === 1}
					className="hidden sm:flex h-8 w-8"
				>
					<ChevronsLeft className="h-4 w-4" />
					<span className="sr-only">First page</span>
				</Button>

				<Button
					variant="outline"
					size="icon"
					onClick={goToPreviousPage}
					disabled={currentPage === 1}
					className="h-8 w-8"
				>
					<ChevronLeft className="h-4 w-4" />
					<span className="sr-only">Previous page</span>
				</Button>

				{totalPages > 5 && currentPage > 2 && (
					<Button
						variant="outline"
						size="sm"
						onClick={goToFirstPage}
						className="h-8 w-8 hidden sm:flex"
					>
						1
					</Button>
				)}

				{totalPages > 5 && currentPage > 3 && (
					<span className="px-2 text-sm text-muted-foreground">...</span>
				)}

				{pageNumbers.map((number) => (
					<Button
						key={number}
						variant={currentPage === number ? 'default' : 'outline'}
						size="sm"
						onClick={() => goToPage(number)}
						className="h-8 w-8"
					>
						{number}
					</Button>
				))}

				{totalPages > 5 && currentPage < totalPages - 2 && (
					<span className="px-2 text-sm text-muted-foreground">...</span>
				)}

				{totalPages > 5 && currentPage < totalPages - 1 && (
					<Button
						variant="outline"
						size="sm"
						onClick={goToLastPage}
						className="h-8 w-8 hidden sm:flex"
					>
						{totalPages}
					</Button>
				)}

				<Button
					variant="outline"
					size="icon"
					onClick={goToNextPage}
					disabled={currentPage === totalPages}
					className="h-8 w-8"
				>
					<ChevronRight className="h-4 w-4" />
					<span className="sr-only">Next page</span>
				</Button>

				<Button
					variant="outline"
					size="icon"
					onClick={goToLastPage}
					disabled={currentPage === totalPages}
					className="hidden sm:flex h-8 w-8"
				>
					<ChevronsRight className="h-4 w-4" />
					<span className="sr-only">Last page</span>
				</Button>

				<div className="ml-2 text-xs text-muted-foreground hidden sm:block">
					Page {currentPage} of {totalPages}
				</div>
			</div>
		);
	};

	// Mobile card view for each expense
	const MobileExpenseCard = ({
		expense,
		index,
	}: {
		expense: Expense;
		index: number;
	}) => {
		const { bgColor, textColor } = getCategoryColor(
			expense.Category.name,
			expense.Category.id
		);
		const isExpanded = expandedExpenseId === expense.id;

		return (
			<div className="mb-3 p-4 rounded-lg border shadow-sm bg-card text-card-foreground border-border">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						{!isSelfExpense && (
							<img
								className="w-8 h-8 rounded-full"
								src={getUserAvatar(expense.User.username.split(' ')[0])}
								alt={`${expense.User.username.split(' ')[0]} avatar`}
							/>
						)}
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium">
								{isExpanded
									? expense.description
									: truncateDescription(expense.description)}
							</p>
							<p className="text-xs text-muted-foreground">
								{formatDate(expense.date)}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<p className="text-sm font-semibold whitespace-nowrap">
							{formatCurrency(expense.amount)}
						</p>
						<Button
							variant="ghost"
							size="sm"
							className="p-0 h-8 w-8"
							onClick={() => toggleExpand(expense.id)}
							aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
						>
							<ChevronRight
								className={`h-5 w-5 transition-transform ${
									isExpanded ? 'rotate-90' : ''
								}`}
							/>
						</Button>
					</div>
				</div>

				{isExpanded && (
					<div className="mt-3 pt-3 border-t border-border">
						<div className="flex flex-col gap-2">
							{expense.description.length > 20 && (
								<div className="mb-2">
									<p className="text-sm">{expense.description}</p>
								</div>
							)}
							<div className="flex justify-between items-center">
								<span
									className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
									style={{ backgroundColor: bgColor, color: textColor }}
								>
									{expense.Category.name}
								</span>

								{isEditModeOn && (
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											className="h-8"
											onClick={() => handleEdit(expense)}
										>
											<Edit className="h-4 w-4 mr-1" />
											Edit
										</Button>
										<ConfirmDialog
											open={isDeleteDialogOpen && deleteId === expense.id}
											onOpenChange={setIsDeleteDialogOpen}
											title="Confirm Deletion"
											description="Are you sure you want to delete this expense? This action cannot be undone."
											confirmText="Delete"
											cancelText="Cancel"
											confirmVariant="destructive"
											onConfirm={handleDelete}
											trigger={
												<Button
													size="icon"
													variant="ghost"
													className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive/20"
													onClick={() => setDeleteId(expense.id)}
												>
													<Trash className="h-4 w-4" />
													<span className="sr-only">Delete</span>
												</Button>
											}
										/>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<Card className="card-glass w-full animate-slide-in-bottom [animation-delay:400ms]">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg font-medium flex justify-between items-center">
					<span>Recent Expenses</span>
					{isSmallScreen && (
						<Button
							variant="ghost"
							size="sm"
							className="flex items-center text-xs"
							onClick={toggleSortByCategory}
						>
							Sort by Category {getSortIcon()}
						</Button>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isSmallScreen ? (
					/* Mobile View */
					<div className="space-y-1">
						{paginatedExpenses.length > 0 ? (
							paginatedExpenses.map((expense, index) => (
								<MobileExpenseCard
									key={expense.id}
									expense={expense}
									index={index + (currentPage - 1) * ITEMS_PER_PAGE}
								/>
							))
						) : (
							<div className="py-10 text-center text-muted-foreground">
								No expenses found for this period.
							</div>
						)}
					</div>
				) : (
					/* Desktop View */
					<div className="relative overflow-x-auto rounded-lg">
						<table className="w-full text-sm text-left">
							<thead className="text-xs uppercase bg-muted/40 text-muted-foreground">
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
								{paginatedExpenses.map((expense, index) => (
									<tr
										key={expense.id}
										className="border-b border-border bg-card text-card-foreground last:border-0"
									>
										<td className="px-4 py-3 whitespace-nowrap">
											{index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-4">
												{!isSelfExpense && (
													<img
														className="w-10 h-10 rounded-full"
														src={getUserAvatar(
															expense.User.username.split(' ')[0]
														)}
														alt={`${
															expense.User.username.split(' ')[0]
														} profile`}
													/>
												)}
												<div>
													<div>{expense.description}</div>
													<div className="text-sm text-muted-foreground">
														{formatDate(expense.date)}
													</div>
												</div>
											</div>
										</td>
										<td className="px-4 py-3">
											{(() => {
												const { bgColor, textColor } = getCategoryColor(
													expense.Category.name,
													expense.Category.id
												);
												return (
													<span
														className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
														style={{
															backgroundColor: bgColor,
															color: textColor,
														}}
													>
														{expense.Category.name}
													</span>
												);
											})()}
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
													<ConfirmDialog
														open={isDeleteDialogOpen && deleteId === expense.id}
														onOpenChange={setIsDeleteDialogOpen}
														title="Confirm Deletion"
														description="Are you sure you want to delete this expense? This action cannot be undone."
														confirmText="Delete"
														cancelText="Cancel"
														confirmVariant="destructive"
														onConfirm={handleDelete}
														trigger={
															<Button
																size="icon"
																variant="ghost"
																className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive/20"
																onClick={() => setDeleteId(expense.id)}
															>
																<Trash className="h-4 w-4" />
																<span className="sr-only">Delete</span>
															</Button>
														}
													/>
												</div>
											</td>
										)}
									</tr>
								))}
								{paginatedExpenses.length === 0 && (
									<tr className="border-b border-border bg-card">
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
				)}

				<Pagination />
			</CardContent>
		</Card>
	);
};

export default ExpenseList;
