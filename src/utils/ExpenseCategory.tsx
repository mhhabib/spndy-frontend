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
			{data.map((category) => {
				const isSelected = category.id === selectedId;
				return (
					<div
						onClick={() => handleClick(category.id)}
						key={category.name}
						className={`
							cursor-pointer p-3 rounded-lg border shadow-sm
							transition-colors duration-200
							hover:brightness-105
							bg-card text-card-foreground border-border
						`}
						style={{
							borderLeft: `3px solid ${category.color}`,
							backgroundColor: isSelected ? `${category.color}33` : undefined,
						}}
					>
						<div className="flex items-center space-x-2 mb-1">
							<div
								className="w-3 h-3 rounded-full"
								style={{ backgroundColor: category.color }}
							></div>
							<span className="text-xs font-medium">{category.name}</span>
						</div>
						<p className="text-base font-semibold">
							{formatCurrency(category.value)}
						</p>
						<p className="text-xs text-muted-foreground">
							{((category.value / expenseTotal) * 100).toFixed(2)}% of total
						</p>
					</div>
				);
			})}
		</div>
	);
};

export default ExpenseCategory;
