import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/utils';
import ExpenseCategory from '@/utils/ExpenseCategory';
import ExpenseChart from '@/utils/ExpenseChart';
import { useMonthlySummary } from '@/queries/useMonthlySummary';

const MonthSummary = ({ onCategoryClick }) => {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1;

	const { data, isLoading, error } = useMonthlySummary(year, month);

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
				<CardContent>
					<div className="p-4 text-center rounded-lg bg-destructive/10 text-destructive">
						Failed to load expense summary
					</div>
				</CardContent>
			</Card>
		);
	}

	const currentMonth = now.toLocaleString('default', {
		month: 'long',
		year: '2-digit',
	});

	return (
		<Card className="w-full animate-slide-in-bottom bg-card text-card-foreground border border-border">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg font-medium flex justify-between items-center">
					<span>{currentMonth} - Expenses</span>
					<span className="text-primary">
						{formatCurrency(data.monthTotal)}
					</span>
				</CardTitle>
			</CardHeader>

			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-7 gap-4">
					<ExpenseChart expenseData={data.monthData} />
					<ExpenseCategory
						data={data.monthData}
						expenseTotal={data.monthTotal}
						onCategoryClick={onCategoryClick}
					/>
				</div>
			</CardContent>
		</Card>
	);
};

export default MonthSummary;
