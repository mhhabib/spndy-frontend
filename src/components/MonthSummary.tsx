import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { ApiResponse, colors, formatCurrency } from '@/utils/utils';
import { API_BASE_URL } from '@/config/Config';
import ExpensePieChart from '@/utils/ExpensePieChart';
import CategoryContainer from '@/utils/CategoryContainer';

interface CategoryData {
	name: string;
	value: number;
	color: string;
}

const MonthSummary = () => {
	const [monthTotal, setMonthTotal] = useState(0);
	const [monthData, setMonthData] = useState<CategoryData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const nowDate = new Date();
	const thisYear = nowDate.getFullYear();
	const thisMonth = nowDate.getMonth() + 1;

	useEffect(() => {
		const fetchExpenseData = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(
					`${API_BASE_URL}/reports/monthly/${thisYear}/${thisMonth}`
				);
				if (!response.ok) {
					throw new Error(`API request failed with status ${response.status}`);
				}
				const data: ApiResponse = await response.json();

				setMonthTotal(data.totalExpense);

				const categoryData: CategoryData[] = data.categoricalExpenses.map(
					(item, index) => ({
						name: item.categoryName,
						value: item.total,
						color: colors[index % colors.length],
					})
				);

				setMonthData(categoryData);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'Failed to fetch expense data'
				);
				console.error('Error fetching expense data:', err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchExpenseData();
	}, []);

	if (isLoading) {
		return (
			<Card>
				<CardHeader className="pb-2"></CardHeader>
				<CardContent>Loading expense data...</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader className="pb-2"></CardHeader>
				<CardContent>
					<div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">
						{error}
					</div>
				</CardContent>
			</Card>
		);
	}

	const currentMonth = new Date().toLocaleString('default', {
		month: 'long',
		year: '2-digit',
	});

	return (
		<Card className="card-glass w-full animate-slide-in-bottom [animation-delay:200ms]">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg font-medium flex justify-between items-center">
					<span className="text-gray-800">{currentMonth} - Expenses</span>
					{isLoading ? (
						<span className="text-gray-400 font-bold">Loading...</span>
					) : (
						<span className="text-l px-2 py-1 bg-black text-cyan-400 border-l-4 border-r-4 border-cyan-400">
							<span className="font-mono tracking-wider">
								{formatCurrency(monthTotal || 0)}
							</span>
						</span>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-7 gap-4 flex items-center justify-center mt-5">
					<div className="md:col-span-3 h-[340px] mb-10 sm:mb-0">
						{monthData.length > 0 ? (
							<ExpensePieChart data={monthData} />
						) : (
							<div className="flex items-center justify-center h-full">
								<p className="text-muted-foreground">
									No expenses found for this period
								</p>
							</div>
						)}
					</div>
					<CategoryContainer
						data={monthData}
						expenseTotal={monthTotal}
						isLoading={isLoading}
					/>
				</div>
			</CardContent>
		</Card>
	);
};

export default MonthSummary;
