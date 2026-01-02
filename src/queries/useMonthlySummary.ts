// src/queries/useMonthlySummary.ts
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/contexts/ApiContext';
import { colors } from '@/utils/utils';

interface CategoryData {
	id: number;
	name: string;
	value: number;
	color: string;
}

interface ApiResponse {
	totalExpense: number;
	categoricalExpenses: {
		categoryId: number;
		categoryName: string;
		total: number;
	}[];
}

export function useMonthlySummary(year: number, month: number) {
	const api = useApi();

	return useQuery({
		queryKey: ['monthly-summary', year, month],
		queryFn: async () => {
			const data = await api.get(
				`/reports/monthly/${year}/${month}`
			) as ApiResponse;

			const categoryData: CategoryData[] = data.categoricalExpenses.map(
				(item, index) => ({
					id: item.categoryId,
					name: item.categoryName,
					value: item.total,
					color: colors[index % colors.length],
				})
			);

			return {
				monthTotal: data.totalExpense,
				monthData: categoryData,
			};
		},

		staleTime: 2 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});
}
