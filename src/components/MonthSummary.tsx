import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { ApiResponse, colors, formatCurrency } from '@/utils/utils';
import ExpenseCategory from '@/utils/ExpenseCategory';
import ExpenseChart from '@/utils/ExpenseChart';
import { useApiClient } from '@/utils/apiClient';

interface CategoryData {
	id: number;
	name: string;
	value: number;
	color: string;
}

const MonthSummary = ({ onCategoryClick }) => {
	const [monthTotal, setMonthTotal] = useState(0);
	const [monthData, setMonthData] = useState<CategoryData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const apiClient = useApiClient();

	const nowDate = new Date();
	const thisYear = nowDate.getFullYear();
	const thisMonth = nowDate.getMonth() + 1;

	useEffect(() => {
		const fetchExpenseData = async () => {
			try {
				setIsLoading(true);
				const data = await apiClient.get<ApiResponse>(
					`/reports/monthly/${thisYear}/${thisMonth}`
				);

				setMonthTotal(data.totalExpense);
				const categoryData: CategoryData[] = data.categoricalExpenses.map(
					(item, index) => ({
						id: item.categoryId,
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
			<Card className="w-full animate-pulse">
				<CardHeader className="pb-2" />
				<CardContent className="text-muted-foreground">
					Loading expense data...
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="w-full">
				<CardHeader className="pb-2" />
				<CardContent>
					<div className="p-4 text-center rounded-lg bg-destructive/10 text-destructive">
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
		<Card className="w-full animate-slide-in-bottom [animation-delay:200ms] bg-card text-card-foreground border border-border">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg font-medium flex justify-between items-center">
					<span>{currentMonth} - Expenses</span>
					<span className="text-primary">{formatCurrency(monthTotal)}</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-7 gap-4">
					<ExpenseChart expenseData={monthData} />
					<ExpenseCategory
						data={monthData}
						expenseTotal={monthTotal}
						onCategoryClick={(id: number) => onCategoryClick(id)}
					/>
				</div>
			</CardContent>
		</Card>
	);
};

export default MonthSummary;
