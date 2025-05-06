import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Legend,
	Tooltip,
	BarChart,
	CartesianGrid,
	Bar,
	XAxis,
	YAxis,
	LabelList,
} from 'recharts';
import { ApiResponse, colors, formatCurrency } from '@/utils/utils';
import { API_BASE_URL } from '@/config/Config';

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
					<span>{currentMonth} - Expenses</span>
					<span className="text-primary">{formatCurrency(monthTotal)}</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-7 gap-4 flex items-center justify-center mt-5 mb-5">
					<div className="md:col-span-4 h-[340px]">
						{monthData.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={monthData}
									margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="name"
										tick={{ fontSize: 10 }}
										interval={0}
										angle={-45}
										textAnchor="end"
										height={50}
									/>
									<YAxis
										tick={{ fontSize: 10 }}
										tickFormatter={(value) => {
											if (value >= 1000)
												return `৳${(value / 1000).toFixed(0)}k`;
											return `৳ ${value}`;
										}}
									/>
									<Tooltip
										formatter={(value) => formatCurrency(Number(value))}
										contentStyle={{
											borderRadius: '8px',
											backgroundColor: 'rgba(244, 223, 193, 0.9)',
											boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
											border: 'none',
										}}
									/>
									<Bar dataKey="value" name="Amount" radius={[2, 2, 0, 0]}>
										{monthData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
										<LabelList
											dataKey="value"
											position="top"
											style={{ fontSize: 10, fill: '#333' }} // Customize text appearance
											formatter={(value) => `৳ ${value}`} // Optional: format label
										/>
									</Bar>
								</BarChart>
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
						{monthData.map((category) => (
							<div
								key={category.name}
								className="p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-border/50 shadow-sm hover-scale"
							>
								<div className="flex items-center space-x-2 mb-1">
									<div
										className="w-3 h-3 rounded-full"
										style={{ backgroundColor: category.color }}
									></div>
									<span className="text-xs font-medium">{category.name}</span>
								</div>
								<p className="text-l font-semibold">
									{formatCurrency(category.value)}
								</p>
								<p className="text-xs text-muted-foreground">
									{((category.value / monthTotal) * 100).toFixed(2)}% of total
								</p>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default MonthSummary;
