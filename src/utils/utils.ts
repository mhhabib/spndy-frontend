// utils.ts

export interface ApiResponse {
	totalExpense: number;
	categoricalExpenses: {
		categoryId: number;
		categoryName: string;
		total: number;
	}[];
	expenses: {
		id: number;
		description: string;
		amount: number;
		date: string;
		createdAt: string;
		updatedAt: string;
		userId: number;
		CategoryId: number;
		Category: {
			id: number;
			name: string;
			createdAt: string;
			updatedAt: string;
		};
	}[];
}

export const colors = [
	'#1F7D53',
	'#BE5985',
	'#FFA725',
	'#AC1754',
	'#2DAA9E',
	'#00879E',
	'#504B38',
	'#626F47',
	'#E07A5F',
	'#A0C878',
	'#DD88CF',
	'#574964',
	'#727D73',
	'#7C444F',
	'#500073',
	'#131010',
];

export const formatCurrency = (value: number, currency: string = 'BDT') => {
	if (currency === 'BDT') {
		return `৳ ${value.toLocaleString('en-BD')}`;
	}

	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
};
