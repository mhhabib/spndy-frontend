export interface TourEntry {
	type: 'experience'| 'expense' | 'shopping';
	date: string;
	description: string;
	amount?: number;
	location?: string;
}

export interface Tour {
	id: string;
	name: string;
	startDate: string;
	endDate: string;
	location: string;
	totalCost: number;
	entries: TourEntry[];
	isPublic: boolean;
}
