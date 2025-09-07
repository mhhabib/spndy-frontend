import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import YearSummary from '@/components/YearSummary';
import MonthSummary from '@/components/MonthSummary';
import ExpenseSearch from '@/components/ExpenseSearch';
import ExpenseList, { Expense } from '@/components/ExpenseList';
import Footer from '@/components/Footer';
import { ApiResponse } from '@/utils/utils';
import { useApiClient } from '@/utils/apiClient';

const Index = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [selectedCategoryId, setSelectedCategoryId] = useState<number>(-1);
	const nowDate = new Date();
	const thisYear = nowDate.getFullYear();
	const thisMonth = nowDate.getMonth() + 1;
	const apiClient = useApiClient();

	const fetchExpenseData = async () => {
		try {
			const data = await apiClient.get<ApiResponse>(
				`/reports/monthly/list/${thisYear}/${thisMonth}`
			);
			const sortedExpenses = data.expenses.sort((a, b) => {
				const dateDiff =
					new Date(b.date).getTime() - new Date(a.date).getTime();
				if (dateDiff !== 0) return dateDiff;
				return (
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			});
			setExpenses(sortedExpenses);
		} catch (err) {
			console.error('Error fetching expense data:', err);
		}
	};

	useEffect(() => {
		fetchExpenseData();
	}, []);

	const handleSearch = (query: string) => {
		setSearchQuery(query);
	};

	const handleDeleteExpense = (id: number) => {
		setExpenses(expenses.filter((expense) => expense.id !== id));
	};

	const filteredExpenses = expenses.filter((expense) => {
		const matchesSearch = expense.description
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const matchesCategory =
			selectedCategoryId === -1 || expense.CategoryId === selectedCategoryId;
		return matchesSearch && matchesCategory;
	});

	const shouldShowAnnualSummary = useMemo(() => {
		const savedAnnualSummary = localStorage.getItem('annualSummary');
		return savedAnnualSummary === 'true';
	}, []);

	const handleCategoryId = (id: number) => {
		setSelectedCategoryId(id);
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />

			<main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
				{shouldShowAnnualSummary && <YearSummary />}
				<MonthSummary onCategoryClick={(id: number) => handleCategoryId(id)} />

				<ExpenseSearch onSearch={handleSearch} />

				<ExpenseList
					expenses={filteredExpenses}
					isEditModeOn={false}
					isSelfExpense={false}
					onDeleteExpense={handleDeleteExpense}
				/>
			</main>

			<Footer />
		</div>
	);
};

export default Index;
