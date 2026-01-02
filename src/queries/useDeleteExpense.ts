// src/queries/useDeleteExpense.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/contexts/ApiContext';

export function useDeleteExpense(year: number, month: number) {
	const api = useApi();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => api.del(`/expenses/${id}`),

		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: ['monthly-expenses', year, month],
			});
		},
	});
}
