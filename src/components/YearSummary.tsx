import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Legend,
	Tooltip,
} from 'recharts';
import { ApiResponse, colors, formatCurrency } from '@/utils/utils';
import { API_BASE_URL } from '@/config/Config';

interface CategoryData {
	name: string;
	value: number;
	color: string;
}

const YearSummary = () => {
	const [yearTotal, setYearTotal] = useState(0);
	const [yearData, setYearData] = useState<CategoryData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const currentYear = new Date().toLocaleString('default', {
		year: 'numeric',
	});

	useEffect(() => {
		const fetchExpenseData = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(
					`${API_BASE_URL}/reports/yearly/${currentYear}`
				);
				if (!response.ok) {
					throw new Error(`API request failed with status ${response.status}`);
				}
				const data: ApiResponse = await response.json();

				setYearTotal(data.totalExpense);

				const categoryData: CategoryData[] = data.categoricalExpenses.map(
					(item) => ({
						name: item.categoryName,
						value: item.total,
						color: colors[Math.floor(Math.random() * colors.length)],
					})
				);

				setYearData(categoryData);
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

	return (
		<Card className="card-glass w-full animate-slide-in-bottom [animation-delay:100ms]">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg font-medium flex justify-between items-center">
					<span>{currentYear} Expenses</span>
					<span className="text-primary">{formatCurrency(yearTotal)}</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-7 gap-4">
					<div className="md:col-span-3 h-[240px]">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={yearData}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={80}
									paddingAngle={2}
									dataKey="value"
									minAngle={2}
								>
									{yearData.map((entry, index) => (
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
					</div>
					<div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
						{yearData.map((category) => (
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
									{((category.value / yearTotal) * 100).toFixed(2)}% of total
								</p>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default YearSummary;
