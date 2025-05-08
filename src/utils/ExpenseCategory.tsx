import { formatCurrency } from "./utils";

const ExpenseCategory = ({data, expenseTotal}) => {
	return (
		<div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
			{data.map((category) => (
				<div
					key={category.name}
					className="p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-border/50 shadow-sm hover-scale"
                    style={{borderLeft: `2px solid ${category.color}`}}
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
						{((category.value / expenseTotal) * 100).toFixed(2)}% of total
					</p>
				</div>
			))}
		</div>
	);
};
export default ExpenseCategory;
