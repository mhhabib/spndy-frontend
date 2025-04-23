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
} from 'recharts';
import { API_BASE_URL } from '@/config/Config';
import { useAuth } from '@/contexts/AuthContext';

interface CategoryData {
	name: string;
	value: number;
	color: string;
}

const Summary = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
		to: new Date(),
	});
	const [totalExpenses, setTotalExpenses] = useState(0);
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchExpenses = async () => {
			if (!dateRange?.from || !dateRange?.to) return;

			setLoading(true);
			try {
				const fromDate = format(dateRange.from, 'yyyy-MM-dd');
				const toDate = format(dateRange.to, 'yyyy-MM-dd');

				const response = await axios.get(`${API_BASE_URL}/reports/range`, {
					params: {
						fromDate,
						toDate,
					},
				});
				setTotalExpenses(response.data.totalExpense);
				const categories: CategoryData[] =
					response.data.categoricalExpenses.map((item, index) => ({
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

	const filteredExpenses = expenses.filter((expense) =>
		expense.description.toLowerCase().includes(searchQuery.toLowerCase())
	);

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

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />

			<main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
					<h1 className="text-2xl font-bold">Expense Summary</h1>

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
				</div>

				<Card className="card-glass w-full animate-slide-in-bottom [animation-delay:100ms]">
					<CardHeader className="pb-2">
						<CardTitle className="text-lg font-medium flex justify-between items-center">
							<span>Expenses for Selected Period</span>
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
								<div className="md:col-span-3 h-[240px]">
									{loading ? (
										<div className="flex items-center justify-center h-full">
											<p className="text-muted-foreground">Loading...</p>
										</div>
									) : categoryData.length > 0 ? (
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={categoryData}
													cx="50%"
													cy="50%"
													innerRadius={60}
													outerRadius={80}
													paddingAngle={2}
													dataKey="value"
												>
													{categoryData.map((entry, index) => (
														<Cell key={`cell-${index}`} fill={entry.color} />
													))}
												</Pie>
												<Tooltip
													formatter={(value: number) => formatCurrency(value)}
													contentStyle={{
														borderRadius: '8px',
														backgroundColor: 'rgba(255, 255, 255, 0.9)',
														boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
														border: 'none',
													}}
												/>
												<Legend
													layout="vertical"
													verticalAlign="middle"
													align="right"
													wrapperStyle={{ fontSize: '12px' }}
												/>
											</PieChart>
										</ResponsiveContainer>
									) : (
										<div className="flex items-center justify-center h-full">
											<p className="text-muted-foreground">
												No expenses found for this period
											</p>
										</div>
									)}
								</div>
								<div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
									{categoryData.map((category) => (
										<div
											key={category.name}
											className="p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-border/50 shadow-sm hover-scale"
										>
											<div className="flex items-center space-x-2 mb-1">
												<div
													className="w-3 h-3 rounded-full"
													style={{ backgroundColor: category.color }}
												></div>
												<span className="text-xs font-medium">
													{category.name}
												</span>
											</div>
											<p className="text-l font-semibold">
												{formatCurrency(category.value)}
											</p>
											<p className="text-xs text-muted-foreground">
												{((category.value / totalExpenses) * 100).toFixed(2)}%
												of total
											</p>
										</div>
									))}
									{!loading && categoryData.length === 0 && (
										<div className="p-3 col-span-3 rounded-lg bg-white/50 backdrop-blur-sm border border-border/50 shadow-sm">
											<p className="text-center text-muted-foreground">
												No expense data available for the selected period
											</p>
										</div>
									)}
								</div>
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
						isEditModeOn={false}
						isSelfExpense={false}
						onDeleteExpense={handleDeleteExpense}
					/>
				)}
			</main>

			<Footer />
		</div>
	);
};

export default Summary;
