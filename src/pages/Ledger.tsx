import React, { useEffect, useMemo, useState } from 'react';
import {
	ArrowUpCircle,
	ArrowDownCircle,
	Calendar,
	User,
	DollarSign,
	Loader2,
	AlertCircle,
	Activity,
	Plus,
	EditIcon,
	Search,
	Trash,
	X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApiClient } from '@/utils/apiClient';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ConfirmDialog';
import TransactionModal from '@/components/ledger/TransactionModal';

interface Transaction {
	id: string;
	from: string;
	to: string;
	type: 'LEND' | 'BORROW';
	description: string;
	amount: string;
	date: string;
	createdAt: string;
	updatedAt: string;
	User: {
		id: number;
		username: string;
	};
}

const TAB_LABELS: Record<'ALL' | 'LEND' | 'BORROW' | 'ADD', string> = {
	ALL: 'All',
	LEND: 'Lent',
	BORROW: 'Borrowed',
	ADD: 'Add New',
};

const Ledger: React.FC = () => {
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingTransaction, setEditingTransaction] = useState<
		Partial<Transaction> | undefined
	>(undefined);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [filter, setFilter] = useState<'ALL' | 'LEND' | 'BORROW'>('ALL');
	const [searchTerm, setSearchTerm] = useState('');
	const [showSearch, setShowSearch] = useState(false);

	const { toast } = useToast();
	const apiClient = useApiClient();

	// Fetch transactions
	const fetchTransactions = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiClient.get<Transaction[]>('/ledgers');
			setTransactions(data);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to fetch transactions'
			);
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTransactions();
	}, []);

	const handleSave = async (transaction: Partial<Transaction>) => {
		if (transaction.id) {
			try {
				await apiClient.put(`/ledgers/${transaction.id}`, transaction);
				toast({
					title: 'Ledger updated',
					description: 'Transaction updated successfully',
				});
			} catch {
				toast({
					title: 'Error',
					description: 'Failed to update',
					variant: 'destructive',
				});
			} finally {
				fetchTransactions();
			}
		} else {
			try {
				await apiClient.post('/ledgers', transaction);
				toast({
					title: 'Ledger created',
					description: 'Transaction created successfully',
				});
			} catch {
				toast({
					title: 'Error',
					description: 'Failed to create',
					variant: 'destructive',
				});
			} finally {
				fetchTransactions();
			}
		}
	};

	const handleEdit = (transaction: Transaction) => {
		setEditingTransaction(transaction);
		setModalOpen(true);
	};

	const handleDelete = async () => {
		if (deleteId) {
			try {
				await apiClient.del(`/ledgers/${deleteId}`);
				toast({ title: 'Deleted', description: 'Ledger deleted successfully' });
			} catch {
				toast({
					title: 'Error',
					description: 'Failed to delete',
					variant: 'destructive',
				});
			} finally {
				setIsDeleteDialogOpen(false);
				fetchTransactions();
			}
		}
	};

	const handleRefresh = () => fetchTransactions();

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});

	const formatAmount = (amount: string) =>
		new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(Number(amount));

	const filteredTransactions = useMemo(() => {
		return transactions.filter((t) => {
			const matchesFilter = filter === 'ALL' || t.type === filter;
			const matchesSearch =
				t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
				t.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
				t.to.toLowerCase().includes(searchTerm.toLowerCase());
			return matchesFilter && matchesSearch;
		});
	}, [transactions, filter, searchTerm]);

	const totalLent = useMemo(
		() =>
			transactions
				.filter((t) => t.type === 'LEND')
				.reduce((sum, t) => sum + Number(t.amount), 0),
		[transactions]
	);
	const totalBorrowed = useMemo(
		() =>
			transactions
				.filter((t) => t.type === 'BORROW')
				.reduce((sum, t) => sum + Number(t.amount), 0),
		[transactions]
	);
	const netAmount = useMemo(
		() => totalLent - totalBorrowed,
		[totalLent, totalBorrowed]
	);

	const TransactionDirection = ({
		from,
		to,
		type,
	}: {
		from: string;
		to: string;
		type: 'LEND' | 'BORROW';
	}) => {
		const isLend = type === 'LEND';
		return (
			<div className="flex items-center space-x-1 sm:space-x-2 mb-1 flex-wrap">
				<span className="font-semibold text-card-foreground text-sm sm:text-base truncate max-w-20 sm:max-w-none">
					{isLend ? from : to}
				</span>
				<span className="text-muted-foreground text-xs sm:text-sm">
					{isLend ? '→' : '←'}
				</span>
				<span className="font-semibold text-card-foreground text-sm sm:text-base truncate max-w-20 sm:max-w-none">
					{isLend ? to : from}
				</span>
				<span
					className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium uppercase ${
						isLend
							? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
							: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
					}`}
				>
					{isLend ? 'LENT' : 'BORROWED'}
				</span>
			</div>
		);
	};

	if (loading)
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center px-4">
					<div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
						<Loader2 className="w-8 h-8 text-white animate-spin" />
					</div>
					<h3 className="text-xl font-semibold text-card-foreground mb-2">
						Loading your ledger...
					</h3>
					<p className="text-muted-foreground">
						Please wait while we fetch your transactions
					</p>
				</div>
			</div>
		);

	return (
		<>
			<div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
				{error && (
					<div className="mb-4 sm:mb-8 bg-destructive/10 border border-destructive/30 p-4 rounded-lg">
						<div className="flex items-start sm:items-center">
							<AlertCircle className="w-5 h-5 text-destructive mr-3 flex-shrink-0" />
							<div className="flex-1 min-w-0">
								<h3 className="text-sm font-medium text-destructive">Error</h3>
								<p className="text-sm text-muted-foreground mt-1 break-words">
									{error}
								</p>
							</div>
							<Button
								onClick={handleRefresh}
								variant="outline"
								size="sm"
								className="ml-2 sm:ml-4"
							>
								Retry
							</Button>
						</div>
					</div>
				)}

				{/* Net Balance */}
				<div className="bg-card text-card-foreground rounded-lg p-4 sm:p-6 mb-4 sm:mb-8 shadow-sm border border-border">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
							<Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground mb-1">Net Balance</p>
							<p
								className={`text-xl sm:text-2xl font-bold ${
									netAmount >= 0 ? 'text-green-600' : 'text-red-600'
								}`}
							>
								{formatAmount(Math.abs(netAmount).toString())}
							</p>
							<p
								className={`text-sm font-medium ${
									netAmount >= 0 ? 'text-green-500' : 'text-red-500'
								}`}
							>
								{netAmount >= 0 ? '↗ You are owed' : '↘ You owe'}
							</p>
						</div>
					</div>
				</div>

				{/* Filter Tabs */}
				<div className="flex space-x-4 sm:space-x-8 mb-4 overflow-x-auto">
					{(['ALL', 'LEND', 'BORROW'] as const).map((tab) => (
						<Button
							key={tab}
							variant={filter === tab ? 'default' : 'ghost'}
							size="sm"
							onClick={() => setFilter(tab)}
							className="whitespace-nowrap"
						>
							{TAB_LABELS[tab]}
						</Button>
					))}
				</div>

				{/* Controls: Search + Add */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
					<div className="flex items-center space-x-2 sm:space-x-0">
						<button
							onClick={() => setShowSearch(!showSearch)}
							className="sm:hidden p-2 text-muted-foreground hover:text-card-foreground transition-colors"
						>
							{showSearch ? (
								<X className="w-5 h-5" />
							) : (
								<Search className="w-5 h-5" />
							)}
						</button>
						<div
							className={`relative ${
								showSearch ? 'flex-1' : 'hidden sm:block'
							}`}
						>
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<input
								type="text"
								placeholder="Search transactions..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-64 bg-card text-card-foreground placeholder:text-muted-foreground"
							/>
						</div>
					</div>
					<Button
						onClick={() => {
							setEditingTransaction(undefined);
							setModalOpen(true);
						}}
						className="w-full sm:w-auto flex items-center justify-center space-x-2"
					>
						<Plus className="w-4 h-4" />
						<span>Add Transaction</span>
					</Button>
				</div>

				{/* Transaction List */}
				<div className="space-y-2 mt-4">
					{filteredTransactions.length === 0 ? (
						<div className="bg-card text-card-foreground rounded-lg p-6 sm:p-12 text-center shadow-sm border border-border">
							<div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
								<DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
							</div>
							<h3 className="text-lg sm:text-xl font-semibold mb-2">
								No transactions found
							</h3>
							<p className="text-muted-foreground mb-6">
								Start by adding your first transaction
							</p>
							<Button onClick={() => setModalOpen(true)}>
								Add Transaction
							</Button>
						</div>
					) : (
						filteredTransactions.map((transaction) => (
							<div
								key={transaction.id}
								className="bg-card text-card-foreground rounded-lg p-3 sm:p-4 shadow-sm border border-border hover:shadow-md transition-shadow group"
							>
								<div className="flex items-start justify-between space-x-3">
									<div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
										{/* Icon */}
										<div
											className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
												transaction.type === 'LEND'
													? 'bg-green-100 dark:bg-green-900/30'
													: 'bg-red-100 dark:bg-red-900/30'
											}`}
										>
											{transaction.type === 'LEND' ? (
												<ArrowUpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
											) : (
												<ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
											)}
										</div>

										{/* Content */}
										<div className="flex-1 min-w-0">
											<TransactionDirection
												from={transaction.from}
												to={transaction.to}
												type={transaction.type}
											/>
											<p className="text-muted-foreground text-sm mb-2 break-words">
												{transaction.description}
											</p>
											<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
												<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
													<div className="flex items-center space-x-1">
														<Calendar className="w-3 h-3" />
														<span>{formatDate(transaction.date)}</span>
													</div>
													<div className="flex items-center space-x-1">
														<User className="w-3 h-3" />
														<span className="truncate max-w-20 sm:max-w-none">
															{transaction.User.username}
														</span>
													</div>
													<Button
														size="icon"
														variant="ghost"
														className="text-muted-foreground hover:text-primary h-8 w-8 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
														onClick={() => handleEdit(transaction)}
													>
														<EditIcon className="h-3 w-3 sm:h-4 sm:w-4" />
													</Button>

													<ConfirmDialog
														open={
															isDeleteDialogOpen && deleteId === transaction.id
														}
														onOpenChange={setIsDeleteDialogOpen}
														title="Confirm Deletion"
														description="Are you sure you want to delete this ledger? This action cannot be undone."
														confirmText="Delete"
														cancelText="Cancel"
														confirmVariant="destructive"
														onConfirm={handleDelete}
														trigger={
															<Button
																size="icon"
																variant="ghost"
																className="text-muted-foreground hover:text-red-600 h-8 w-8 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
																onClick={() => setDeleteId(transaction.id)}
															>
																<Trash className="h-3 w-3 sm:h-4 sm:w-4" />
															</Button>
														}
													/>
												</div>
											</div>
										</div>
									</div>

									{/* Amount */}
									<div className="text-right flex-shrink-0">
										<div
											className={`text-base sm:text-lg font-bold ${
												transaction.type === 'LEND'
													? 'text-green-600'
													: 'text-red-600'
											}`}
										>
											{formatAmount(transaction.amount)}
										</div>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			<TransactionModal
				open={modalOpen}
				onOpenChange={setModalOpen}
				onSave={handleSave}
				initialData={editingTransaction}
			/>
		</>
	);
};

export default Ledger;
