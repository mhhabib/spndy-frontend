import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Search, Calendar } from 'lucide-react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ExpenseList, { Expense } from '@/components/ExpenseList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { colors, formatCurrency } from '@/utils/utils';
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Legend,
	Tooltip,
	BarChart,
	Bar,
	CartesianGrid,
	XAxis,
	YAxis,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/Config';
import ExpenseCategory from '@/utils/ExpenseCategory';
import ExpenseChart from '@/utils/ExpenseChart';
import ExpenseExport from '@/components/ExpenseExport';

interface CategoryData {
	name: string;
	value: number;
	color: string;
}

const MyExpenses = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
		to: new Date(),
	});
	const [totalExpenses, setTotalExpenses] = useState(0);
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
	const [selectedCategoryId, setSelectedCategoryId] = useState<number>(-1);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const { email } = useAuth();

	const isEditModeOn = localStorage.getItem('editMode') === 'true';

	useEffect(() => {
		const fetchExpenses = async () => {
			if (!dateRange?.from || !dateRange?.to) return;

			setLoading(true);
			try {
				const fromDate = format(dateRange.from, 'yyyy-MM-dd');
				const toDate = format(dateRange.to, 'yyyy-MM-dd');

				const response = await axios.get(
					`${API_BASE_URL}/reports/myexpense/range`,
					{
						params: {
							fromDate,
							toDate,
							email: email,
						},
						headers: {
							Authorization: `Bearer ${localStorage.getItem('access_token')}`,
						},
					}
				);

				setTotalExpenses(response.data.totalExpense);
				const categories: CategoryData[] =
					response.data.categoricalExpenses.map((item, index) => ({
						id: item.categoryId,
						name: item.categoryName,
						value: item.total,
						color: colors[index % colors.length],
					}));

				setCategoryData(categories);

				const sortedExpenses = response.data.expenses.sort((a, b) => {
					const dateDiff =
						new Date(b.date).getTime() - new Date(a.date).getTime();
					if (dateDiff !== 0) return dateDiff;
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
				});

				setExpenses(sortedExpenses);

				setError(null);
			} catch (err) {
				console.error('Error fetching expenses:', err);
				setError('Failed to load expense data');
			} finally {
				setLoading(false);
			}
		};
		fetchExpenses();
	}, [dateRange]);

	const filteredExpenses = expenses.filter((expense) => {
		const matchesSearch = expense.description
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const matchesCategory =
			selectedCategoryId === -1 || expense.CategoryId === selectedCategoryId;
		return matchesSearch && matchesCategory;
	});

	const handleDeleteExpense = (id: number) => {
		setExpenses(expenses.filter((expense) => expense.id !== id));
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const formatDateRange = () => {
		if (!dateRange?.from) return 'Select date range';
		if (!dateRange.to) return `From ${format(dateRange.from, 'PPP')}`;
		return `${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`;
	};

	const handleCategoryId = (id: number) => {
		setSelectedCategoryId(id);
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />

			<main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
					<h1 className="text-2xl font-bold">My Expenses</h1>
					<div className="flex items-center gap-2">
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className="w-full sm:w-auto justify-start gap-2"
								>
									<Calendar className="h-4 w-4" />
									{formatDateRange()}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="end">
								<CalendarComponent
									initialFocus
									mode="range"
									defaultMonth={dateRange?.from}
									selected={dateRange}
									onSelect={setDateRange}
									numberOfMonths={2}
									className="bg-white rounded-md border border-border/50"
								/>
							</PopoverContent>
						</Popover>
						<ExpenseExport
							expenses={filteredExpenses}
							categoryData={categoryData}
							totalExpenses={totalExpenses}
							dateRange={dateRange}
						/>
					</div>
				</div>

				<Card className="card-glass w-full animate-slide-in-bottom [animation-delay:100ms]">
					<CardHeader className="pb-2">
						<CardTitle className="text-lg font-medium flex justify-between items-center">
							<span>Selected Period Expenses</span>
							<span className="text-primary">
								{loading ? 'Loading...' : formatCurrency(totalExpenses || 0)}
							</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{error && (
							<div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">
								{error}
							</div>
						)}
						{!error && (
							<div className="grid grid-cols-1 md:grid-cols-7 gap-4">
								<ExpenseChart expenseData={categoryData} />
								<ExpenseCategory
									data={categoryData}
									expenseTotal={totalExpenses}
									onCategoryClick={(id: number) => handleCategoryId(id)}
								/>
							</div>
						)}
					</CardContent>
				</Card>

				<div className="relative w-full animate-slide-in-bottom [animation-delay:300ms]">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
						<Input
							type="text"
							placeholder="Search expenses..."
							value={searchQuery}
							onChange={handleSearch}
							className="pl-10 py-6 bg-white/70 backdrop-blur-md border-border/50 focus-visible:ring-primary"
						/>
					</div>
				</div>

				{loading ? (
					<div className="text-center p-6">
						<p>Loading expenses...</p>
					</div>
				) : (
					<ExpenseList
						expenses={filteredExpenses}
						isEditModeOn={isEditModeOn}
						isSelfExpense={true}
						onDeleteExpense={handleDeleteExpense}
					/>
				)}
			</main>

			<Footer />
		</div>
	);
};

export default MyExpenses;
