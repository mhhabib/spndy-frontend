import {
	ResponsiveContainer,
	Pie,
	PieChart,
	Cell,
	Tooltip,
	Legend,
} from 'recharts';
import { formatCurrency } from './utils';

const ExpenseChart = ({ expenseData }) => {
	return (
		<div className="md:col-span-3 h-[340px] mb-5 md:mb-0">
			{expenseData.length > 0 ? (
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={expenseData}
							cx="50%"
							cy="50%"
							innerRadius={60}
							outerRadius={100}
							paddingAngle={2}
							dataKey="value"
							minAngle={5}
						>
							{expenseData.map((entry, index) => (
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
							layout="horizontal"
							verticalAlign="bottom"
							align="center"
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
	);
};
export default ExpenseChart;
