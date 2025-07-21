// utils.ts

import { UUID } from 'crypto';

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
		User: {
			id: number;
			username: string;
		};
	}[];
}

export const colors = [
	'#03A791',
	'#81E7AF',
	'#077A7D',
	'#ACC572',
	'#A76545',
	'#8E1616',
	'#FF6363',
	'#CF0F47',
	'#6F826A',
	'#3D90D7',
	'#102E50',
	'#BE3D2A',
	'#328E6E',
	'#67AE6E',
	'#90C67C',
	'#169976',
	'#222222',
	'#74512D',
	'#123458',
	'#604652',
	'#735557',
	'#735557',
	'#522546',
	'#210F37',
	'#4F1C51',
	'#27548A',
	'#205781',
	'#4D55CC',
	'#2DAA9E',
	'#344CB7',
	'#16C47F',
	'#3E7B27',
	'#FFC145',
	'#543A14',
	'#0A5EB0',
];

export const formatCurrency = (value: number, currency: string = 'BDT') => {
	if (currency === 'BDT') {
		// return `৳ ${value?.toLocaleString('en-BD')}`;
		return `${value?.toLocaleString('en-BD')}`;
	}

	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
};

export interface TourDay {
	id: UUID;
	description: string;
	type: 'experience' | 'expense' | 'shopping';
	date: Date;
	location: string;
	amount: number | null;
	createdAt: Date;
	updatedAt?: Date;
	userId: string;
}

export interface Tour {
	id: UUID;
	name: string;
	startDate: Date;
	endDate: Date;
	totalCost: number;
	location: string;
	entries: TourDay[];
	isPublic: Boolean;
}
