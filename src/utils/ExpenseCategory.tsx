import { useState } from 'react';
import { formatCurrency } from './utils';

const ExpenseCategory = ({ data, expenseTotal, onCategoryClick }) => {
	const [selectedId, setSelectedId] = useState<number>(-1);

	const handleClick = (id: number) => {
		if (onCategoryClick) {
			onCategoryClick(id === selectedId ? -1 : id);
		}
		setSelectedId(id === selectedId ? -1 : id);
	};

	return (
		<div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
			{data.map((category) => (
				<div
					onClick={() => handleClick(category.id)}
					key={category.name}
					className="cursor-pointer p-3 rounded-lg backdrop-blur-sm border border-border/50 shadow-sm hover-scale"
					style={{
						borderLeft: `2px solid ${category.color}`,
						backgroundColor:
							category.id === selectedId
								? `${category.color}1A`
								: 'rgba(255, 255, 255, 0.5)',
					}}
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
