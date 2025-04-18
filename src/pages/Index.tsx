import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import YearSummary from '@/components/YearSummary';
import MonthSummary from '@/components/MonthSummary';
import ExpenseSearch from '@/components/ExpenseSearch';
import ExpenseList, { Expense } from '@/components/ExpenseList';
import Footer from '@/components/Footer';
import { ApiResponse } from '@/utils/utils';
import { API_BASE_URL } from '@/config/Config';

const Index = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const nowDate = new Date();
	const thisYear = nowDate.getFullYear();
	const thisMonth = nowDate.getMonth() + 1;

	const fetchExpenseData = async () => {
		try {
			const response = await fetch(
				`${API_BASE_URL}/reports/monthly/list/${thisYear}/${thisMonth}`
			);
			if (!response.ok) {
				throw new Error(`API request failed with status ${response.status}`);
			}
			const data: ApiResponse = await response.json();
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

	const filteredExpenses = expenses.filter((expense) =>
		expense.description.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />

			<main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
				<YearSummary />
				<MonthSummary />

				<ExpenseSearch onSearch={handleSearch} />

				<ExpenseList
					expenses={filteredExpenses}
					isEditModeOn={false}
					onDeleteExpense={handleDeleteExpense}
				/>
			</main>

			<Footer />
		</div>
	);
};

export default Index;
